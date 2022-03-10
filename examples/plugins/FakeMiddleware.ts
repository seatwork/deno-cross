import { Middleware, Context } from "../../mod.ts";

export class FakeMiddleware {

    @Middleware(1)
    superman(ctx: Context) {
        console.log("i am middleware 1")
        ctx.alias = "superman";
    }

}