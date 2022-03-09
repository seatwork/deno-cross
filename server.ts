import type { Option, Route } from "./types.ts";
import { serve, join, resolve, extname, walkSync } from "./deps.ts";
import { Context } from "./context.ts";
import { Router } from "./router.ts";
import { Metadata } from "./metadata.ts";
import { Method, Mime, HttpStatus } from "./constant.ts";

/**
 * HTTP Server
 */
export class Server {

    #router = new Router();
    #time = Date.now();

    /**
     * Construct and start server
     * @param options { assets, port }
     * @param routes Route[]
     * @returns
     */
    constructor(options: Option, routes: Route[]) {
        const assets = options.assets;
        const port = options.port;

        // Run SHORTCUT MODE if routes exist
        // No need to scan to load decorator classes
        if (routes.length > 0) {
            this.#loadRoutes(routes, assets);
            this.#run(port);
        } else {
            // Run DECORATOR MODE if routes not exist
            this.#loadClasses().then(() => {
                Metadata.compose();
                this.#loadRoutes(Metadata.routes, assets);
                this.#run(port);
            });
        }
    }

    /**
     * Start HTTP server
     * @param port default 3000
     */
    #run(port?: number) {
        port = port || 3000;
        serve((request: Request) => this.#dispatch(request), { port });

        console.log(`\x1b[90m[Cross] https://deno.land/x/cross\x1b[0m`)
        console.log(`[Cross] Server is running at \x1b[4m\x1b[36mhttp://localhost:${port}\x1b[0m`)
        console.log("[Cross] Elapsed time:", Date.now() - this.#time, "ms");
    }

    /**
     * Handles dynamic requests
     * @param request
     * @returns
     */
    async #dispatch(request: Request): Promise<Response> {
        const ctx = new Context(request);
        Object.assign(ctx, Metadata.plugins);

        let body = null;
        try {
            const route = this.#router.find(ctx.method, ctx.path)
                || this.#router.find(Method.ALL, ctx.path);
            if (route) {
                ctx.params = route.params;
                await this.#callMiddlewares(ctx);
                body = await route.callback(ctx);
            } else {
                ctx.throw("Route not found", HttpStatus.NOT_FOUND);
            }
        } catch (e) {
            console.error(e);
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
        return ctx.build(body);
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
            const ext = Mime[extname(file)];
            if (ext) {
                ctx.setHeader('Content-Type', ext);
            }
            return Deno.readFileSync(file);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                ctx.throw("File not found", HttpStatus.NOT_FOUND);
            } else {
                throw e;
            }
        }
    }

    /**
     * Initialize the router
     * @param routes Route[]
     * @param assets Relative path of assets directory
     */
    #loadRoutes(routes: Route[], assets?: string) {
        // Add dynamic routes
        routes.forEach(route => this.#router.add(route));

        // Add static routes
        // All files under this path are directly accessible
        if (assets) {
            this.#router.add({
                method: Method.GET,
                path: join('/', assets, '*'),
                callback: this.#handleAssets
            });
        }
    }

    /**
     * Loads (imports) all .ts files under the current project
     * to trigger the decorators
     */
    async #loadClasses(): Promise<void> {
        for (const entry of walkSync(resolve())) {
            if (entry.isFile && entry.name.endsWith('.ts')) {
                await import(entry.path);
            }
        }
    }

}