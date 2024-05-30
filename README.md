# onecore-utilities

Useful utilities used in various places in the ONECore platform.

## logger

A logger that logs to the console and to ElasticSearch.

### General use

```
import { logger } from 'onecore-utilities'

logger.warn(aMessage)
logger.info(anObject, aMessage)
```

### Koa request logging

loggerMiddlewares.pre will log all incoming requests at the start of the request
loggerMiddlewares.post will log all incoming requests at the end of the request

```
import { loggerMiddlewares } from 'onecore-utilities'

// Log the start and completion of all incoming requests
app.use(loggerMiddlewares.pre)
app.use(loggerMiddlewares.post)
```

The pre middleware automatically creates a correlationId (UUID) and attaches it to
the ctx object as ctx.correlationId.

### Configuration

Set environment variable `ELASTICSEARCH_LOGGING_HOST` to the full url of your ElasticSearch server.
Set environment variable `APPLICATION_NAME` to the name of the application.

## loggedAxios

A standard Axios with interceptors for request and response that logs all requests and their
completions to logger, with a subset of fields from the Axios request and response objects.

### Configuration

Set environment variable `ELASTICSEARCH_LOGGING_HOST` to the full url of your ElasticSearch server.
Set environment variable `APPLICATION_NAME` to the name of the application.

If you want to use correlationIds, use an AsyncLocalStorage. Here's an example of how to combine
the loggerMiddlewares and loggedAxios:

storage.ts:
```
import { AsyncLocalStorage } from 'node:async_hooks'

export const storage = new AsyncLocalStorage()
```

route.ts:
```
import { storage } from './storage'
import { getHttpStuff } from './service'

export const routes = (router: KoaRouter) => {
  router.get('(.*)/route', async (ctx) => {
    await storage.run({ correlationId: ctx.correlationId }, async () => {
      const responseData = await getHttpStuff()

      ctx.body = {
        data: responseData,
      }
    })
  })
```

service.ts:
```
import {
  loggedAxios as axios,
  setAxiosStorage,
} from 'onecore-utilities'
import { storage } from './storage'
setAxiosStorage(storage)

export const getHttpStuff = async () => {
  return await axios(someUrl)
}
```

loggedAxios will now automatically read correlationId from the store, append it
to its logging and automatically add the header `x-correlation-id` to all its
requests, to make sure the id propagates to integrated services.

### General use

Use as you would use standard Axios.

```
import { loggedAxios as axios } from 'onecore-utilities'

const response = await axios('http://localhost')
```
