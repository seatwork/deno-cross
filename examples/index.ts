import { Cross, get } from "../mod.ts";

const app = new Cross(
    // get("/abc", () => {
    //     return "shortcut abc";
    // })
);
app.assets("/assets");
app.listen(3333);