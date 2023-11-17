import { app } from './app'
import { env } from './env'

app
  .listen({ port: env.PORT })
  .then((address) => {
    console.log(`Server is listening on ${address}`)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
