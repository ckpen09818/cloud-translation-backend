import TranslationCollection from '../modules/Translation'
import serverResponse from '@/utils/responses'
import messages from '@/configs/messages'

import type { Context, Next } from 'koa'
import { type Query } from 'mongoose'

async function countAllTranslation(query = {}) {
  try {
    const count = await TranslationCollection.where(query).countDocuments()
    return count
  } catch (error) {
    throw Error(error)
  }
}

type QuerySortArgs = Parameters<Query<any, any>['sort']>[0]
function getTranslationList(query = {}, sortQuery: QuerySortArgs = { updatedAt: -1 }) {
  return async (ctx: Context, next: Next) => {
    let { pageSize = 20, page = 1 } = ctx.request.query as {
      pageSize: PageSize
      page: NumericString
    }
    pageSize = Number(pageSize)
    page = Number(page) < -1 ? 1 : Number(page)

    try {
      const collection = await TranslationCollection.find(query)
        .sort(sortQuery)
        .skip(page > 0 ? (page - 1) * pageSize : 0)
        .limit(pageSize + 1)
        .exec()

      const hasMore = collection.length === pageSize + 1
      let nextPage: number | null = null
      if (hasMore) {
        nextPage = page + 1
        collection.pop()
      }

      const total = await countAllTranslation(query)

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
}

export const getSavedTranslation = getTranslationList({ saved: true })
export const getHistoryTranslation = getTranslationList({})
export const getHotTranslation = getTranslationList({}, { impressions: -1 })
