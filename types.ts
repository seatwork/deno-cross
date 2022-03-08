import { Context } from "./context.ts";

// 启动参数
export type Option = {
    assets?: string; // 静态资源目录路径
    port?: number; // 监听端口
}

// 路由函数
export type RouteFunc = (path: string, handle: HandleFunc) => void;

// 路由响应函数
export type HandleFunc = (ctx: Context) => BodyInit | null | undefined;

// 路由类型
export type Route = {
    method: string;
    path: string,
    handle: HandleFunc;
    params?: Record<string, string>;
}

// 装饰器类型
export type Decorator = {
    type: "route" | "middleware" | "plugin" | "engine";
    name: string;
    value: string;
    fn: string | symbol;
}