import { type FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes (app: FastifyInstance): Promise<any> {
  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const { sessionId } = request.cookies

    if (!sessionId) {
      return await reply.status(401).send({ error: 'Unauthorized' })
    }

    const transactions = await knex('transactions').select('*').where({ session_id: sessionId })
    return { transactions }
  })

  app.get('/:id', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const { sessionId } = request.cookies
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').select('*').where({ id, session_id: sessionId }).first()
    return { transaction }
  })

  app.get('/summary', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const { sessionId } = request.cookies
    const summary = await knex('transactions').sum('amount', { as: 'amount' }).where({ session_id: sessionId }).first()
    return await reply.code(200).send({ summary })
  })

  app.post('/', async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    })

    const { title, amount, type } = createTransactionSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })

    return await reply.code(201).send()
  })
}
