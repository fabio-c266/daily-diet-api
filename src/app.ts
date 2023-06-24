import { fastify } from 'fastify'
import { userRoutes } from './routes/user'
import { snackRoutes } from './routes/snack'

import cookies = require('@fastify/cookie')
const app = fastify()

app.register(cookies)
app.register(userRoutes, {
  prefix: '/users',
})
app.register(snackRoutes, {
  prefix: '/snacks',
})

export { app }
