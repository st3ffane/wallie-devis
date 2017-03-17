import {Field} from './field';

export class Choice {
    name: string;//ex:Voiture
    icon:string;//ex: car
    label: string;//ex: VL,Voiture 

    title: string;
    value: string;
}


export class ChoiceRadioField extends Field {
    
    category:string;//ex: vehicule
    label:string;
    items:Array<Choice> = [];//les possibilités


    constructor(){
        super("radiogroup");
    }
}