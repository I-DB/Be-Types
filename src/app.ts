import * as express from 'express'
import * as mongoose from 'mongoose'
import * as bodyParser from 'body-parser'
import * as morgan from 'morgan'
import * as cookieParser from 'cookie-parser'
// import passport from './auth/passport/bearer.strategy'
import errorMiddleware from './middlewares/error.middleware'

const router = express.Router()
require('dotenv').config()

class App {
	public app: express.Application
	public port: number

	constructor(controllers, port) {
		this.app = express()
		this.port = port

		this.connectMongo()
		this.initializeMiddlewares()
		this.initializeControllers(controllers)
		this.initializeErrorHandling()
	}

	private initializeMiddlewares() {
		this.app.use(bodyParser.json())
		this.app.use(cookieParser())
		this.app.use(morgan('dev'))
	}

	private initializeControllers(controllers) {
		controllers.forEach((controller) => {
			this.app.use('/', controller.router)
		})
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware)
	}

	private connectMongo() {
		try {
			mongoose.connect(process.env.MONGO_URI)
			console.log('DB연결 완료')
		} catch (e) {
			console.log(e)
		}
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App listening on the port http://localhost:${this.port}`)
		})
	}
}

export default App
