import type { Route } from "./types.ts";
import { Radix } from "./radix.ts";

/**
 * Router object for adding and finding routes
 * based on radix tree.
 */
export class Router {

    // In view of the fact that x/router does not implement the
    // parsing function of the request method, this framework
    // adds the grouping of routers according to request method
    #radixGroup: Record<string, Radix> = {};

    /**
     * Add a route
     * @param route Route
     */
    add(route: Route) {
        let radix = this.#radixGroup[route.method];
        if (!radix) {
            radix = new Radix();
            this.#radixGroup[route.method] = radix;
        }
        radix.add(route.path, route.callback);
    }

    /**
     * Find a route
     * @param method
     * @param path
     * @returns Route
     */
    find(method: string, path: string): Route | undefined {
        const radix = this.#radixGroup[method];
        if (radix) {
            const [callback, params] = radix.find(path);
            if (callback) {
                const p: Record<string, string> = {};
                for (const [k, v] of params) p[k] = v;
                return { method, path, callback, params: p };
            }
        }
    }

}