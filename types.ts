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

// Cookie options
export type CookieOptions = {
    /** Expiration date of the cookie. */
    expires?: Date;
    /** Max-Age of the Cookie. Max-Age must be an integer superior or equal to 0. */
    maxAge?: number;
    /** Specifies those hosts to which the cookie will be sent. */
    domain?: string;
    /** Indicates a URL path that must exist in the request. */
    path?: string;
    /** Indicates if the cookie is made using SSL & HTTPS. */
    secure?: boolean;
    /** Indicates that cookie is not accessible via JavaScript. */
    httpOnly?: boolean;
    /**
     * Allows servers to assert that a cookie ought not to
     * be sent along with cross-site requests.
     */
    sameSite?: "Strict" | "Lax" | "None";
    /** Additional key value pairs with the form "key=value" */
    unparsed?: string[];
}