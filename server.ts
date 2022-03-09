import { serve, join, resolve, extname, walkSync } from "./deps.ts";
import { Router } from "./router.ts";
import { Context } from "./context.ts";
import { Method, Mime, HttpStatus } from "./constant.ts";
import { Metadata } from "./metadata.ts";
import type { Option } from "./types.ts";

/**
 * 应用服务器入口
 * Run server useage: new Spark();
 */
export class Server {

    #router = new Router();

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

        // 加载装饰器、路由并启动服务
        const assets = options.assets;
        const port = options.port;
        this.#loadClasses().then(() => {
            Metadata.compose();
            this.#initRoutes(assets);
            this.#run(port);
        });
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
            const route = this.#router.find(ctx.method, ctx.path)
                || this.#router.find(Method.ALL, ctx.path);
            if (route) {
                ctx.params = route.params;
                body = await route.handle(ctx);
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
     * 静态资源处理
     * @param ctx
     * @returns
     */
    #handleAssets(ctx: Context) {
        // 将相对路径去掉开头斜杠转为绝对路径
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
     * 初始化路由器
     * @param assets 静态资源目录相对路径
     */
    #initRoutes(assets?: string) {
        // 添加静态资源路由（该路径下所有文件直接访问）
        if (assets) {
            this.#router.add({
                method: Method.GET,
                path: join('/', assets, '*'),
                handle: this.#handleAssets
            });
        }
        // 添加装饰器路由
        Metadata.routes.forEach(route => {
            this.#router.add(route);
        });
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