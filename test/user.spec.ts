import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'

import request from 'supertest'

describe('user router', async () => {
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

    return { user }
  }

  it('should register user', async () => {
    const { user } = generateDate()

    await request(app.server).post('/users/register').send(user).expect(201)
  })

  it('should user login', async () => {
    const { user } = generateDate()

    const registeredUserResponse = await request(app.server)
      .post('/users/register')
      .send(user)
      .expect(201)

    const cookies = registeredUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/users/login')
      .set('Cookie', cookies)
      .send(user)
      .expect(200)
  })
})
