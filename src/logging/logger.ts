import pino from 'pino'
import pinoElastic from 'pino-elasticsearch'
import { multistream } from 'pino-multi-stream'
import pretty from 'pino-pretty'
import Koa from 'koa'
import { randomUUID } from 'crypto'

const streamToElastic = pinoElastic({
  index: 'onecore-logging',
  node: process.env.ELASTICSEARCH_LOGGING_HOST || 'http://localhost:9200',
  esVersion: 8,
  flushBytes: 100,
  flushInterval: 1000,
})

streamToElastic.on('error', (error: any) => console.log(error))
streamToElastic.on('insertError', (error: any) => console.log(error))

const prettyStream = pretty({
  colorize: true,
  ignore: 'application,request',
  singleLine: true,
  messageFormat: '{msg} {request.path} {request.status}',
})

const pinoOptions = {}

const logger = pino(
  pinoOptions,
  multistream([{ stream: prettyStream }, { stream: streamToElastic }])
).child({ application: { name: 'core', environment: process.env.NODE_ENV } })

export default logger

const getCorrelationId = (
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>
) => {
  return ctx.header['x-correlation-id'] ?? randomUUID()
}

export const middlewares = {
  pre: (
    ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>,
    next: Koa.Next
  ) => {
    if (ctx.path !== '/health') {
      ctx.logger = logger.child({ correlationId: getCorrelationId(ctx) })

      ctx.logger.info(
        {
          request: {
            path: ctx.path,
            user: ctx.state?.user,
            method: ctx.method,
          },
        },
        'Incoming request'
      )
    }

    return next()
  },
  post: async (
    ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>,
    next: Koa.Next
  ) => {
    await next()

    if (ctx.path !== '/health') {
      ctx.logger.info(
        {
          request: {
            path: ctx.path,
            user: ctx.state?.user,
            method: ctx.method,
            status: ctx.status,
          },
        },
        'Incoming request complete'
      )
    }
  },
}
