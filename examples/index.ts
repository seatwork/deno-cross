import { Cross, get } from "../mod.ts";
import { resolve } from "https://deno.land/std@0.129.0/path/mod.ts";

new Cross(
  // get("/abc", () => {
  //   return "shortcut abc";
  // })
)
  .base(resolve())
  .static("/assets")
  .listen();