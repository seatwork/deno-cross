import { Context } from "./context.ts";

// Request methods
export const enum Method {
    ALL = "ALL",
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
}

// Common HTTP status codes
export const enum HttpStatus {
    SUCCESS = 200,
    NO_CONTENT = 204,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    REQUEST_TIMEOUT = 408,
    PAYLOAD_TOO_LARGE = 413,
    UNSUPPORTED_MEDIA_TYPE = 415,
    TOO_MANY_REQUESTS = 429,

    INTERNAL_SERVER_ERROR = 500,
}

// Common mimetypes
export const Mime: Record<string, string> = {
    ".htm": "text/html;charset:utf-8",
    ".html": "text/html;charset:utf-8",
    ".xml": "text/xml;charset:utf-8",
    ".css": "text/css;charset:utf-8",
    ".txt": "text/plain;charset:utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".tif": "image/tiff",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".json": "application/json",
    ".zip": "application/zip",
}

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

/**
 * Custom Http Error
 * Add HTTP status code
 */
export class HttpError extends Error {

    status: number;

    constructor(message: string, status?: number) {
        super(message);
        this.status = !status || status < 400 || status > 511
            ? HttpStatus.INTERNAL_SERVER_ERROR : status;
    }

}