import Router from 'koa-router'
import { getSearchHistory } from '../controllers/list.controller'
const listRouter = new Router()

listRouter.get('/list', getSearchHistory)

export default listRouter
