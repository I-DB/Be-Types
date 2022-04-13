import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import User from '../users/user.schema'
import inToken from '../users/interfaces/inToken.interface'

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const [tokenType, tokenValue] = req.header('Authorization').split(' ')
		if (tokenType !== 'Bearer') res.send({ authResult: false })
		const verifyToken = jwt.verify(tokenValue, process.env.ACCESS_TOKEN) as inToken
		const user = await User.findById(verifyToken.userId).select(['_id', 'userId', 'nickName'])
		if (user) {
			res.locals.user = user
			next()
		} else res.send({ authResult: false })
	} catch (error) {
		res.send({ authResult: false, error })
	}
}

export default authMiddleware
