import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { compare, hash } from 'bcrypt'
import { randomUUID } from 'crypto'
import { setUserCookie } from '../utils/setUserCookie'

export async function userRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const getBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(3).max(20),
    })

    const { email, password } = getBodySchema.parse(request.body)

    const emailTarget = await knex('users').select().where({ email }).first()

    if (emailTarget?.email === email) {
      return reply.code(400).send({
        message: 'Email already registered',
      })
    }

    const hashedPassword = await hash(password, 10)
    const id = randomUUID()

    await knex('users').insert({
      id,
      email,
      password: hashedPassword,
    })

    setUserCookie(id, reply)
    return reply.code(201).send()
  })

  app.post('/login', async (request, reply) => {
    const getBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(3).max(20),
    })

    const { email, password } = getBodySchema.parse(request.body)

    const user = await knex('users').select().where({ email }).first()

    if (!user) {
      return reply.code(401).send({
        message: 'Invalid email or password',
      })
    }

    const validPassword = await compare(password, user.password)

    if (!validPassword) {
      return reply.code(401).send({
        message: 'Invalid email or password',
      })
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = user.id
      setUserCookie(user.id, reply)
    }

    return reply.code(200).send()
  })
}
