import Router from 'koa-router'
import translation from './translation.route'
import list from './list.route'

const router = new Router()
router.prefix('/api')

router.use(translation.routes())
router.use(list.routes())

export default router
