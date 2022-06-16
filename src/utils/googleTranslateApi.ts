/**
 * Google Translation API - Basic
 * {@link https://cloud.google.com/translate/docs/basic/detecting-language}
 */

import { v2 } from '@google-cloud/translate'

const googleTranslateApi = new v2.Translate()

async function translateText(text: string, target: ISO_639_1Code) {
  const [translations] = await googleTranslateApi.translate(text, target)
  return translations
}

async function listLanguages() {
  const [languages] = await googleTranslateApi.getLanguages()
  return languages
}

async function listLanguagesWithTarget(target: string) {
  // Lists available translation language with their names in a target language
  const [languages] = await googleTranslateApi.getLanguages(target)
  return languages
}

async function detectLanguage(text: string) {
  const [detections] = await googleTranslateApi.detect(text)
  return detections
}

export default {
  translateText,
  listLanguages,
  listLanguagesWithTarget,
  detectLanguage,
}
