import Router from 'koa-router'
import { translate, getSupportLanguages, getDetectLanguage } from '../controllers/translation.controller'

const router = new Router({
  prefix: '/language',
})

router.get('/list/:lan', getSupportLanguages)
router.post('/translate', translate)
router.post('/detect', getDetectLanguage)

export default router
