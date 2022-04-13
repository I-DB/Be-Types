import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'
import redisClient from '../../redis/redis'
import User from '../../users/interfaces/user.inteface'

module.exports = {
	sign: (user: User) => {
		const payload = {
			userId: user.userId,
			nickName: user.nickName,
		}
		return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
	},
	verify: (token) => {
		try {
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
			return decoded
		} catch (error) {
			return error
		}
	},
	refresh: (user) => {
		return jwt.sign(user._id, process.env.REFRESH_TOKEN, { expiresIn: '1d' })
	},
	refreshVerify: async (token, id) => {
		const getAsync = promisify(redisClient.get).bind(redisClient)

		try {
			const data = await getAsync(id)
			if (token === data) {
				try {
					jwt.verify(token, process.env.REFRESH_TOKEN)
					return true
				} catch (error) {
					return false
				}
			} else return false
		} catch (error) {
			return false
		}
	},
}
export function sign(
	chkUser: import('../../users/interfaces/user.inteface').default &
		import('mongoose').Document<any, any, any> & { _id: any }
) {
	throw new Error('Function not implemented.')
}
