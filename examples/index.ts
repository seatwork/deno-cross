import { Cross, get } from "../mod.ts";
import "./controllers/SimpleController.ts";
import "./controllers/MixedController.ts";
import "./controllers/TsxController.tsx";
import "./plugins/BirdPlugin.ts";
import "./plugins/FakeMiddleware.ts";
import "./plugins/TinyEngine.ts";

new Cross(
  get("/abc", () => {
    return "abc in shortcut mode";
  })
)
  .static("/assets", 3600 * 24)
  .listen();