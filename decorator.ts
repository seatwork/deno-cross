import { Method } from "./constant.ts";
import { Metadata } from "./metadata.ts";

/**
 * Route decorator
 * @param method
 * @param path
 * @returns
 */
const Request = (method: string) => (path: string): MethodDecorator => {
    return (target, name) => {
        Metadata.append(target.constructor, {
            name: method, value: path, fn: name
        });
    };
}

/**
 * Controller decorator
 * @param prefix
 * @returns
 */
export const Controller = (prefix?: string): ClassDecorator => {
    return (constructor) => {
        Metadata.define(constructor, {
            name: "Controller", value: prefix
        });
    }
}

/**
 * Middleware decorator
 * @param priority
 * @returns
 */
export const Middleware = (priority: number): MethodDecorator => {
    return (target, name) => {
        Metadata.append(target.constructor, {
            name: "Middleware", value: priority, fn: name
        });
    };
}

/**
 * Plugin decorator
 * @param name
 * @returns
 */
export const Plugin = (name: string): ClassDecorator => {
    return (constructor) => {
        Metadata.define(constructor, {
            name: "Plugin", value: name
        });
    }
}

/**
 * ErrorHandlder decorator
 * @returns
 */
export const ErrorHandlder = (): MethodDecorator => {
    return (target, name) => {
        Metadata.append(target.constructor, {
            name: "ErrorHandlder", fn: name
        });
    };
}

export const All = Request(Method.ALL);
export const Get = Request(Method.GET);
export const Post = Request(Method.POST);
export const Put = Request(Method.PUT);
export const Delete = Request(Method.DELETE);
export const Patch = Request(Method.PATCH);
export const Head = Request(Method.HEAD);
export const Options = Request(Method.OPTIONS);