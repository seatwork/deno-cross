import { Controller, Get, All, Post, Context, Template } from "../../mod.ts";

@Controller()
export class SimpleController {

    @Get("/favicon.ico")
    async favicon(ctx: Context) {
        // ignored
    }

    @Get("/:name")
    async hello(ctx: Context) {
        console.log("ctx.url:", ctx.url);
        console.log("ctx.url2:", ctx.url2);
        console.log("ctx.origin:", ctx.origin);
        console.log("ctx.protocol:", ctx.protocol);
        console.log("ctx.host:", ctx.host);
        console.log("ctx.hostname:", ctx.hostname);
        console.log("ctx.port:", ctx.port);
        console.log("ctx.path:", ctx.path);
        console.log("ctx.method:", ctx.method);

        console.log("ctx.query:", ctx.query);
        console.log("ctx.params:", ctx.params);
        console.log("ctx.body:", await ctx.body.text());
        return `hello, ${ctx.params.name}`;
    }

    @Get("/name")
    hello2(ctx: Context) {
        return "my name is name, not the :name, but i have an alias with " + ctx.alias;
    }

    @Get("/get")
    get(ctx: Context) {
        console.log("ctx.headers.user-agent:", ctx.headers.get("user-agent"));
        console.log("ctx.cookies:", ctx.cookies.get("token"));
        return "my name is name, not the :name, but i have an alias with " + ctx.alias;
    }

    @Get("/set")
    set(ctx: Context) {
        // ctx.cookies.set("token", "222222222222", { maxAge: 1000 });
        ctx.cookies.delete("token");
        console.log(ctx.get("x-cross"));
        return "my name is name, not the :name, but i have an alias with " + ctx.alias;
    }

    @Get("/tmpl")
    @Template("index.html")
    hello3() {
        return "i will be rendered";
    }

    @Get("/image")
    async image() {
        const res = await fetch('https://www.baidu.com/img/pc_9c5c85e6b953f1d172e1ed6821618b91.png');
        return res.body;
    }

    @Get("/image-error")
    async err() {
        const res = await fetch('https://www.baidu1.com/img/pc_9c5c85e6b953f1d172e1ed6821618b91.png');
        return res.body;
    }

    @Post("/post/:name")
    post(ctx: Context) {
        return "post name: " + ctx.params.name;
    }

    @All("/all/:name")
    all(ctx: Context) {
        return "all name: " + ctx.params.name;
    }
}