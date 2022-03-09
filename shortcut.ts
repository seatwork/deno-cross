import type { Callback } from "./types.ts";
import { Method } from "./constant.ts";

/**
 * Create routes in SHORTCUT MODE (more lightweight than DECORATOR MODE)
 * @param method
 * @param path
 * @returns Route
 */
const shortcut = (method: string) => (path: string, callback: Callback) => {
    return { method, path, callback };
}

export const all = shortcut(Method.ALL);
export const get = shortcut(Method.GET);
export const post = shortcut(Method.POST);
export const put = shortcut(Method.PUT);
export const del = shortcut(Method.DELETE);
export const patch = shortcut(Method.PATCH);
export const head = shortcut(Method.HEAD);
export const opt = shortcut(Method.OPTIONS);