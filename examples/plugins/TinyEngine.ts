import { Engine, BaseEngine } from "../../mod.ts";

@Engine()
export class TinyEngine extends BaseEngine {

    view(tmpl: string, data: any) {
        console.log("i am template engine", tmpl, data);
        const name = "tester";
        this.#test();
        return `<h1>Hello, ${name} I am renderred by template engine</h1>`;
    }

    #test() {

    }

}