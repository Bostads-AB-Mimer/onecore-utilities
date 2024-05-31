import pino from 'pino';
import Koa from 'koa';
export { default as loggedAxios } from 'axios';

declare const logger: pino.Logger<never>;
declare const middlewares: {
    pre: (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, next: Koa.Next) => Promise<any>;
    post: (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, next: Koa.Next) => Promise<void>;
};

export { logger, middlewares as loggerMiddlewares };
