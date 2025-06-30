import pino from 'pino';
import * as Koa from 'koa';
import Koa__default, { Context } from 'koa';
import axios__default from 'axios';
import * as axios from 'axios';
export { axios as axiosTypes };
export { default as loggedAxios } from 'axios';
import { AsyncLocalStorage } from 'async_hooks';
import KoaRouter from '@koa/router';
import { z } from 'zod';

declare const logger: pino.Logger<never>;
declare const middlewares: {
    pre: (ctx: Koa__default.ParameterizedContext<Koa__default.DefaultState, Koa__default.DefaultContext, any>, next: Koa__default.Next) => Promise<any>;
    post: (ctx: Koa__default.ParameterizedContext<Koa__default.DefaultState, Koa__default.DefaultContext, any>, next: Koa__default.Next) => Promise<void>;
};

declare const setExclusionFilters: (exlusionFilters: RegExp[]) => void;

declare const storage: AsyncLocalStorage<unknown>;
declare const getCorrelationId: () => string | undefined | null;

interface RouteMetadata {
    _links: {
        self: {
            href: string;
        };
        link: {
            href: string;
            templated: boolean;
        };
    };
}
declare const generateRouteMetadata: (ctx: Context, queryParams?: string[]) => RouteMetadata;

declare function registerSchema(name: string, schema: z.ZodType): void;
declare function swaggerMiddleware({ routes, schemas, serviceName, version, }: {
    routes: string[];
    schemas?: Record<string, z.ZodType>;
    serviceName?: string;
    version?: string;
}): KoaRouter.Middleware<Koa.DefaultState, Koa.DefaultContext, unknown>;

export { generateRouteMetadata, getCorrelationId, logger, middlewares as loggerMiddlewares, storage as loggingStorage, registerSchema, setExclusionFilters as setAxiosExclusionFilters, swaggerMiddleware };
