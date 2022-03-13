import { dotts, resolve } from "./deps.ts";
const textDecode = (u: Uint8Array) => new TextDecoder().decode(u);

// Built-in template engine with doT
export class Engine {

  // Cache the compiled template functions
  #fnCache: Record<string, Function> = {};

  render(path: string, data: any = {}) {
    path = path.replace(/^\/+/, '');
    let fn = this.#fnCache[path];

    if (!fn) {
      const tmpl = textDecode(Deno.readFileSync(resolve(path)));
      fn = dotts.template(tmpl, { argName: Object.keys(data) });
      this.#fnCache[path] = fn;
    }
    return fn(data);
  }
}