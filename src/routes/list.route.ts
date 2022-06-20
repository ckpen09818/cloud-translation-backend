import Router from 'koa-router'
import { getSavedTranslation, getHistoryTranslation, getHotTranslation } from '../controllers/list.controller'
const listRouter = new Router()

listRouter.prefix('/list')

listRouter.get('/translationHistory', getHistoryTranslation)
listRouter.get('/saved', getSavedTranslation)
listRouter.get('/hot', getHotTranslation)

export default listRouter
