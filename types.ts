import { Context } from "./context.ts";

// Route callback function of the controller
export type Callback = (ctx: Context) => void;

// Render function of the template engine
export type Renderer = (tmplFile: string, data: unknown) => string;

// Decorator type
export type Decorator = {
    type: "class" | "method";
    name: string;
    value?: string | number;
    fn?: string | symbol;
}

// Route type
export type Route = {
    method: string;
    path: string,
    callback: Callback;
    template?: string;
    params?: Record<string, string>;
}

// Middleware type
export type Middleware = {
    priority: number;
    callback: Callback;
}

// Startup options
export type Option = {
    assets?: string; // Static resource directory path
    port?: number;   // Server listening port
}