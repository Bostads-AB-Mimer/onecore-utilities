import logger, { middlewares } from './logging/logger'
import loggedAxios from './logging/loggedAxios'
import * as axiosTypes from 'axios'

export { logger, loggedAxios, axiosTypes, middlewares as loggerMiddlewares }
