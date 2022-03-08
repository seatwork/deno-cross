import type { Route } from "./types.ts";

/**
 * 组件缓存容器
 */
export class Container {

    private static routes: Route[] = [];

    static addRoute(route: Route) {
        this.routes.push(route);
    }

    static getRoutes(): Route[] {
        return this.routes;
    }

}