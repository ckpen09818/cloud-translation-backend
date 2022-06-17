import Router from 'koa-router'
import { translate, getSupportLanguages, detectLanguage, changeSaveState } from '../controllers/translation.controller'

const router = new Router({
  prefix: '/language',
})

router.get('/list/:lan', getSupportLanguages)

router.post('/translate', translate)
router.post('/detect', detectLanguage)

router.patch('/saved', changeSaveState)

export default router
