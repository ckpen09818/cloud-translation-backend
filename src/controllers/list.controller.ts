import { StatusCodes } from 'http-status-codes'
import { redisClient } from '../configs/dbConnection'
import TranslationCollection from '../modules/Translation'

import type { Context, Next } from 'koa'

type PageSize = '10' | '20' | '50'

export async function getSearchHistory(ctx: Context, next: Next) {
  const { pageSize = '20', cursor } = ctx.request.query as {
    pageSize: PageSize
    cursor: string
  }
  const redisKey = `${pageSize}:${cursor}`

  let decryptedCursor: string
  let collection
  const cachedPage = await redisClient.get(redisKey)
  if (cachedPage) {
    collection = JSON.parse(cachedPage)
  } else {
    if (cursor) {
      // TODO: decrypted
      decryptedCursor = cursor
      collection = await TranslationCollection.find({
        _id: { $gte: decryptedCursor },
      })
        .limit(parseInt(pageSize) + 1)
        .exec()
    } else {
      collection = await TranslationCollection.find()
        .limit(parseInt(pageSize) + 1)
        .exec()
    }

    redisClient.set(redisKey, JSON.stringify(collection))
  }

  const hasMore = collection.length === pageSize + 1
  let nextCursor: string | null = null
  if (hasMore) {
    const nextCursorRecord = collection[pageSize]._id.toString()
    //TODO: encrypt
    nextCursor = nextCursorRecord
    collection.pop()
  }

  ctx.body = {
    data: collection.map((document) => {
      document?.toObject?.()
      delete document._id
      return document
    }),
    paging: {
      pageSize,
      nextCursor,
      hasMore,
    },
  }
  ctx.status = StatusCodes.OK
  await next()
}
