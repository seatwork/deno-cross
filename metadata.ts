import type { Decorator, Route, HandleFunc } from "./types.ts";
import { Reflect, join } from "./deps.ts";
import { Exception } from "./exception.ts";

/**
 * 全局元数据缓存
 */
export class Metadata {

    // 为防止new多次构造函数，使用set自动去重
    static #constructors: Set<any> = new Set();

    static plugins: any[] = [];
    static middlewares: HandleFunc[] = [];
    static routes: Route[] = [];
    static errorHandler: HandleFunc | undefined;

    /**
     * 定义类的元数据（触发类装饰器执行）
     * @param constructor 目标类构造函数
     * @param decorator 装饰器对象
     */
    static define(constructor: any, decorator: Decorator) {
        this.#constructors.add(constructor);
        Reflect.defineMetadata("cross:decorator", decorator, constructor);
    }

    /**
     * 添加方法的元数据（每次触发方法装饰器时执行）
     * @param constructor 目标类构造函数
     * @param decorator 装饰器对象
     */
    static append(constructor: any, decorator: Decorator) {
        this.#constructors.add(constructor);

        const decorators: Decorator[] = Reflect.getMetadata("cross:decorators", constructor) || [];
        decorators.push(decorator);
        Reflect.defineMetadata("cross:decorators", decorators, constructor);
    }

    /**
     * 解析所有装饰器
     */
    static compose() {
        // 遍历所有已加载的构造函数
        for (const c of this.#constructors) {
            // 创建类实例
            const instance = new c();
            const classDecorator: Decorator = Reflect.getMetadata("cross:decorator", c) as Decorator;
            const decorators: Decorator[] = Reflect.getMetadata("cross:decorators", c) || [];

            // 解析插件装饰器（单例绑定，与具体方法无关）
            if (classDecorator.name === "Plugin") {
                this.plugins.push(instance);
                continue;
            }

            // 遍历构造函数绑定的方法装饰器
            for (const methodDecorator of decorators) {
                if (!methodDecorator.fn) continue;
                const handler = instance[methodDecorator.fn]

                // 解析中间件方法
                if (methodDecorator.name === "Middleware") {
                    this.middlewares.push(handler);
                    continue;
                }

                // 解析错误处理方法
                if (methodDecorator.name === "ErrorHandlder") {
                    if (this.errorHandler) {
                        throw new Exception("Duplicated error handler");
                    }
                    this.errorHandler = handler;
                    continue;
                }

                // 添加路由（所在类必须使用 @Controller 注释）
                if (classDecorator.name === "Controller") {
                    const prefix = classDecorator.value || "";
                    const path = methodDecorator.value || "";
                    this.routes.push({
                        method: methodDecorator.name,
                        path: join('/', prefix, path),
                        handle: instance[methodDecorator.fn]
                    });
                }
            }
        }
    }

    static print() {
        for (const c of this.#constructors) {
            console.log(
                Reflect.getMetadata("cross:decorator", c),
                Reflect.getMetadata("cross:decorators", c)
            )
        }
    }

}