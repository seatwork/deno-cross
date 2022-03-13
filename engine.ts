import { dotts, resolve } from "./deps.ts";
const textDecode = (u: Uint8Array) => new TextDecoder().decode(u);

// Built-in template engine with doT
export class Engine {

  // Cache the compiled template functions
  #fnCache: Record<string, Function> = {};

  /**
   * Render method
   * @param path template file relative path
   * @param data
   * @returns rendered html
   */
  render(path: string, data: any = {}) {
    path = path.replace(/^\/+/, '');
    let fn = this.#fnCache[path];

    if (!fn) {
      const tmpl = textDecode(Deno.readFileSync(resolve(path)));
      fn = dotts.template(tmpl, { argName: Object.keys(data) }); // ignores the default argName "it"
      this.#fnCache[path] = fn;
    }
    return fn(data);
  }
}