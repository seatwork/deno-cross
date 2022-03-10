import { Engine } from "../../mod.ts";

@Engine("render")
export class TinyEngine {

    render(tmpl: string, data: any) {
        console.log("i am template engine", tmpl, data);
        const name = "tester";
        return `<h1>Hello, ${name} I am renderred by template engine</h1>`;
    }

}