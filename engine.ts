import { dotts, resolve } from "./deps.ts";

// Built-in template engine with doT
export class BaseEngine {

  // Cache the compiled template functions
  // deno-lint-ignore ban-types
  #fnCache: Record<string, Function> = {};

  /**
   * Render template file
   * @param path
   * @param data
   * @returns rendered html
   */
  // deno-lint-ignore no-explicit-any
  async view(path: string, data: any = {}) {
    path = path.replace(/^\/+/, '');
    let fn = this.#fnCache[path];

    if (!fn) {
      const tmpl = await Deno.readTextFile(resolve(path));
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
  // deno-lint-ignore no-explicit-any
  render(tmpl: string, data: any = {}) {
    // ignores the default argName "it"
    const fn = dotts.template(tmpl, { argName: Object.keys(data) });
    return fn(data);
  }

}