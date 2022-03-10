import type { Option, Route, Callback } from "./types.ts";
import { Server } from "./server.ts";
import { Method } from "./constant.ts";

/**
 * The core method to start Cross framework
 * @param arg Option | Callback | Route
 * @param routes Route[]
 * @returns
 */
export const Cross = (
    arg: Option | Callback | Route, ...routes: Route[]
) => {

    if (typeof arg === 'function') {
        routes.push({ method: Method.ALL, path: "/*", callback: arg });
        return new Server({}, routes);
    }

    const route = arg as Route;
    if (route.method && route.path && route.callback) {
        routes.push(route);
        return new Server({}, routes);
    }

    const options = arg as Option;
    return new Server(options, routes);
}