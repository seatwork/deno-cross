import { Reflect, join } from "./deps.ts";
import { Router } from "./router.ts";
import { Method } from "./constant.ts";
import { Global } from "./global.ts";
import { Exception } from "./exception.ts";
import type { Decorator } from "./types.ts";

/**
 * 路由方法装饰器
 * @param method 请求方法名
 * @param path 请求路径
 * @returns
 */
const Request = (method: string) => (path: string = ""): MethodDecorator => {
    return (target, name) => {
        const decorators: Decorator[] = Reflect.getMetadata("rb:decorators", target.constructor) || [];
        decorators.push({ type: "route", name: method, value: path, fn: name });
        Reflect.defineMetadata("rb:decorators", decorators, target.constructor);
    };
}

/**
 * 控制器类装饰器
 * @param prefix 路由前缀
 * @returns
 */
export const Controller = (prefix: string = ""): ClassDecorator => {
    return (target: any) => {
        const instance = new target();
        const decorators: Decorator[] = Reflect.getMetadata("rb:decorators", target) || [];

        for (const decorator of decorators) {
            if (decorator.type !== "route") continue;

            Router.add({
                method: decorator.name,
                path: join('/', prefix, decorator.value),
                handle: instance[decorator.fn]
            });
        }
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
 * 插件类装饰器
 * @param name 插件名称（默认为类名）
 * @returns
 */
// export const Plugin = (name?: string): ClassDecorator => {
//     return (constructor: any) => {
//         Global.addPlugin({
//             name: name || constructor.name,
//             instance: new constructor()
//         });
//     };
// }

/**
 * 错误处理方法装饰器
 * @returns
 */
export const ErrorHandlder = (): MethodDecorator => {
    return (target: any, name) => {
        if (Global.errorHandler) {
            throw new Exception("Duplicated error handler");
        }
        const instance = new target.constructor();
        Global.errorHandler = instance[name];
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