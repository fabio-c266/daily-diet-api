import { it, describe, beforeAll, afterAll, beforeEach } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'

import request from 'supertest'

describe('snack router', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --al')
    execSync('npm run knex migrate:latest')
  })

  const generateDate = () => {
    const user = {
      email: 'fabiocaldas266@gmail.com',
      password: '1234',
    }

    const snack = {
      name: 'Hamburguer',
      description: 'Gordura em formato de pão',
      isInDiet: false,
    }

    return { user, snack }
  }

  it('should create snack', async () => {
    const { user, snack } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/snacks')
      .set('Cookie', cookies)
      .send(snack)
      .expect(201)
  })

  it('should get user snack', async () => {
    const { user } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server).get('/snacks').set('Cookie', cookies).expect(200)
  })

  it('should get especific user snack', async () => {
    const { user, snack } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server).post('/snacks').set('Cookie', cookies).send(snack)

    const snacks = await request(app.server)
      .get('/snacks')
      .set('Cookie', cookies)

    await request(app.server)
      .get(`/snacks/${snacks.body.snacks[0].id}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should get summary', async () => {
    const { user } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server)
      .get('/snacks/summary')
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should alter snack date', async () => {
    const { user, snack } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server).post('/snacks').set('Cookie', cookies).send(snack)

    const snacks = await request(app.server)
      .get('/snacks')
      .set('Cookie', cookies)

    const snackId = snacks.body.snacks[0].id

    await request(app.server)
      .put(`/snacks/${snackId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Melância',
        description: 'Fruta vermelha',
        isInDiet: true,
      })
      .expect(201)
  })

  it('should delete snack', async () => {
    const { user, snack } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server).post('/snacks').set('Cookie', cookies).send(snack)

    const snacks = await request(app.server)
      .get('/snacks')
      .set('Cookie', cookies)

    const snackId = snacks.body.snacks[0].id

    await request(app.server)
      .delete(`/snacks/${snackId}`)
      .set('Cookie', cookies)
      .expect(202)
  })
})
