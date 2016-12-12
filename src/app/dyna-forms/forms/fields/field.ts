/**
 * un champs de données du formulaire
 */
export class Field {
    type: string;//le type de field dispo
    //ex: text, number, radio,....
    title: string;
    description: string;
    
    key:string;//une clé pour retrouver la propriete

    _value: any;//la valeur du champs, c'est ce qui sera bindé
    options: Array<any>;


    // questions: Array<Field> = []; //les subOptions possibles
    // filtres:Array<any> = [];//les filtres pour les subOptions 

    get id(){return this.key;}
    constructor(type:string){
        this.type = type;
    }

    get value(){return this._value;}
    set value(val:any){
        this._value = val;
    }
}