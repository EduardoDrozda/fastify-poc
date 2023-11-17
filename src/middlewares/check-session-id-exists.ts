/* eslint-disable @typescript-eslint/consistent-type-imports */
import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists (request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return await reply.status(401).send({ error: 'Unauthorized' })
  }
}
