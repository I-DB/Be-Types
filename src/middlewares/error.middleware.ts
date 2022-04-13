import { NextFunction, Request, Response } from 'express'
import HttpException from './exceptions/http.exception'

function errorMiddleware(
	error: HttpException,
	request: Request,
	response: Response,
	next: NextFunction
) {
	const status = error.status || 400
	const message = error.message || '에러가 발생했어요'
	const success = false
	response.status(status).send({
		status,
		message,
		success,
	})
}

export default errorMiddleware
