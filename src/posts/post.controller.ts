import * as express from 'express'
import Post from './post.interface'
import postModel from './post.schema'
import Controller from '../interfaces/controller.interface'
import authMiddleware from '../middlewares/auth.middleware'
import HttpException from '../middlewares/exceptions/http.exception'

class PostController implements Controller {
	public path = '/post'
	public commentPath = '/post/:postId/comment'
	public likePath = '/post/like/:postId'
	public router = express.Router()
	private Post = postModel

	constructor() {
		this.initializeRoutes()
	}

	public initializeRoutes() {
		this.router.get(this.path, this.getAllposts) //게시글 리스트
		this.router.get(`${this.path}/:postId`, this.getPostById) // 게시글 상세
		this.router.post(this.path, authMiddleware, this.createPost) // 게시글 작성
		this.router.patch(`${this.path}/:postId`, authMiddleware, this.updatePost)
		this.router.delete(`${this.path}/:postId`, authMiddleware, this.deletePost)

		this.router.post(this.commentPath, authMiddleware, this.createComment)
		this.router.patch(this.commentPath, authMiddleware, this.updateComment)
		this.router.delete(this.commentPath, authMiddleware, this.deleteComment)

		this.router.patch(this.likePath, authMiddleware, this.likePost)
	}

	getAllposts = async (req: express.Request, res: express.Response) => {
		const posts = await this.Post.find()
		res.send(posts)
	}

	createPost = async (req: express.Request, res: express.Response) => {
		try {
			const { title, content } = req.body
			const { userId, nickName } = res.locals.user

			const createPost = new this.Post({
				title,
				content,
				userId,
				nickName,
			})

			await createPost.save()
			res.json({ success: true })
		} catch (error) {
			res.send({ error })
		}
	}

	getPostById = async (req: express.Request, res: express.Response) => {
		const { postId } = req.params
		const post = await this.Post.findById(postId)
		res.json(post)
	}

	updatePost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		try {
			const { postId } = req.params
			const docs: Post = req.body
			const { user } = res.locals

			const chkPost = await this.chkPostWithUserId(postId, user.userId)
			if (!chkPost) return next(new HttpException(401, '글의 작성자만 수정이 가능합니다'))

			await this.Post.updateOne(
				{ _id: postId },
				{ $set: { title: docs.title, content: docs.content } }
			)
			res.json({ success: true })
		} catch (error) {
			res.send({ error })
		}
	}

	deletePost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		try {
			const { postId } = req.params
			const { user } = res.locals
			const chkPost = await this.chkPostWithUserId(postId, user.userId)
			if (!chkPost) return next(new HttpException(401, '글의 작성자만 삭제할 수 있습니다'))

			await this.Post.deleteOne({ postId, userId: user.userId })
			res.json({ success: true })
		} catch (error) {
			res.send({ error })
		}
	}

	createComment = async (req: express.Request, res: express.Response) => {
		const { postId } = req.params
		const { content } = req.body
		const { user } = res.locals

		try {
			await this.Post.updateOne(
				{ _id: postId },
				{
					$push: {
						comments: {
							content,
							userId: user.userId,
							nickName: user.nickName,
						},
					},
				}
			)
			res.json({ success: true })
		} catch (error) {
			res.send({ error })
		}
	}

	updateComment = async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		const { postId } = req.params
		const { content, commentId } = req.body
		const { user } = res.locals
		try {
			const chkComment = await this.chkCommentWithUserId(postId, user.userId, commentId)
			if (!chkComment) return next(new HttpException(401, '댓글 작성자만 수정할 수 있습니다'))
			this.Post.findOne({ _id: postId }, (err, result) => {
				result.comments.id(commentId).content = content
				result.save()
			})
			res.send({ success: true })
		} catch (error) {
			res.send({ error })
		}
	}

	deleteComment = async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		const { postId } = req.params
		const { commentId } = req.body
		const { user } = res.locals

		try {
			const chkComment = await this.chkCommentWithUserId(postId, user.userId, commentId)
			if (!chkComment) return next(new HttpException(401, '댓글 작성자만 삭제할 수 있습니다'))
			this.Post.findOne({ _id: postId }, (err, result) => {
				result.comments.id(commentId).remove()
				result.save()
			})
			res.send({ success: true })
		} catch (error) {
			res.send({ error })
		}
	}

	likePost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const { postId } = req.params
		const { user } = res.locals

		try {
			const chkLike = await this.chkLike(postId, user.userId)
			if (chkLike) {
				await this.Post.updateOne({ _id: postId }, { $pull: { liked: user.userId } })
				res.send({ success: true, message: '추천취소 완료' })
			} else {
				await this.Post.updateOne({ _id: postId }, { $push: { liked: user.userId } })
				res.send({ success: true, message: '추천 완료' })
			}
		} catch (error) {
			res.send({ error })
		}
	}

	chkPostWithUserId = async (postId, userId) => {
		const result = await this.Post.findOne({ _id: postId, userId })
		return result
	}

	chkCommentWithUserId = async (postId, userId, commentId) => {
		const result = await this.Post.findOne({
			_id: postId,
			comments: {
				$elemMatch: {
					_id: commentId,
					userId: userId,
				},
			},
		})
		return result
	}

	chkLike = async (postId, userId) => {
		const result = await this.Post.findOne({ _id: postId, liked: userId })
		return result
	}
}

export default PostController
