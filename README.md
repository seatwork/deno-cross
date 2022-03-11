# Cross

A tiny and strong framework for deno web application.

## Get started

```ts
import { Cross } from "https://deno.land/x/cross/mod.ts";
```

### Shortcut mode

1. Handles all requests.

```ts
Cross((ctx) => {
  return ctx.path;
});
```

2. Creates quick routes.

```ts
import { Cross, get, post } from "https://deno.land/x/cross/mod.ts";

Cross(
  get("/:user", (ctx) => {
    return ctx.params;
  }),
  post("/:user", (ctx) => {
    return ctx.params;
  }),
);
```

3. Starts with options.

```ts
import { Cross, get, post } from "https://deno.land/x/cross/mod.ts";

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

Note that features such as plugins, middlewares,template engine and unified
error handling cannot be used in shortcut mode, you must solve them in other
ways.

### Decorator mode

If no route is set in the startup parameters, the framework will automatically
switch to decorator mode. The only difference in performance between the
shortcut mode and the decorator mode is that the latter needs to scan and load
all decorators at startup, it is almost the same in runtime.

```ts
// index.ts
import { Cross } from "https://deno.land/x/cross/mod.ts";

// If no options, the empty {} is necessary
Cross({});
```

#### 1. Controller

```ts
// controller.ts
import { Context, Controller, Get } from "https://deno.land/x/cross/mod.ts";

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

```ts
// middleware.ts
import { Context, Middleware } from "https://deno.land/x/cross/mod.ts";

export class MyMiddleware {
  @Middleware(2)
  cors(ctx: Context) {
    // todo something second
  }
  @Middleware(1)
  auth(ctx: Context) {
    // todo something first
  }
}
```

#### 3. Plugin

Plugin decorators can only be added to classes, and the parameter is the name
bound to the context.

```ts
// plugin.ts
import { Plugin } from "https://deno.land/x/cross/mod.ts";

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

#### 4. Engine

Define one and only one engine decorator that can render templates file with
specific data. The parameter of this decorator is the core method of rendering
the template, it accepts two parameters: template file path and rendering data.

```ts
// engine.ts
import { Engine } from "https://deno.land/x/cross/mod.ts";

@Engine("render")
export class MyEngine {
  render(tmplFile, data) {
    // return html string
  }
}
```

#### 5. Template

Template decorator is used to decorate controller handlers, the parameters is
template file path. Note that if you don't define any template engine, this
decorator will throw an error.

```ts
// controller.ts
import {
  Context,
  Controller,
  Get,
  Template,
} from "https://deno.land/x/cross/mod.ts";

@Controller("/prefix")
export class MyController {
  @Get("/:user")
  @Template("index.tmpl")
  user(ctx: Context) {
    return ctx.params;
  }
}
```

#### 6. ErrorHandlder

If an error handler decorator is defined, all errors within the framework will
be handled by it. Like middleware, you can define it in any class method but
only once. This decorator has no parameters.

```ts
// error.ts
import { Context, ErrorHandler } from "https://deno.land/x/cross/mod.ts";

export class AnyClass {
  @ErrorHandler
  error(ctx: Context) {
    console.log(ctx.error);
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

| name     | type     | required | description                     |
| -------- | -------- | -------- | ------------------------------- |
| path     | string   | false    | Route path based on radix tree. |
| callback | function | false    | Request handler with context.   |

### Decorators

| name           | type            | parameters | parameter description              |
| -------------- | --------------- | ---------- | ---------------------------------- |
| @Controller    | ClassDecorator  | string     | Prefix for request route           |
| @Plugin        | ClassDecorator  | string     | Plugin name with context           |
| @Engine        | ClassDecorator  | string     | Render method name in engine class |
| @All           | MethodDecorator | string     | Route path                         |
| @Get           | MethodDecorator | string     | Route path                         |
| @Post          | MethodDecorator | string     | Route path                         |
| @Put           | MethodDecorator | string     | Route path                         |
| @Delete        | MethodDecorator | string     | Route path                         |
| @Patch         | MethodDecorator | string     | Route path                         |
| @Head          | MethodDecorator | string     | Route path                         |
| @Options       | MethodDecorator | string     | Route path                         |
| @Template      | MethodDecorator | string     | Template file path                 |
| @Middleware    | MethodDecorator | number     | Middleware execution priority      |
| @ErrorHandlder | MethodDecorator | undefined  |                                    |

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

## Examples

See https://github.com/seatwork/deno-cross/tree/master/examples
