import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'

export async function isAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  const isRegisted = await knex('users')
    .select()
    .where({ id: sessionId })
    .first()

  if (!isRegisted) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
