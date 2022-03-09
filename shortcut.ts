import type { HandleFunc } from "./types.ts";
import { Router } from "./router.ts";
import { Method } from "./constant.ts";

/**
 * Create route in SHORTCUT MODE
 * (more lightweight than DECORATOR MODE)
 * @param method request method
 * @param path request path
 * @returns
 */
const shortcut = (method: string) => (path: string, handle: any) => {
    // Router.add({ method, path, handle });
    // console.log('this======', this)
    return "";
}

export const all = shortcut(Method.ALL);
export const get = shortcut(Method.GET);
export const post = shortcut(Method.POST);
export const put = shortcut(Method.PUT);
export const del = shortcut(Method.DELETE);
export const patch = shortcut(Method.PATCH);
export const head = shortcut(Method.HEAD);
export const opt = shortcut(Method.OPTIONS);