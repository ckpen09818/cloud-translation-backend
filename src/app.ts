import Koa from 'koa'

import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import helmet from 'koa-helmet'
import cors from '@koa/cors'

import router from './routes'

import { dbConnection, redisConnection } from './configs/dbConnection'

export async function createApp() {
  const app = new Koa()
  try {
    await dbConnection()
    console.log('database connection')
    await redisConnection()
  } catch (err) {
    console.error('database error', err)
  }

  app.use(bodyparser()).use(logger()).use(helmet()).use(router.routes())

  if (process.env.NODE_ENV === 'development') {
    app.use(cors())
  }

  return app
}
