import * as mongoose from 'mongoose'
import Post from './post.interface'

const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		nickName: {
			type: String,
			required: true,
		},
		comments: [
			{
				nickName: String,
				userId: String,
				content: String,
			},
		],
		liked: {
			type: [String],
		},
	},
	{
		timestamps: true,
	}
)

const postModel = mongoose.model<Post & mongoose.Document>('Post', postSchema)
export default postModel
