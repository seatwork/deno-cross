import { Cross, get } from "../mod.ts";

new Cross(
    // get("/abc", () => {
    //     return "shortcut abc";
    // })
)
    .assets("/assets")
    .listen();