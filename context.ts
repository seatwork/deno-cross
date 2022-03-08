import { Cookie, getCookies, setCookie } from "./deps.ts";
import { Exception } from "./exception.ts";

/**
 * 应用程序上下文（请求与响应）
 */
export class Context {
    [index: string]: any; // 自定义属性（如插件）

    #request: Request;
    #url: URL; // 请求路径
    #params: Record<string, string> = {}; // 请求参数

    #response: { headers: Headers; status?: number; statusText?: string }
        = { headers: new Headers() }; // 类似于 ResponseInit 只是 headers 非空

    constructor(request: Request) {
        this.#request = request;
        this.#url = new URL(request.url);
    }

    // 请求部分 ////////////////////////////////////////////////////

    // 设置请求参数（路径参数+查询字符串参数）
    set params(p: Record<string, string> | undefined) {
        if (p) Object.assign(this.#params, p);
        for (const [k, v] of this.#url.searchParams) this.#params[k] = v;
    }

    // 获取请求参数
    get params() {
        return this.#params;
    }

    // 获取请求路径
    get url() {
        return this.#url.pathname;
    }

    // 获取请求方法
    get method() {
        return this.#request.method;
    }

    // 获取请求头 ctx.headers.get(key)
    get headers() {
        return this.#request.headers;
    }

    // 获取 Cookies: ctx.cookies[key]
    get cookies() {
        return getCookies(this.#request.headers);
    }

    // 获取请求体
    async body() {
        if (this.#request.bodyUsed) {
            throw new Exception("Body already consumed");
        }
        const contentType = this.headers.get('content-type');
        if (!contentType || contentType.includes("text/plain")) {
            return await this.#request.text();
        }
        if (contentType.includes("application/json")) {
            return await this.#request.json();
        }
        if (contentType.includes("multipart/form-data") ||
            contentType.includes("application/x-www-form-urlencoded")) {
            return await this.#request.formData();
        }
        if (contentType.includes("application/octet-stream")) {
            return await this.#request.blob(); // 文件型二进制大对象
        }
        // 内存型二进制数据
        return await this.#request.arrayBuffer();
    }

    // 响应部分 ////////////////////////////////////////////////////

    // 是否存在某个响应头 or ctx.headers.has
    hasHeader(key: string) {
        this.#response.headers.has(key);
    }

    // 设置单个响应头 or ctx.headers.set
    setHeader(key: string, value: string) {
        this.#response.headers.set(key, value);
    }

    // 设置多个响应头
    setHeaders(headers: Record<string, string>) {
        Object.keys(headers).forEach(key => {
            this.#response.headers.set(key, headers[key]);
        });
    }

    // 设置 ContentType 响应头
    setContentType(value: string, charset?: string) {
        if (!this.#response.headers.has("content-type")) {
            if (charset) value += ";charset=" + charset;
            this.setHeader("Content-Type", value);
        }
    }

    // 设置 Cookie（请求头中加入 Set-Cookie 字段）
    setCookie(cookie: Cookie) {
        setCookie(this.#response.headers, cookie);
    }

    // 设置响应状态
    set status(status: number) {
        this.#response.status = status;
    }

    // 设置响应状态说明
    set statusText(statusText: string) {
        this.#response.statusText = statusText;
    }

    // 重定向（302，303，307为临时重定向，301，308为永久重定向，默认301）
    redirect(url: string, status: 301 | 302 | 303 | 307 | 308 = 301) {
        this.#response.status = status;
        this.#response.headers.set("Location", url);
    }

    // 构建响应对象
    // BodyInit: Blob, BufferSource, FormData, ReadableStream, URLSearchParams, or USVString
    build(body: BodyInit) {
        if (body === undefined || body === null) {
            this.status = 204;

        } else if (body instanceof FormData) {
            this.setContentType("multipart/form-data", "utf-8");

        } else if (body instanceof URLSearchParams) {
            this.setContentType("application/x-www-form-urlencoded", "utf-8");

        } else if (body instanceof Uint8Array ||
            body instanceof Blob ||
            body instanceof ReadableStream) {
            this.setContentType("application/octet-stream");

        } else if (typeof body === "string") {
            /^\s*</.test(body) ?
                this.setContentType("text/html", "utf-8") :
                this.setContentType("text/plain", "utf-8");

        } else if (typeof body === "object") {
            this.setContentType("application/json", "utf-8");
            body = JSON.stringify(body);
        }

        return new Response(body, this.#response);
    }

}