import { serve, join, resolve, extname } from "./deps.ts";
import { Route, Method, Mime, HttpStatus } from "./defs.ts";
import { Context } from "./context.ts";
import { Router } from "./router.ts";
import { BaseEngine } from "./base_engine.ts";
import { Node, renderJsx } from "./jsx.ts";
import { Metadata } from "./metadata.ts";

/**
 * HTTP Server
 */
export class Server {

    #maxAge: number = 3600 * 24 * 7; // Cache-Control default 7days

    #router = new Router();
    #baseEngine = new BaseEngine();

    /**
     * Create an instance
     * @param routes Route[]
     * @returns
     */
    constructor(...routes: Route[]) {
        // Run SHORTCUT MODE if arguments exist
        // No need to scan to load decorator classes
        if (routes.length > 0) {
            this.#addRoutes(routes);
        }
    }

    /**
     * Add static resource route to router
     * All files under this path are directly accessible
     * @param dir relative path
     * @param maxAge in seconds
     */
    static(dir: string, maxAge?: number) {
        this.#addRoutes([{
            method: Method.GET,
            path: join('/', dir, '*'),
            callback: this.#handleStatic.bind(this)
        }])
        if (maxAge) {
            this.#maxAge = maxAge;
        }
        return this;
    }

    /**
     * Start HTTP server
     * @param port default 3000
     */
    listen(port?: number) {
        Metadata.compose();
        this.#addRoutes(Metadata.routes);

        if (this.#router.routes.length === 0) {
            console.error(`\x1b[31m[Cross] Error: No route found\x1b[0m`);
            console.log(`[Cross] Please make sure you have imported the decorator module`);
            return;
        }

        port = port || 3000;
        serve((request: Request) => this.#handleRequest(request), { port });
        console.log(`\x1b[90m[Cross] ${this.#version()}\x1b[0m`);
        console.log(`\x1b[90m[Cross] Reference: https://deno.land/x/cross\x1b[0m`);
        console.log(`[Cross] Server is running at \x1b[4m\x1b[36mhttp://localhost:${port}\x1b[0m`);
    }

    /**
     * Exports the core method for handling requests
     * Used to undertake requests for third-party http services
     */
    get dispatch() {
        return this.#handleRequest.bind(this);
    }

    /**
     * Handles dynamic requests
     * @param request
     * @returns
     */
    async #handleRequest(request: Request): Promise<Response> {
        const time = Date.now();
        const ctx = new Context(request);
        Object.assign(ctx, Metadata.plugins);

        let body = null;
        try {
            const route = this.#router.find(ctx.method, ctx.path)
                || this.#router.find(Method.ALL, ctx.path);

            if (route) {
                const engine = Metadata.engine || this.#baseEngine;
                ctx.view = engine.view.bind(engine);
                ctx.render = engine.render.bind(engine);
                ctx.renderJsx = renderJsx;
                ctx.params = route.params || {};

                await this.#callMiddlewares(ctx);
                body = await route.callback(ctx);

                if (route.template) {
                    body = await ctx.view(route.template, body);

                } else if (body !== undefined && body !== null) {
                    const node = body as Node; // JSX Node
                    if (node.tag !== undefined && node.tag !== null) {
                        body = "<!doctype html>" + renderJsx(node);
                    }
                }
            } else {
                ctx.throw("Route not found", HttpStatus.NOT_FOUND);
            }
        } catch (e) {
            console.error("\x1b[31m[Cross]", e, "\x1b[0m");

            if (Metadata.errorHandler) {
                e.status = e.status || HttpStatus.INTERNAL_SERVER_ERROR;
                ctx.status = e.status || HttpStatus.INTERNAL_SERVER_ERROR;
                ctx.error = e;
                body = await Metadata.errorHandler(ctx);
            } else {
                ctx.status = e.status || HttpStatus.INTERNAL_SERVER_ERROR;
                body = e.message || "Internal Server Error";
            }
        }
        ctx.set("x-response-time", (Date.now() - time) + "ms");
        return ctx.build(body);
    }

    /**
     * Handles static resource requests
     * @param ctx
     * @returns
     */
    async #handleStatic(ctx: Context) {
        // Removes the leading slash and converts relative path to absolute path
        const file = resolve(ctx.path.replace(/^\/+/, ''));
        try {
            const stat = await Deno.stat(file);
            if (stat.isDirectory) {
                ctx.throw("Path is a directory", HttpStatus.NOT_ACCEPTABLE);
            }
            const mime = Mime[extname(file)];
            if (mime) {
                ctx.set('Content-Type', mime);
            }
            if (!stat.mtime) {
                return await Deno.readFile(file);
            }

            // Handling 304 status with negotiation cache
            // if-modified-since and Last-Modified
            // In the new standard, replace "expires" in Cache-Control with "max-age"
            const lastModified = stat.mtime.toUTCString();
            if (ctx.headers.get("if-modified-since") == lastModified) {
                ctx.status = 304;
                ctx.statusText = "Not Modified";
            } else {
                ctx.set("Last-Modified", lastModified);
                ctx.set("Cache-Control", "max-age=" + this.#maxAge);
                return await Deno.readFile(file);
            }
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                ctx.throw("File not found", HttpStatus.NOT_FOUND);
            } else {
                throw e;
            }
        }
    }

    /**
     * Call middlewares by priority
     * @param ctx
     */
    async #callMiddlewares(ctx: Context) {
        for (const middleware of Metadata.middlewares) {
            await middleware.callback(ctx);
        }
    }

    /**
     * Add routes to router
     * @param routes Route[]
     */
    #addRoutes(routes: Route[]) {
        routes.forEach(route => this.#router.add(route));
    }

    /**
     * Format versions
     * @returns
     */
    #version() {
        const vers = JSON.stringify(Deno.version);
        return vers.replace(/(\"|{|})/g, "").replace(/(:|,)/g, "$1 ");
    }

}