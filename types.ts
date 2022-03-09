import { Context } from "./context.ts";

// Route callback function
export type Callback = (ctx: Context) => void;

// Route object
export type Route = {
    method: string;
    path: string,
    callback: Callback;
    params?: Record<string, string>;
}

// Decorator object
export type Decorator = {
    name: string;
    value?: string;
    fn?: string | symbol;
}

// Startup options
export type Option = {
    assets?: string; // Static resource directory path
    port?: number;   // Server listening port
}