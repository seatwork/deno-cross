import type { HandleFunc } from "./types.ts";

/**
 * 全局缓存容器
 */
export class Global {

    static #errorHandler: HandleFunc | undefined;

    static set errorHandler(errorHandler: HandleFunc | undefined) {
        this.#errorHandler = errorHandler;
    }

    static get errorHandler() {
        return this.#errorHandler;
    }

}