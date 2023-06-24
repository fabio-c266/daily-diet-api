import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function snackRoutes(app: FastifyInstance) {
  app.addHook('preHandler', isAuthenticated)

  app.post('/', async (request, reply) => {
    const { sessionId } = request.cookies

    const getBodyShema = z.object({
      name: z.string(),
      description: z.string().optional(),
      isInDiet: z.boolean(),
    })

    const { name, description, isInDiet } = getBodyShema.parse(request.body)

    await knex('snacks').insert({
      id: randomUUID(),
      user_id: sessionId,
      name,
      description,
      is_in_diet: isInDiet,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const { sessionId } = request.cookies

    const snacks = await knex('snacks').select().where({ user_id: sessionId })

    return reply.status(200).send({
      snacks,
    })
  })

  app.get('/:id', async (request, reply) => {
    const getParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getParamsSchema.parse(request.params)
    const { sessionId } = request.cookies

    const snack = await knex('snacks')
      .select()
      .where({ id, user_id: sessionId })

    return reply.status(200).send({
      snack,
    })
  })

  app.get('/summary', async (request, reply) => {
    const { sessionId } = request.cookies
    const summary = await knex('snacks')
      .select(
        knex.raw(
          'count(*) filter (where is_in_diet = true) as totalWithinDiet',
        ),
        knex.raw(
          'count(*) filter (where is_in_diet = false) as totalOutsideDiet',
        ),
        knex.raw('count(*) as total'),
      )
      .where({ user_id: sessionId })

    return reply.status(200).send({
      summary,
    })
  })

  app.put('/:id', async (request, reply) => {
    const getParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getParamsSchema.parse(request.params)

    const getBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isInDiet: z.boolean().optional(),
    })

    const { name, description, isInDiet } = getBodySchema.parse(request.body)
    const { sessionId } = request.cookies

    await knex('snacks').where({ id, user_id: sessionId }).update({
      name,
      description,
      is_in_diet: isInDiet,
    })

    return reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const getParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getParamsSchema.parse(request.params)
    const { sessionId } = request.cookies

    await knex('snacks').where({ id, user_id: sessionId }).delete()

    return reply.status(202).send()
  })
}
