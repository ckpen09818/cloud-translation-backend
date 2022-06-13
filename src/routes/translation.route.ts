import Router from 'koa-router'
import { translate, getLanguages, getDetectLanguages } from '../controllers/translate.controller'

const router = new Router({
  prefix: '/language',
})

router.get('/translate', translate)
router.get('/list/:lan', getLanguages)
router.get('/detect', getDetectLanguages)

export default router
