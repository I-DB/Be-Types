import * as redis from 'redis'
const port = process.env.REDIS_PORT

const redisClient = redis.createClient(port)

export default redisClient
