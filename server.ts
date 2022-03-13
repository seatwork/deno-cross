import { serve, join, resolve, extname } from "./deps.ts";
import { Route, Method, Mime, HttpStatus } from "./defs.ts";
import { Context } from "./context.ts";
import { Router } from "./router.ts";
import { Engine } from "./engine.ts";
import { Metadata } from "./metadata.ts";

/**
 * HTTP Server
 */
export class Server {

    #router = new Router();
    #engine = new Engine();
    #maxAge: number = 3600 * 24 * 7; // Cache-Control 7days

    /**
     * Create an instance
     * Which routes are loaded depends on whether there are arguments
     * @param routes Route[]
     * @returns
     */
    constructor(...routes: Route[]) {
        if (routes.length > 0) {
            // Run SHORTCUT MODE if arguments exist
            // No need to scan to load decorator classes
            this.#loadRoutes(routes);
        } else {
            // Run DECORATOR MODE if arguments not exist
            Metadata.loadClasses().then(() => {
                this.#loadRoutes(Metadata.routes);
            });
        }
    }

    /**
     * Start HTTP server
     * @param port default 3000
     */
    listen(port?: number) {
        port = port || 3000;
        serve((request: Request) => this.#handleRequest(request), { port });

        console.log(`\x1b[90m[Cross] ${this.#version()}\x1b[0m`);
        console.log(`\x1b[90m[Cross] Reference: https://deno.land/x/cross\x1b[0m`);
        console.log(`[Cross] Server is running at \x1b[4m\x1b[36mhttp://localhost:${port}\x1b[0m`);
    }

    /**
     * Set static resource directory path
     * All files under this path are directly accessible
     * @param dir
     * @param maxAge in seconds
     */
    assets(dir: string, maxAge?: number) {
        // Add static route
        this.#router.add({
            method: Method.GET,
            path: join('/', dir, '*'),
            callback: this.#handleAssets.bind(this)
        });
        if (maxAge) {
            this.#maxAge = maxAge;
        }
        return this;
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
                ctx.params = route.params || {};
                ctx.render = Metadata.engineRender || this.#engine.render.bind(this.#engine);

                await this.#callMiddlewares(ctx);
                body = await route.callback(ctx);
                if (route.template) {
                    body = await ctx.render(route.template, body);
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
    #handleAssets(ctx: Context) {
        // Removes the leading slash and converts relative path to absolute path
        const file = resolve(ctx.path.replace(/^\/+/, ''));
        try {
            const stat = Deno.statSync(file);
            if (stat.isDirectory) {
                ctx.throw("Path is a directory", HttpStatus.NOT_ACCEPTABLE);
            }
            const mime = Mime[extname(file)];
            if (mime) {
                ctx.set('Content-Type', mime);
            }
            if (!stat.mtime) {
                return Deno.readFileSync(file);
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
                return Deno.readFileSync(file);
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
     * Initialize the router
     * @param routes Route[]
     */
    #loadRoutes(routes: Route[]) {
        // Add dynamic routes
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