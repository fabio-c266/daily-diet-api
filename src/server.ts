import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log(`🚀 App is running on http://localhost${env.PORT}`))
