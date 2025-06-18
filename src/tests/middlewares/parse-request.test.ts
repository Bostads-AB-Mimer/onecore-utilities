import request from 'supertest'
import Koa from 'koa'
import KoaRouter from '@koa/router'
import bodyParser from '@koa/bodyparser'
import { expectType } from 'jest-tsd'
import { z } from 'zod/v4'

import { parseRequest } from '../../middlewares/parse-request'

describe(parseRequest, () => {
  describe('parsing', () => {
    const app = new Koa()
    app.use(bodyParser())
    app.use(
      parseRequest({
        body: z.object({ foo: z.string() }),
        query: z.object({ bar: z.string() }),
      })
    )

    app.use((ctx) => {
      ctx.status = 200
    })

    it('responds with 400 when body is invalid', async () => {
      const response = await request(app.callback())
        .post('/')
        .send({ foo: { foo: 'bar' } })

      expect(response.status).toBe(400)
    })

    it('responds with 400 when query is invalid', async () => {
      const response = await request(app.callback())
        .get('/')
        .query({ asdf: 123 })
      expect(response.status).toBe(400)
    })

    it('formats errors', async () => {
      const response = await request(app.callback())
        .post('/')
        .send({ asdf: 123 })
      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        status: 'request-body-err',
        data: [{ message: expect.any(String), path: ['foo'] }],
      })
    })

    it('responds with 200 when body and query are valid', async () => {
      const response = await request(app.callback())
        .post('/')
        .query({ bar: 'baz' })
        .send({ foo: 'bar' })

      expect(response.status).toBe(200)
    })
  })

  describe('types', () => {
    const bodySchema = z.object({ foo: z.string() })
    const querySchema = z.object({ bar: z.string() })

    type Body = z.infer<typeof bodySchema>
    type Query = z.infer<typeof querySchema>

    new KoaRouter().get(
      '/',
      parseRequest({
        body: z.object({ foo: z.string() }),
        query: z.object({ bar: z.string() }),
      }),
      (ctx) => {
        expectType<Body>(ctx.request.parsed_body)
        expectType<Query>(ctx.request.parsed_query)
      }
    )
  })
})
