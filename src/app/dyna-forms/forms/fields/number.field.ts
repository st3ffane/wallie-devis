import {Field} from "./field";

//on verra si on met des constraintes type regex ou autre///
export class NumberField extends Field{

    constructor(){
        super("number");
    }
}