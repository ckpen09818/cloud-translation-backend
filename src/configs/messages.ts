import { StatusCodes } from 'http-status-codes'

export default {
  INTERNAL_SERVER_ERROR: {
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Something unexpected happened',
    success: false,
  },
  SUCCESSFUL_DELETE: {
    code: StatusCodes.OK,
    message: 'Successfully deleted',
    success: true,
  },
  SUCCESSFUL_UPDATE: {
    code: StatusCodes.OK,
    message: 'Updated successfully',
    success: true,
  },
  SUCCESSFUL: {
    code: StatusCodes.OK,
    success: true,
    message: 'Successfully completed',
  },
  NOT_FOUND: {
    code: StatusCodes.NOT_FOUND,
    success: true,
    message: 'Requested API not found',
  },
  ALREADY_EXIST: {
    code: StatusCodes.OK,
    success: true,
    message: 'Already exists',
  },
  FORBIDDEN: {
    code: StatusCodes.FORBIDDEN,
    message: 'You are not authorized to complete this action',
    success: false,
  },
  BAD_REQUEST: {
    code: StatusCodes.BAD_REQUEST,
    message: 'Bad request. Please try again with valid parameters',
    success: false,
  },
  IN_COMPLETE_REQUEST: {
    code: StatusCodes.BAD_REQUEST,
    message: 'Required parameter missing',
    success: false,
  },
}
