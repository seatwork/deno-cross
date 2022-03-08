import { Reflect, join } from "./deps.ts";
import { Container } from "./container.ts";
import type { Decorator } from "./types.ts";

/**
 * 请求方法装饰器
 * @param method 方法名
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
 * 控制器装饰器
 * @param prefix 路径前缀
 * @returns
 */
export const Controller = (prefix: string = ""): ClassDecorator => {
    return (target: any) => {
        const instance = new target();
        const decorators: Decorator[] = Reflect.getMetadata("rb:decorators", target) || [];

        for (const decorator of decorators) {
            if (decorator.type !== "route") continue;

            Container.addRoute({
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

export const All = Request("All");
export const Get = Request("Get");