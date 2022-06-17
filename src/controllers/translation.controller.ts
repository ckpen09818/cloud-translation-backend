import googleTranslationApi from '../utils/googleTranslateApi'
import TranslationCollection, { Translation } from '../modules/Translation'
import { redisClient } from '../configs/dbConnection'
import serverResponse from '@/utils/responses'

import type { Context, Next } from 'koa'
import type { LanguageResult } from '@google-cloud/translate/build/src/v2'
import messages from '@/configs/messages'

const createRedisKey = (text: string, translateTo: ISO_639_1Code) => `text:${text}:${translateTo}`

type TranslateQuery = {
  text: string
  translateTo: ISO_639_1Code
  translateFrom: ISO_639_1Code
}
type ResponseTranslationData = Pick<Translation, 'saved' | 'text' | 'translateTo'>
export async function translate(ctx: Context, next: Next) {
  //TODO: add validation
  const { text, translateTo, translateFrom } = ctx.request.query as TranslateQuery
  const redisKey = createRedisKey(text, translateTo)

  try {
    const cachedTranslation = await redisClient.get(redisKey)
    if (cachedTranslation) {
      TranslationCollection.updateOne({ originalText: text, translateTo }, { $inc: { impressions: 1 } }).exec()

      serverResponse.sendSuccess(
        ctx.response,
        messages.SUCCESSFUL,
        JSON.parse(cachedTranslation) as ResponseTranslationData,
      )

      return await next()
    }
  } catch (error) {
    serverResponse.sendError(ctx.response, messages.BAD_REQUEST)
  }

  try {
    const existingTranslation = await TranslationCollection.findOne({ originalText: text, translateTo })

    let responseData: ResponseTranslationData
    if (existingTranslation) {
      const { text, translateTo, saved } = existingTranslation
      responseData = { text, translateTo, saved }
    } else {
      const translatedText = await googleTranslationApi.translateText(text, translateTo)
      try {
        const newTranslation = await TranslationCollection.create({
          originalText: text,
          text: translatedText,
          translateTo,
          translateFrom,
        })

        responseData = {
          text: newTranslation.text,
          translateTo: newTranslation.translateTo,
          saved: newTranslation.saved,
        }

        redisClient.set(redisKey, JSON.stringify(responseData))
      } catch (error) {
        throw new Error('create new translation error!', error)
      }
    }

    serverResponse.sendSuccess(ctx.response, messages.SUCCESSFUL, responseData)
  } catch (error) {
    serverResponse.sendError(ctx.response, messages.BAD_REQUEST)
  }

  await next()
}

export async function getSupportLanguages(ctx: Context, next: Next) {
  const { lan } = ctx.params as { lan?: ISO_639_1Code }

  try {
    let resp: LanguageResult[]

    if (lan) {
      resp = await googleTranslationApi.listLanguagesWithTarget(lan)
    } else {
      resp = await googleTranslationApi.listLanguages()
    }

    serverResponse.sendSuccess(ctx.response, messages.SUCCESSFUL, resp)
  } catch (error) {
    serverResponse.sendError(ctx.response, messages.BAD_REQUEST)
  }

  await next()
}

export async function detectLanguage(ctx: Context, next: Next) {
  const { text } = ctx.request.query as { text: string }

  try {
    const resp = await googleTranslationApi.detectLanguage(text)
    serverResponse.sendSuccess(ctx.response, messages.SUCCESSFUL, resp)
  } catch (error) {
    serverResponse.sendError(ctx.response, messages.BAD_REQUEST)
  }

  await next()
}

// TODO: save function
export async function changeSaveState(ctx: Context, next: Next) {
  const { text, translateTo, saved } = ctx.request.body as { text: string; translateTo: ISO_639_1Code; saved: boolean }
  const redisKey = createRedisKey(text, translateTo)

  try {
    await TranslationCollection.findOneAndUpdate({ text, translateTo }, { $set: { saved } })
    const cachedTranslation = await redisClient.get(redisKey)
    if (cachedTranslation) {
      const translation = JSON.parse(cachedTranslation) as ResponseTranslationData
      translation.saved = saved
      redisClient.set(redisKey, JSON.stringify(translation))
    } else {
      const newTranslation: ResponseTranslationData = {
        text,
        translateTo,
        saved,
      }
      redisClient.set(redisKey, JSON.stringify(newTranslation))
    }
    serverResponse.sendSuccess(ctx.response, messages.SUCCESSFUL)
  } catch (error) {
    serverResponse.sendError(ctx.response, messages.BAD_REQUEST)
  }

  await next()
}
