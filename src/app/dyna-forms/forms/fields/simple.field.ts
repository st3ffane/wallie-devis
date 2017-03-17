import {Field} from "./field";

//on verra si on met des constraintes type regex ou autre///
export class SimpleField extends Field{
    input_type: string;
    constructor(type:string){
        super("simple");
        this.input_type = type;
    }
}