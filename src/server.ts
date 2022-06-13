import { createApp } from './app'
import { config } from 'dotenv'
config({ path: `.env.${process.env.NODE_ENV}` })

const port = process.env.PORT

async function startServer() {
  try {
    console.log(`environment set to ${process.env.NODE_ENV}`)
    const app = await createApp()
    app.listen(port)
    console.log(`listening on localhost:${port}`)
  } catch (error) {
    console.log('exception starting server: ', error)
  }
}

startServer()
