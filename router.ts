import { Radix } from "./radix.ts";
import type { Route } from "./types.ts";

/**
 * 路由器
 */
export class Router {

    // 由于x/router未实现请求方法的解析功能
    // 故本框架增加按请求方法对路由器的分组
    #radixGroup: Record<string, Radix> = {};

    /**
     * 添加单个路由
     * @param method 请求方法
     * @param path 请求路径
     * @param fn 处理方法
     */
    add(route: Route): void {
        let radix = this.#radixGroup[route.method];
        if (!radix) {
            radix = new Radix();
            this.#radixGroup[route.method] = radix;
        }
        radix.add(route.path, route.handle);
    }

    /**
     * 查找路由
     * @param method 请求方法
     * @param path 请求路径
     * @returns Route
     */
    find(method: string, path: string): Route | undefined {
        const radix = this.#radixGroup[method];
        if (radix) {
            const [handle, params] = radix.find(path);
            if (handle) {
                const p: Record<string, string> = {};
                for (const [k, v] of params) p[k] = v;
                return { method, path, handle, params: p };
            }
        }
    }

}