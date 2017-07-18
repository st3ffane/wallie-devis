import {Field} from "./field";

//on verra si on met des constraintes type regex ou autre///
export class TextField extends Field{

    constructor(){
        super("text");
    }
}