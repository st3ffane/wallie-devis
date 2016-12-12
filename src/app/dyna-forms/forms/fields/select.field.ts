import {ChoiceRadioField, Choice} from "./choice.radio.field";

export class SelectField extends ChoiceRadioField{

    constructor(){
        super();
        this.type="select";
    }
}