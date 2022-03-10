import { Cookie, getCookies, setCookie } from "./deps.ts";
import { Exception } from "./exception.ts";

/**
 * Application context (request and response)
 */
export class Context {

    [index: string]: any; // Custom properties

    #request: Request;
    #url: URL;
    #params: Record<string, string> = {};

    #response: { headers: Headers; status?: number; statusText?: string }
        = { headers: new Headers() };

    #error?: Exception;

    // Creates new context for each request
    constructor(request: Request) {
        this.#request = request;
        this.#url = new URL(request.url);

        // Set query string parameters
        for (const [k, v] of this.#url.searchParams) {
            this.#params[k] = v;
        }
    }

    // REQUEST PART /////////////////////////////////////////////////

    // Set route parameters
    set params(p: Record<string, string>) {
        Object.assign(this.#params, p);
    }

    // Get request parameters
    get params() {
        return this.#params;
    }

    // Get the full url of request
    get url() {
        return this.#request.url;
    }

    // Get the context path of request
    get path() {
        return this.#url.pathname;
    }

    // Get request method
    get method() {
        return this.#request.method;
    }

    // Get request headers. Usage: ctx.headers.get(key)
    get headers() {
        return this.#request.headers;
    }

    // Get request cookies. Usage: ctx.cookies[key]
    get cookies() {
        return getCookies(this.#request.headers);
    }

    // Get parsing methods for request body
    get body() {
        const req = this.#request;
        if (req.bodyUsed) {
            this.throw("Body already consumed");
        }
        return {
            text: () => req.text(),
            json: () => req.json(),
            form: () => req.formData(),
            blob: () => req.blob(),
            buffer: () => req.arrayBuffer(),
        }
    }

    // RESPONSE PART ////////////////////////////////////////////////

    set status(status: number) {
        this.#response.status = status;
    }

    set statusText(statusText: string) {
        this.#response.statusText = statusText;
    }

    setHeader(key: string, value: string) {
        this.#response.headers.set(key, value);
    }

    setHeaders(headers: Record<string, string>) {
        Object.keys(headers).forEach(key => {
            this.#response.headers.set(key, headers[key]);
        });
    }

    setContentType(value: string, charset?: string) {
        if (!this.#response.headers.has("content-type")) {
            if (charset) value += ";charset=" + charset;
            this.setHeader("Content-Type", value);
        }
    }

    setCookie(cookie: Cookie) {
        setCookie(this.#response.headers, cookie);
    }

    // Permanent redirect codes: 301 (default), 308
    // Temporary redirect codes: 302，303，307
    redirect(url: string, status: 301 | 302 | 303 | 307 | 308 = 301) {
        this.#response.status = status;
        this.#response.headers.set("Location", url);
    }

    // Build the response object
    // BodyInit: Blob, BufferSource, FormData, ReadableStream, URLSearchParams, or USVString
    build(body: BodyInit) {
        if (body === undefined || body === null) {
            this.status = 204;

        } else if (typeof body === "string") {
            /^\s*</.test(body) ?
                this.setContentType("text/html", "utf-8") :
                this.setContentType("text/plain", "utf-8");

        } else if (!(body instanceof Blob) && !(body instanceof Uint8Array)
            && !(body instanceof FormData) && !(body instanceof ReadableStream)
            && !(body instanceof URLSearchParams)) {
            this.setContentType("application/json", "utf-8");
            body = JSON.stringify(body);
        }
        return new Response(body, this.#response);
    }

    // SHORTCUTS ////////////////////////////////////////////////////

    set error(e: Exception | undefined) {
        this.#error = e;
    }

    get error() {
        return this.#error;
    }

    throw(message: string, status?: number) {
        throw new Exception(message, status);
    }

}