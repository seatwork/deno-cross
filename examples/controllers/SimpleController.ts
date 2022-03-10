import { Controller, Get, All, Post, Context, Template } from "../../mod.ts";

@Controller()
export class SimpleController {

    @Get("/:name")
    async hello(ctx: Context) {
        console.log("ctx.alias:", ctx.alias);
        console.log("ctx.params:", ctx.params);
        console.log("ctx.url:", ctx.url);
        console.log("ctx.path:", ctx.path);
        console.log("ctx.method:", ctx.method);
        console.log("ctx.headers:", ctx.headers.get("host"));
        console.log("ctx.cookies:", ctx.cookies);
        console.log("ctx.body:", await ctx.body.text());
        return `hello, ${ctx.params.name}`;
    }

    @Get("/name")
    hello2(ctx: Context) {
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