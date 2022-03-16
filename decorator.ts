import { Method, Callback } from "./defs.ts";
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
      type: "method", name: method, value: path, fn: name
    });
  };
}

/**
 * Middleware decorator
 * @param priority
 * @returns
 */
export const Middleware = (priority: number): MethodDecorator => {
  return (target, name) => {
    Metadata.append(target.constructor, {
      type: "method", name: "Middleware", value: priority, fn: name
    });
  };
}

/**
 * Template decorator
 * @param path template file path
 * @returns
 */
export const Template = (path: string): MethodDecorator => {
  return (target, name) => {
    Metadata.append(target.constructor, {
      type: "method", name: "Template", value: path, fn: name
    });
  };
}

/**
 * ErrorHandlder decorator
 * @returns
 */
export const ErrorHandlder = (): MethodDecorator => {
  return (target, name) => {
    Metadata.append(target.constructor, {
      type: "method", name: "ErrorHandlder", fn: name
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
    Metadata.append(constructor, {
      type: "class", name: "Controller", value: prefix
    });
  }
}

/**
 * Plugin decorator
 * @param name
 * @returns
 */
export const Plugin = (name: string): ClassDecorator => {
  return (constructor) => {
    Metadata.append(constructor, {
      type: "class", name: "Plugin", value: name
    });
  }
}

/**
 * Engine decorator
 * @returns
 */
export const Engine = (): ClassDecorator => {
  return (constructor) => {
    Metadata.append(constructor, {
      type: "class", name: "Engine"
    });
  }
}

export const All = Request(Method.ALL);
export const Get = Request(Method.GET);
export const Post = Request(Method.POST);
export const Put = Request(Method.PUT);
export const Delete = Request(Method.DELETE);
export const Patch = Request(Method.PATCH);
export const Head = Request(Method.HEAD);
export const Options = Request(Method.OPTIONS);

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