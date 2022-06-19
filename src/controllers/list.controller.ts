import { redisClient } from '../configs/dbConnection'
import TranslationCollection from '../modules/Translation'
import serverResponse from '@/utils/responses'
import messages from '@/configs/messages'

import type { Context, Next } from 'koa'

type PageSize = '10' | '20' | '50'

export async function getTranslationHistory(ctx: Context, next: Next) {
  const { pageSize = '20', cursor } = ctx.request.query as {
    pageSize: PageSize
    cursor: string
  }
  console.log('cursor', cursor)
  const redisKey = `${pageSize}:${cursor}`

  let decryptedCursor: string
  let collection
  // const cachedPage = await redisClient.get(redisKey)
  const cachedPage = null
  if (cachedPage) {
    collection = JSON.parse(cachedPage)
  } else {
    if (cursor) {
      // TODO: decrypted
      decryptedCursor = cursor

      collection = await TranslationCollection.find({ _id: { $gte: decryptedCursor } })
        .sort({ updatedAt: -1 })
        .limit(parseInt(pageSize) + 1)
        .exec()
    } else {
      collection = await TranslationCollection.find({})
        .sort({ updatedAt: -1 })
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

  const responseData = {
    list: collection.map((document) => document.toObject()),
    paging: {
      pageSize,
      next: nextCursor,
      hasMore,
    },
  }
  serverResponse.sendSuccess(ctx.response, messages.SUCCESSFUL, responseData)
  await next()
}

export async function getSavedTranslation(ctx: Context, next: Next) {
  let { pageSize = 20, page = 1 } = ctx.request.query as {
    pageSize: PageSize
    page: NumericString
  }
  pageSize = Number(pageSize)
  page = Number(page) < -1 ? 1 : Number(page)

  try {
    const collection = await TranslationCollection.find({ saved: true })
      .sort({ updatedAt: -1 })
      .skip(page > 0 ? (page - 1) * pageSize : 0)
      .limit(pageSize + 1)
      .exec()

    const hasMore = collection.length === pageSize + 1
    let nextPage: number | null = null
    if (hasMore) {
      nextPage = page + 1
      collection.pop()
    }

    const total = await countAllTranslation({ saved: true })

    const responseData = {
      list: collection.map((document) => document.toObject()),
      paging: {
        pageSize,
        next: nextPage,
        hasMore,
        total,
      },
    }
    serverResponse.sendSuccess(ctx.response, messages.SUCCESSFUL, responseData)
  } catch (error) {
    serverResponse.sendError(ctx.response, messages.BAD_REQUEST)
  }

  await next()
}

async function countAllTranslation(query = {}) {
  try {
    const count = await TranslationCollection.where(query).countDocuments()
    return count
  } catch (error) {
    throw Error(error)
  }
}
