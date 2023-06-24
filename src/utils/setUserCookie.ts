import { FastifyReply } from 'fastify'

export function setUserCookie(id: string, reply: FastifyReply) {
  reply.cookie('sessionId', id, {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 Day
  })
}
