import * as mongoose from 'mongoose'
import User from './interfaces/user.inteface'

const userSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},
		nickName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema)
export default userModel
