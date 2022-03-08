/**
 * 应用程序上下文（请求与响应）
 */
export class Context {
    [index: string]: any; // 自定义属性（如插件）

    private request: Request;
    private _url: URL;
    private _params: Record<string, string> = {}; // 请求参数
    private _body: BodyInit | null | undefined; // 响应体

    constructor(request: Request) {
        this.request = request;
        this._url = new URL(request.url);
    }

    // 设置请求参数（含路径参数和查询字符串参数）
    set params(p: Record<string, string> | undefined) {
        if (p) Object.assign(this._params, p);
        for (const [k, v] of this._url.searchParams) this._params[k] = v;
    }

    // 获取请求参数
    get params() {
        return this._params;
    }

    // 获取请求路径
    get url() {
        return this._url.pathname;
    }

    // 获取请求方法
    get method() {
        return this.request.method;
    }

    // 获取响应对象
    get response() {
        return new Response(this._body);
        // return new Response(body, { status });
    }

    // 自适应响应体类型
    // https://deno.com/deploy/docs/runtime-response
    adapt(body: BodyInit | null | undefined) {
        this._body = body;
    }

}