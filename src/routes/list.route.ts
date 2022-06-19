import Router from 'koa-router'
import { getSavedTranslation, getTranslationHistory } from '../controllers/list.controller'
const listRouter = new Router()

listRouter.prefix('/list')

listRouter.get('/translationHistory', getTranslationHistory)
listRouter.get('/saved', getSavedTranslation)

export default listRouter
