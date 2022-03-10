import { Engine } from "../../mod.ts";

@Engine("render")
export class TinyEngine {

    render() {
        console.log("i am template engine")
        const name = "tester";
        return `<h1>Hello, ${name} I am renderred by template engine</h1>`;
    }

}