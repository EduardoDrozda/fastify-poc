import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Salário',
        amount: 3000,
        type: 'credit'
      }).expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Salário',
        amount: 3000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponseBody = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
    expect(200)

    expect(listTransactionResponseBody.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Salário',
        amount: 3000,
        session_id: expect.any(String),
        created_at: expect.any(String)
      })
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Salário',
        amount: 3000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponseBody = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listTransactionResponseBody.body.transactions[0].id

    const getTransactionResponseBody = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(200)

    expect(getTransactionResponseBody.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Salário',
        amount: 3000,
        session_id: expect.any(String),
        created_at: expect.any(String)
      })
    )
  })

  it('should be able to get the summary of transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Salário',
        amount: 3000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freela',
        amount: 2000,
        type: 'credit'
      })
      .set('Cookie', cookies)

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Aluguel',
        amount: 1000,
        type: 'debit'
      })
      .set('Cookie', cookies)

    const getTransactionResponseBody = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(200)

    expect(getTransactionResponseBody.body).toEqual(
      expect.objectContaining({
        summary: {
          amount: 4000
        }
      })
    )
  })
})
