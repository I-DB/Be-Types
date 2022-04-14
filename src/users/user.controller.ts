import * as express from 'express'
import HttpException from '../middlewares/exceptions/http.exception'
import Controller from '../interfaces/controller.interface'
import userModel from './user.schema'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import validationMiddleware from '../middlewares/validation.middleware'
import registerDto from './dtos/registerUser.dto'
import loginDto from './dtos/loginUser.dto'
import authMiddleware from '../middlewares/auth.middleware'

require('dotenv').config()

class UserController implements Controller {
	public router = express.Router()
	public path = '/user'
	public User = userModel

	constructor() {
		this.initializeRoutes()
	}

	public initializeRoutes() {
		this.router.post(`${this.path}/login`, validationMiddleware(loginDto), this.login) //로그인
		this.router.post(`${this.path}/join`, validationMiddleware(registerDto), this.userJoin) // 회원가입
		this.router.get(`${this.path}/auth`, authMiddleware, this.auth) // 회원인증
	}

	userJoin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const { userId, password, nickName } = req.body

		try {
			const chkExist = await this.User.exists({
				$or: [{ userId }, { nickName }],
			})
			if (chkExist) return next(new HttpException(400, '이메일 또는 닉네임이 이미 존재합니다'))
			const hashedpw = await bcrypt.hashSync(password, 10)

			const newUser = new this.User({
				userId,
				password: hashedpw,
				nickName,
			})
			await newUser.save()
			res.json({ success: true })
		} catch (error) {
			console.log(error)
		}
	}

	login = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const { userId, password } = req.body

		try {
			const chkUser = await this.User.findOne({ userId })
			if (!chkUser) return next(new HttpException(401, '아이디 또는 비밀번호를 다시 확인해주세요'))
			if (!bcrypt.compareSync(password, chkUser.password))
				return next(new HttpException(401, '아이디 또는 비밀번호를 다시 확인해주세요'))

			const token = jwt.sign({ userId: chkUser._id }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
			res.send({ success: true, token })
		} catch (error) {
			console.log(error)
		}
	}

	auth = async (req: express.Request, res: express.Response) => {
		const user = res.locals.user
		res.send({ success: true, user })
	}
}

export default UserController
