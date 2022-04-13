import UserModel from '../../src/users/user.inteface' // <- User class

declare global {
	namespace Express {
		export interface User {
			userId: string
			nickName: string
		}
	}
}
