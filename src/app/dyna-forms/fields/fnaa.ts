import {Component, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {FNAAProvider} from "../providers/fnaa.provider";


//permet d'interroger la base des cartes grises pour recuperer les infos sur un vehicule 

@Component({
    selector:'fnaa-input',
    templateUrl:"./fnaa.html",
    styleUrls:['./fnaa.scss']
})
export class FNAAComponent{
    @Input()question:any;
    @Input() form:FormGroup;
    error: any;

    constructor(private _fnaa:FNAAProvider){}

    load_vehicule_details(immat:string){
        if(immat){
            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{

            }).catch( (err)=>{

            });
        }
    }
}