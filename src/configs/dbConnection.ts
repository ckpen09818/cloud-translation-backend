import { connect } from 'mongoose'
import { createClient } from 'redis'

type RedisClient = ReturnType<typeof createClient>

export let redisClient: RedisClient
export async function redisConnection() {
  redisClient = createClient({ url: process.env.REDIS_URL })

  redisClient.on('error', (err) => console.log('Redis Client Error', err))

  await redisClient.connect()
  console.log('redis connecting!')
}

export async function dbConnection() {
  await connect(process.env.DB_URL, {
    dbName: 'dictionary',
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    autoIndex: process.env.NODE_ENV !== 'development',
  })
}
