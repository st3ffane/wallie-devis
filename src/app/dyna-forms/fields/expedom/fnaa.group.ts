import {Component, Input, ViewChild} from "@angular/core";
import {FormGroup} from "@angular/forms";

import {FNAAProvider} from "../../providers/fnaa.provider";
import {DevisProvider} from "../../../providers/devis.provider";
import {Router} from "@angular/router";

const COUNTS = {
    "20":{
        "voiture":2,
        "moto":4,
        "utilitaire":1
    },
    "40":{
        "voiture":3,
        "moto":5,
        "utilitaire":1
    }
}

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

    @ViewChild("name") name;
    @ViewChild("texted") srchBox;
    cache = [];//poiur ne pas tout recharger a chaque fois 

    conteneur = null; //pour connaitre les limitations 
    
   

    //groups=[];//les informations sur les vheicules
    loading = false;//indique si est en train de charger les infos depuis le webservice
    unknown_error=null; //si une erreur du type "immat inconnue", afficha un message au dessus de la zone d'input 
    unsupported_error = null;
    constructor(private _fnaa:FNAAProvider, private _devis:DevisProvider, private _router:Router){
       
    }
    ngOnInit(){
         //recupere les datas du cache 
         this.cache = this.question.__value;
         let cnt = null;

         for (let field of this.formulaire.fields){
             if(field.id == "conteneur_size"){ //id du field
                 this.conteneur = field;
                 break;
             }
         }
         //le type de conteneur est choisi????



         
         if(this.conteneur && this.conteneur.value && this.cache) this.checkBox.nativeElement.checked = true;
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
    load_vehicule_details(name:string, immat:string){
        if(name && immat){

            //chargement des datas....
            this.unknown_error = null;
            this.unsupported_error = null;
            this.loading = true;


            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{
                
                //recup les limitationos 
                let limits = COUNTS[this.conteneur.__value];
                
                let type = dts["type_vehicule"];
                let max = limits[type] || 0;
                
                //recup le nbr de vehicules deja inscits avec ce type 
                if(this.get_vehicule_count(type) + 1 > max ){
                    //refuse
                    this.unknown_error = "Vous ne pouvez pas charger plus de "+max+" véhicules du type "+type;
                     this.loading = false;
                    return;
                }

                 if(!this.question.__value )this.question.__value = [];
                this.question.__value.push(dts);
                //a partir de ces infos, populate la question 
                this.loading = false;
                this.srchBox.nativeElement.value = "";
                this.name.nativeElement.value ="";
                
            }).catch( (err)=>{
                //(err);
                this.loading = false;


                //affiche la plaque d'immatriculation et un message pour dire qu'une erreur est arrivée 
                if(err.code && err.code == "UNKNOWN"){
                    //une erreur du webservice: nom de plaque inconnu, mercid e verifier 
                    this.unknown_error = "La plaque d'immatriculation renseignée semble inconnue. Merci de vérifier.";
                }else if(err.code && err.code =="UNSUPPORTED"){
                    this.unsupported_error = true;
                } else {
                    //une erreur de rezo? impossible de savoir les infos 
                    if(!this.question.__value )this.question.__value = [];
                    console.log(err);
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
    private get_vehicule_count(type):number{
        if(!this.question.__value) return 0;
        let count = 0;
        for (let veh of this.question.__value){
            
            if (veh["type_vehicule"] == type) count++;
        }
        return count;
    }

     toMarchandise(){
        //navigue vers la premiere page des formulaires
        this._devis.next("","").then( (fi)=>{
            //on est parti!!!
            // //("informations recues");
            // //(fi);
            //this.loading = false;
            this._router.navigate(["/devis",fi.group,fi.form]);
        }).catch( (err)=>{
            //(err);
        })
        
    }
    toDemande(){
        //voir avec vince si possible
        //this._router.navigate(["/devis",fi.group,fi.form]);
    }

}
