import App from './app'
import PostsController from './posts/post.controller'
import UserController from './users/user.controller'

const app = new App([new PostsController(), new UserController()], 3000)

app.listen()
