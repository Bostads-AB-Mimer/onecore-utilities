/**
 * Koa middleware that parses
 * request body and/or query parameters using Zod schemas.
 *
 * `ContextWithParsedRequest` extends the Koa context using
 * a bit of a TS 'hack', which I think is acceptable as it's
 * contained in this file.
 *
 * By extending the request type
 * we pass along the extended type into the next middleware, i.e the route,
 * giving type inference on the parsed input.
 */

import { ExtendableContext, Next, Request } from 'koa'
import { z } from 'zod'

type ContextWithParsedRequest<B, Q> = ExtendableContext & {
  request: Request & {
    body: unknown
    parsed_body: B extends z.ZodType ? z.infer<B> : never
    parsed_query: Q extends z.ZodType ? z.infer<Q> : never
  }
}

export function parseRequest<T extends z.ZodType, Q extends z.ZodType>(params: {
  body?: T
  query?: Q
}) {
  return function (ctx: ContextWithParsedRequest<T, Q>, next: Next) {
    if (params.body) {
      const parseResult = params.body.safeParse(ctx.request.body)
      if (!parseResult.success) {
        ctx.status = 400
        ctx.body = {
          status: 'request-body-err',
          data: mapError(parseResult.error),
        }
        return
      }

      ctx.request.parsed_body = parseResult.data
    }

    if (params.query) {
      const parseResult = params.query.safeParse(ctx.request.query)
      if (!parseResult.success) {
        ctx.status = 400
        ctx.body = {
          status: 'request-query-err',
          data: mapError(parseResult.error),
        }
        return
      }
      ctx.request.parsed_query = parseResult.data
    }

    return next()
  }
}

function mapError(error: z.ZodError) {
  return error.issues.map(({ message, path }) => ({
    message,
    path,
  }))
}
