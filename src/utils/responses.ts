import { StatusCodes } from 'http-status-codes'
import { Context } from 'koa'

type ResponseMessage<T = null> = {
  code: StatusCodes
  success: boolean
  message: string
  data?: T
}

const serverResponse = {
  sendSuccess: <T = null>(res: Context['response'], message: Omit<ResponseMessage, 'data'>, data?: T) => {
    const responseMessage: ResponseMessage<T> = {
      code: message.code,
      success: message.success,
      message: message.message,
    }

    if (data) {
      responseMessage.data = data
    }

    res.status = responseMessage.code
    res.body = responseMessage
  },
  sendError: (res: Context['response'], error) => {
    const responseMessage = {
      code: error.code ? error.code : 500,
      success: false,
      message: error.message,
    }
    res.status = responseMessage.code
    res.body = responseMessage
  },
}

export default serverResponse
