# Cross

A tiny and strong framework for deno web application.

## Get started

```
import * from "https://deno.land/x/cross/mod.ts";
```

### Shortcut mode

1. Handles all get requests.

```
Cross(ctx => {
    return ctx.path;
});
```

2. Creates quick routes.

```
Cross(
    get("/:user", ctx => {
        return ctx.params;
    }),
    post("/:user", ctx => {
        return ctx.params;
    })
);
```

3. Starts with options.

```
Cross({
        assets: "/static/dir/path",
        port: 3000
    }
    get("/:user", ctx => {
        return ctx.params;
    }),
    post("/:user", ctx => {
        return ctx.params;
    })
);
```

Note that features such as plugins, middlewares, and unified error handling
cannot be used in shortcut mode, and you must solve them in other ways.

### Decorator mode

If no route is set in the startup parameters, the framework will automatically
switch to decorator mode. The only difference in performance between the
decorator mode and the shortcut mode is that the former needs to scan and load
all decorators at startup, it is basically the same in runtime.

```
// index.ts
// If no options, the empty {} is necessary
Cross({})
```

#### 1. Controller

```
// controller.ts
@Controller("/prefix")
export class MyController {
    @Get("/:user")
    user(ctx: Context) {
        return ctx.params;
    }
}
```

#### 2. Middleware

You can add middleware decorator on any class method, including controllers. The
role of the middleware parameter is to set the execution priority.

```
// middleware.ts
export class MyMiddleware {
    @Middleware(1)
    cors(ctx: Context) {
        // todo something
    }
    @Middleware(2)
    auth(ctx: Context) {
        // todo something
    }
}
```

#### 3. Plugin

Plugin decorators can only be added to classes, and the parameter is the name
bound to the context.

```
// plugin.ts
@Plugin("redis")
export class Redis {
    constructor() {
        // connect to redis server and create a client
    }
    get(key) {
        // todo something
    }
    set(key, value) {
        // todo something
    }
}
```

Then you can use redis object as singleton instance in any controllers with
`ctx.redis`.

#### 4. ErrorHandlder

If an error handler decorator is defined, all errors within the framework will
be handled by it. Like middleware, you can define it in any class method, but
only once. This decorator has no parameters.

```
// error.ts
export class AnyClass {
    @ErrorHandler
    error(ctx: Content) {
        console.log(ctx.error)
    }
}
```

## API Reference

### Instance

To start the web service, you simply call one method `Cross({})`. Note that not
new an instance.

#### Options

| name   | type   | required | description                                      |
| ------ | ------ | -------- | ------------------------------------------------ |
| assets | string | false    | The relative path of static resources directory. |
| port   | number | false    | HTTP server listening port, default 3000.        |

### Shortcuts

The shortcut methods including
`all`,`get`,`post`,`put`,`del`,`patch`,`head`,`opt`, and all methods have the
same parameters.

#### Parameters

| name     | type     | required                        | description |
| -------- | -------- | ------------------------------- | ----------- |
| path     | string   | Route path based on radix tree. |             |
| callback | function | Request handler with context.   |             |

### Decorators

| name           | type            | parameters |
| -------------- | --------------- | ---------- |
| @Controller    | ClassDecorator  | string     |
| @Plugin        | ClassDecorator  | string     |
| @All           | MethodDecorator | string     |
| @Get           | MethodDecorator | string     |
| @Post          | MethodDecorator | string     |
| @Put           | MethodDecorator | string     |
| @Delete        | MethodDecorator | string     |
| @Patch         | MethodDecorator | string     |
| @Head          | MethodDecorator | string     |
| @Options       | MethodDecorator | string     |
| @Middleware    | MethodDecorator | number     |
| @ErrorHandlder | MethodDecorator | undefined  |

### Context

Context is an instance passed to controllers, middlewares and error handler, it
contains properties and methods related to requests and responses.

#### Properties

| name       | type    | readonly | description                                           |
| ---------- | ------- | -------- | ----------------------------------------------------- |
| path       | string  | true     | The context path of request.                          |
| url        | string  | true     | The full url of request.                              |
| method     | string  | true     | The request method.                                   |
| headers    | Headers | true     | Refer to https://deno.com/deploy/docs/runtime-headers |
| cookies    | object  | true     | The request cookies.                                  |
| params     | object  | true     | Parameters in route path and query string.            |
| body       | object  | true     | Contains five promised methods to parse request body  |
| status     | number  | false    | Sets HTTP status code.                                |
| statusText | string  | false    | Sets HTTP status text.                                |

Body parsing methods: `text()`, `json()`, `form()`, `blob()`, `buffer()`.

#### Methods

| name       | parameters        | return | description                                           |
| ---------- | ----------------- | ------ | ----------------------------------------------------- |
| setHeader  | key, value        | void   | Sets response header.                                 |
| setHeaders | {key, value}      | void   | Sets response headers.                                |
| setCookie  | Cookie            | void   | Refer to https://deno.land/std@0.128.0/http/cookie.ts |
| redirect   | url[, status]     | void   | Default status code is 301 (permanent redirect).      |
| throw      | message[, status] | void   | Default status code is 500.                           |
