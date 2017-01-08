import {Component, Input, ViewChild} from "@angular/core";
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
    @ViewChild("checker") checkBox; //la check du composant 

    cache = [];//poiur ne pas tout recharger a chaque fois 


    //groups=[];//les informations sur les vheicules
    loading = false;//indique si est en train de charger les infos depuis le webservice
    unknown_error=false; //si une erreur du type "immat inconnue", afficha un message au dessus de la zone d'input 

    constructor(private _fnaa:FNAAProvider){
       
    }
    ngOnInit(){
         //recupere les datas du cache 
         this.cache = this.question.__value;
         if(this.cache) this.checkBox.nativeElement.checked = true;
    }
    
    addField(){
        //ajoute un nouveau champs FNAA???
        if(!this.question.__value )this.question.__value = [];
        this.question.__value.push({});
    }

    performCheck(){
       
        if(this.checkBox.nativeElement.checked){
            //remet le cache
            this.question.__value = this.cache;
        } else {
            //supprime le cache 
            this.cache = this.question.__value;
            this.question.__value = null;
        }
    }
    load_vehicule_details(immat:string){
        if(immat){
            this.unknown_error = false;
            this.loading = true;


            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{
                
                 if(!this.question.__value )this.question.__value = [];
                this.question.__value.push(dts);
                //a partir de ces infos, populate la question 
                this.loading = false;
                
            }).catch( (err)=>{
                //(err);
                this.loading = false;


                //affiche la plaque d'immatriculation et un message pour dire qu'une erreur est arrivée 
                if(err.code && err.code == "UNKNOWN"){
                    //une erreur du webservice: nom de plaque inconnu, mercid e verifier 
                    this.unknown_error = true;
                } else {
                    //une erreur de rezo? impossible de savoir les infos 
                    this.question.push({"immatriculation":immat, "error":"Impossible de se connecter au web service FNAA. voir quoi ecrire..."})
                }
                //fallback, demande l'affichage du formulaire
                
            });
        }
    }
    delete(index){
        //(index);
        if(this.question.__value[index])  this.question.__value.splice(index,1);
    }
}
