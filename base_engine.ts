import { dotts, resolve } from "./deps.ts";
const textDecode = (u: Uint8Array) => new TextDecoder().decode(u);

// Built-in template engine with doT
export class BaseEngine {

  // Cache the compiled template functions
  #fnCache: Record<string, Function> = {};

  /**
   * Render template file
   * @param path
   * @param data
   * @returns rendered html
   */
  view(path: string, data: any = {}) {
    path = path.replace(/^\/+/, '');
    let fn = this.#fnCache[path];

    if (!fn) {
      const tmpl = textDecode(Deno.readFileSync(resolve(path)));
      fn = dotts.template(tmpl, { argName: Object.keys(data) });
      this.#fnCache[path] = fn;
    }
    return fn(data);
  }

  /**
   * Render template text
   * @param tmpl
   * @param data
   * @returns rendered html
   */
  render(tmpl: string, data: any = {}) {
    // ignores the default argName "it"
    const fn = dotts.template(tmpl, { argName: Object.keys(data) });
    return fn(data);
  }

}