import { Controller, Context, Engine, Get, ErrorHandlder, Post, Middleware } from "../../mod.ts";

@Controller("/prefix")
export class MixedController {

    constructor() {
        console.log("new MixedController once")
    }

    @Get("/getpost/:name")
    @Post("/getpost/:name")
    @Middleware(6)
    getpost(ctx: Context) {
        console.log("i am middleware 6", ctx.params);
        return "get and post name: " + ctx.params.name;
    }

    @ErrorHandlder()
    error(ctx: Context) {
        if (ctx.error)
            return "custom error handler: " + ctx.error.status + " - " + ctx.error.message;
    }

    @Middleware(3)
    middle(ctx: Context) {
        console.log("i am middleware 3", ctx.params);
    }

}