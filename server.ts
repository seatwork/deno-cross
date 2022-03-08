import { serve, join, resolve, extname, walkSync } from "./deps.ts";
import { Router } from "./router.ts";
import { Context } from "./context.ts";
import { Method, Mime, HttpStatus } from "./constant.ts";
import { Global } from "./global.ts";
import { Exception } from "./exception.ts";
import type { Option, RouteFunc } from "./types.ts";

/**
 * 应用服务器入口
 * Run server useage: new Spark();
 */
export class Server {

    /**
     * 构造并启动
     * @param options 可选项|路由方法
     * @returns
     */
    constructor(options?: Option | string[]) {
        options = options || {};

        // Shortcut Mode
        if (Array.isArray(options)) {
            // todo shortcut mode
            this.#run();
            return;
        }

        // 为静态资源添加路由（该路径下所有文件直接访问）
        if (options.assets) {
            Router.add({
                method: Method.GET,
                path: join('/', options.assets, '*'),
                handle: this.#handleAssets
            });
        }

        // 加载装饰器、路由并启动服务
        const port = options.port;
        this.#loadClasses().then(() => this.#run(port));
    }

    /**
     * 启动 HTTP 服务
     * @param port 监听端口（默认值 3000）
     */
    #run(port: number = 3000) {
        serve((request: Request) => this.#dispatch(request), { port });
        console.log(`> \x1b[32mReady!\x1b[0m Running at \x1b[4m\x1b[36mhttp://localhost:${port}\x1b[0m`)
    }

    /**
     * 处理动态请求
     * @param request
     * @returns
     */
    async #dispatch(request: Request): Promise<Response> {
        const ctx = new Context(request);
        let body = null;
        try {
            const route = Router.find(ctx.method, ctx.url)
                || Router.find(Method.ALL, ctx.url);
            if (route) {
                ctx.params = route.params;
                body = await route.handle(ctx);
            } else {
                throw new Exception("Route not found", HttpStatus.NOT_FOUND);
            }
        } catch (e) {
            console.error(e);
            if (Global.errorHandler) {
                e.status = e.status || HttpStatus.INTERNAL_SERVER_ERROR;
                ctx.status = e.status || HttpStatus.INTERNAL_SERVER_ERROR;
                ctx.error = e;
                body = await Global.errorHandler(ctx);
            } else {
                ctx.status = e.status || HttpStatus.INTERNAL_SERVER_ERROR;
                body = e.message || "Internal Server Error";
            }
        }
        return ctx.build(body);
    }

    /**
     * 静态资源处理
     * @param ctx
     * @returns
     */
    #handleAssets(ctx: Context) {
        // 将相对路径去掉开头斜杠转为绝对路径
        const file = resolve(ctx.url.replace(/^\/+/, ''));
        try {
            const stat = Deno.statSync(file);
            if (stat.isDirectory) {
                throw new Exception("Path is a directory", HttpStatus.NOT_ACCEPTABLE);
            }
            const ext = Mime[extname(file)];
            if (ext) {
                ctx.setHeader('Content-Type', ext);
            }
            return Deno.readFileSync(file);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                throw new Exception("File not found", HttpStatus.NOT_FOUND);
            } else {
                throw e;
            }
        }
    }

    /**
     * 加载当前项目下所有.ts结尾的类文件以便触发装饰器
     */
    async #loadClasses(): Promise<void> {
        for (const entry of walkSync(resolve())) {
            if (entry.isFile && entry.name.endsWith('.ts')) {
                await import(entry.path);
            }
        }
    }

}