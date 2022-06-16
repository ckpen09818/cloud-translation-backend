import Router from 'koa-router'
import { getSearchHistory } from '../controllers/list.controller'
const listRouter = new Router()

listRouter.prefix('/list')

listRouter.get('/searchHistory', getSearchHistory)

export default listRouter
