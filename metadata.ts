import type { Decorator, Route, Callback } from "./types.ts";
import { Reflect, join } from "./deps.ts";
import { Exception } from "./exception.ts";

/**
 * Global reflect metadata cache for decorator constructors
 */
export class Metadata {

    // To avoid creating instance repeatedly, use "Set" to automatically deduplicate.
    static #constructors: Set<any> = new Set();

    static plugins: Record<string, any> = {};
    static middlewares: Callback[] = [];
    static routes: Route[] = [];
    static errorHandler: Callback | undefined;

    /**
     * Define metadata of the class (called when the class decorator is triggered)
     * @param constructor
     * @param decorator
     */
    static define(constructor: any, decorator: Decorator) {
        this.#constructors.add(constructor);
        Reflect.defineMetadata("cross:decorator", decorator, constructor);
    }

    /**
     * Add metadata for the method (called when the method decorator is triggered)
     * @param constructor
     * @param decorator
     */
    static append(constructor: any, decorator: Decorator) {
        this.#constructors.add(constructor);

        const decorators: Decorator[] = Reflect.getMetadata("cross:decorators", constructor) || [];
        decorators.push(decorator);
        Reflect.defineMetadata("cross:decorators", decorators, constructor);
    }

    /**
     * Resolve all decorators
     */
    static compose() {
        // Iterate over all loaded constructors
        for (const c of this.#constructors) {
            // New an instance
            const instance = new c();
            const classDecorator: Decorator = Reflect.getMetadata("cross:decorator", c) as Decorator;
            const decorators: Decorator[] = Reflect.getMetadata("cross:decorators", c) || [];

            // Parse plugin decorators (singleton binding, independent of specific methods)
            if (classDecorator.name === "Plugin" && classDecorator.value) {
                this.plugins[classDecorator.value] = instance;
                continue;
            }

            // Iterate method decorators of constructor-bound
            for (const methodDecorator of decorators) {
                if (!methodDecorator.fn) continue;
                const handler = instance[methodDecorator.fn]

                // Parse middleware handlers
                if (methodDecorator.name === "Middleware") {
                    this.middlewares.push(handler);
                    continue;
                }

                // Parse error handler
                if (methodDecorator.name === "ErrorHandlder") {
                    if (this.errorHandler) {
                        throw new Exception("Duplicated error handler");
                    }
                    this.errorHandler = handler;
                    continue;
                }

                // Add a route (the class must be annotated with @Controller)
                if (classDecorator.name === "Controller") {
                    const prefix = classDecorator.value || "";
                    const path = methodDecorator.value || "";
                    this.routes.push({
                        method: methodDecorator.name,
                        path: join('/', prefix, path),
                        callback: instance[methodDecorator.fn]
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