import { Plugin } from "../../mod.ts";

@Plugin("bird")
export class BirdPlugin {

    fly() {
        console.log("I can fly!")
    }

    sleep() {
        console.log("I can sleep.")
    }

}