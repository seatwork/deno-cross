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
export const Controller = (prefix: string): ClassDecorator => {
    return (target) => {
        Metadata.define(target, {
            name: "Controller", value: prefix
        });
    }
}

// export const Middleware = (): MethodDecorator => {
//     return (target, name) => {
//         const decorators = Reflect.getMetadata("rb:decorators", target.constructor) || [];
//         decorators.push({ type: "middleware", name: "", value: "", fn: name });
//         Reflect.defineMetadata("rb:decorators", decorators, target.constructor);
//     };
// }

/**
 * Plugin decorator
 * @param name
 * @returns
 */
// export const Plugin = (name: string): ClassDecorator => {
//     return (constructor: any) => {
//         Global.addPlugin({
//             name: name || constructor.name,
//             instance: new constructor()
//         });
//     };
// }

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