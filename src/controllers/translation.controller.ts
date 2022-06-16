import { detectLanguage, listLanguages, listLanguagesWithTarget, translateText } from '../utils/googleTranslateApi'
import { StatusCodes } from 'http-status-codes'
import TranslationCollection from '../modules/Translation'
import { redisClient } from '../configs/dbConnection'

import type { Context, Next } from 'koa'
import type { LanguageResult } from '@google-cloud/translate/build/src/v2'

type TranslateQuery = {
  text: string
  translateTo: ISO_639_1Code
  translateFrom: ISO_639_1Code
}
export async function translate(ctx: Context, next: Next) {
  //TODO: add validation
  const { text, translateTo, translateFrom } = ctx.request.query as TranslateQuery

  const redisKey = `text:${text}:${translateTo}`

  try {
    const cachedText = await redisClient.get(redisKey)
    if (cachedText) {
      TranslationCollection.updateOne({ originalText: text, translateTo }, { $inc: { impressions: 1 } }).exec()

      ctx.response.body = { data: cachedText }
      ctx.response.status = StatusCodes.OK
      return await next()
    }
  } catch (error) {
    ctx.response.body = error
  }

  try {
    const existingText = await TranslationCollection.findOne({ originalText: text, translateTo })

    let translatedText: string
    if (existingText) {
      translatedText = existingText.text
    } else {
      translatedText = await translateText(text, translateTo)

      await TranslationCollection.create(
        { originalText: text, text: translatedText, translateTo, translateFrom },
        (err) => {
          if (err) {
            console.log('create document err', err)
          }
          redisClient.set(redisKey, translatedText)
        },
      )
    }

    ctx.response.status = StatusCodes.OK
    ctx.response.body = { data: translatedText }
  } catch (error) {
    ctx.response.body = error
  }

  await next()
}

export async function getSupportLanguages(ctx: Context, next: Next) {
  const { lan } = ctx.params as { lan?: ISO_639_1Code }

  try {
    let resp: LanguageResult[]

    if (lan) {
      resp = await listLanguagesWithTarget(lan)
    } else {
      resp = await listLanguages()
    }

    ctx.response.body = { data: resp }
    ctx.response.status = StatusCodes.OK
  } catch (error) {
    ctx.response.body = error
  }

  await next()
}

export async function getDetectLanguage(ctx: Context, next: Next) {
  const { text } = ctx.request.query as { text: string }

  try {
    const resp = await detectLanguage(text)
    ctx.response.body = { data: resp }
    ctx.response.status = StatusCodes.OK
  } catch (error) {
    ctx.response.body = error
  }

  await next()
}
