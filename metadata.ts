import type { Decorator, Middleware, Route, Renderer, Callback } from "./types.ts";
import { Reflect, join } from "./deps.ts";
import { Exception } from "./exception.ts";

/**
 * Global reflect metadata cache for decorator constructors
 */
export class Metadata {

    // To avoid creating instance repeatedly, use "Set" to automatically deduplicate.
    static #constructors: Set<any> = new Set();

    static plugins: Record<string, unknown> = {};
    static middlewares: Middleware[] = [];
    static routes: Route[] = [];
    static engineRender?: Renderer;
    static errorHandler?: Callback;

    /**
     * Append metadata to target constructor (called when the decorator is triggered)
     * @param constructor
     * @param decorator
     */
    static append(constructor: any, decorator: Decorator) {
        this.#constructors.add(constructor);

        // There may be more than one class decorator on single class
        if (decorator.type === "class") {
            const decorators: Decorator[] = Reflect.getMetadata("class:decorators", constructor) || [];
            decorators.push(decorator);
            Reflect.defineMetadata("class:decorators", decorators, constructor);
        } else {
            // There may be also more than one method decorator on single method
            // Defines method decorators group by method name ("fn" in this case)
            const fn = decorator.fn as string;
            const decoratorGroup: Record<string, Decorator[]>
                = Reflect.getMetadata("method:decorators", constructor) || {};
            const decorators: Decorator[] = decoratorGroup[fn] || [];

            decorators.push(decorator);
            decoratorGroup[fn] = decorators;
            Reflect.defineMetadata("method:decorators", decoratorGroup, constructor);
        }
    }

    /**
     * Resolve all decorators
     */
    static compose() {
        // Get metadata from each constructor
        for (const c of this.#constructors) {
            // New an instance
            const instance = new c();

            // Parse class decorators
            const classDecorators: Decorator[] = Reflect.getMetadata("class:decorators", c) || [];
            let controller: Decorator | undefined;

            for (const decorator of classDecorators) {
                // Parse engine decorator (only one gloal engine is allowed)
                if (decorator.name === "Engine" && decorator.value) {
                    if (this.engineRender) {
                        throw new Exception("Duplicated engine renderer");
                    }
                    this.engineRender = instance[decorator.value];
                    continue;
                }

                // Parse plugin decorators (singleton binding, independent of specific methods)
                if (decorator.name === "Plugin" && decorator.value) {
                    this.plugins[decorator.value] = instance;
                    continue;
                }

                // Set a temporary controller for later use
                if (decorator.name === "Controller") {
                    controller = decorator;
                }
            }

            // Parse method decorators
            const g: Record<string, Decorator[]> = Reflect.getMetadata("method:decorators", c) || {};
            const group = Object.values(g);

            for (const decorators of group) for (const decorator of decorators) {
                if (!decorator.fn) continue;
                const callback = instance[decorator.fn];

                // Parse error handler
                if (decorator.name === "ErrorHandlder") {
                    if (this.errorHandler) {
                        throw new Exception("Duplicated error handler");
                    }
                    this.errorHandler = callback;
                    continue;
                }

                // Parse middleware handlers
                if (decorator.name === "Middleware") {
                    const priority = decorator.value as number;
                    this.middlewares.push({ callback, priority });
                    continue;
                }

                // Ignore template decorator (find later)
                if (decorator.name === "Template") {
                    continue;
                }

                // Parse routes
                if (!controller) {
                    throw new Exception("The class of route must be annotated with @Controller");
                }
                const prefix = controller.value as string || "";
                const path = decorator.value as string || "";

                // Find template decorator in the same method scope
                const tmpl: Decorator | undefined = decorators.find(v => v.name === "Template");
                const template = tmpl ? tmpl.value as string : undefined;

                this.routes.push({
                    method: decorator.name,
                    path: join('/', prefix, path),
                    callback: instance[decorator.fn],
                    template
                });
            }
        }

        // Sort middlewares by priority
        this.middlewares.sort((a, b) => a.priority - b.priority);
    }

    static printMetadata() {
        for (const c of this.#constructors) {
            console.log(`---------------------- ${c.name}`);
            console.log("class:decorators:", Reflect.getMetadata("class:decorators", c));
            console.log("method:decorators:", Reflect.getMetadata("method:decorators", c));
        }
    }

    static printResult() {
        console.log("plugins:", Metadata.plugins)
        console.log("middlewares:", Metadata.middlewares)
        console.log("routes:", Metadata.routes)
        console.log("engineRender:", Metadata.engineRender)
        console.log("errorHandler:", Metadata.errorHandler)
    }

}