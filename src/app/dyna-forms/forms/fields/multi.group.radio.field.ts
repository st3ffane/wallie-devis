import {Field} from './field';

export class MultigroupRadioField extends Field {
    
    items:Array<Field> = [];//les possibilités


    constructor(){
        super("multiradio");
    }
}