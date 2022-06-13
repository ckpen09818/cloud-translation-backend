import { detectLanguage, listLanguages, listLanguagesWithTarget, translateText } from '../utils/googleTranslateApi'
import { StatusCodes } from 'http-status-codes'
import DictionaryCollection from '../modules/Dictionary'
import { redisClient } from '../configs/dbConnection'

import type { Context, Next } from 'koa'
import type { LanguageResult } from '@google-cloud/translate/build/src/v2'

export async function translate(ctx: Context, next: Next) {
  const { text, language } = ctx.request.query as { text: string; language: string }
  const redisKey = `text:${text}:${language}`

  try {
    const cachedText = await redisClient.get(redisKey)
    if (cachedText) {
      DictionaryCollection.updateOne({ key: text }, { $inc: { count: 1 } }).exec()

      ctx.response.body = { data: cachedText }
      ctx.response.status = StatusCodes.OK
      return
    }
  } catch (error) {
    ctx.response.body = error
  }

  try {
    const existingText = await DictionaryCollection.findOne({ key: text })

    let translatedText: string
    if (existingText) {
      translatedText = existingText.text
    } else {
      translatedText = await translateText(text, language)

      await DictionaryCollection.create({ key: text, text: translatedText, language }, function (err) {
        if (err) {
          console.log('create document err', err)
        }
        redisClient.set(redisKey, translatedText)
      })
    }

    ctx.response.status = StatusCodes.OK
    ctx.response.body = { text: translatedText }
  } catch (error) {
    ctx.response.body = error
  }

  await next()
}

export async function getLanguages(ctx: Context, next: Next) {
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

export async function getDetectLanguages(ctx: Context, next: Next) {
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
