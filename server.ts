import { serve, walkSync, resolve } from "./deps.ts";
import { Router } from "./router.ts";
import { Container } from "./container.ts";
import { Context } from "./context.ts";
import type { Option, Route, RouteFunc } from "./types.ts";

/**
 * 应用服务器入口
 * Run server useage: new Spark();
 */
export class Server {

    private router = new Router();

    /**
     * 构造并启动
     * @param options 可选项
     * @param routes 路由方法（启用快捷模式禁用装饰器模式）
     * @returns
     */
    constructor(options?: Option | RouteFunc[]) {
        options = options || {};
        if (Array.isArray(options)) {
            // todo shortcut mode
            return;
        }

        const assets = options.assets;
        const port = options.port;
        this.loadClasses().then(() => {
            this.initRoutes();
            this.run(port);
        })
    }

    /**
     * 启动 HTTP 服务
     * @param port 监听端口
     */
    private run(port: number = 3000) {
        serve((request: Request) => this.dispatch(request), { port });
        console.log(`> \x1b[32mReady!\x1b[0m Running at \x1b[4m\x1b[36mhttp://localhost:${port}\x1b[0m`)
    }

    /**
     * 处理动态请求
     * @param request
     * @returns
     */
    private async dispatch(request: Request): Promise<Response> {
        const ctx = new Context(request);
        const route = this.router.find(ctx.method, ctx.url);

        if (route) {
            ctx.params = route.params;
            ctx.adapt(await route.handle(ctx));
            return ctx.response;
        }
        return new Response("i am running");
    }

    /**
     * 初始化添加所有路由
     */
    private initRoutes(): void {
        const routes = Container.getRoutes();
        routes.forEach((route: Route) => {
            this.router.add(route);
        });
    }

    /**
     * 自动加载当前项目下所有.ts结尾的类文件
     */
    private async loadClasses(): Promise<void> {
        for (const entry of walkSync(resolve())) {
            if (entry.isFile && entry.name.endsWith('.ts')) {
                await import(entry.path);
            }
        }
    }

}