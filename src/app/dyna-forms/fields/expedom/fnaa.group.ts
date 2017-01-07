import {Component, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";

import {FNAAProvider} from "../../providers/fnaa.provider";

@Component({
    selector:"fnaa-group",
    templateUrl:'./fnaa.group.html',
    styleUrls:["./fnaa.group.scss"]
})
export class FNAAGroupComponent{
     @Input()question:any;
    @Input() form:FormGroup;
    @Input() formulaire;//pour pouvoir faire les modifications

    groups=[];//les informations sur les vheicules
    loading = false;//indique si est en train de charger les infos depuis le webservice

    constructor(private _fnaa:FNAAProvider){
       
    }
    ngOnInit(){
         
    }
    
    addField(){
        //ajoute un nouveau champs FNAA???
        this.groups.push({});
    }
    load_vehicule_details(index:number,immat:string){
        if(immat){

            this.loading = true;


            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{
                console.log("reponse du webservice....");
                console.log(dts);
                this.groups[index] = dts;
                //a partir de ces infos, populate la question 
                this.loading = false;
                
            }).catch( (err)=>{
                console.log(err);
                //fallback, demande l'affichage du formulaire
                this.loading = false;
            });
        }
    }
    delete(index){
        console.log(index);
        if(this.groups[index])  this.groups.splice(index,1);
    }
}
