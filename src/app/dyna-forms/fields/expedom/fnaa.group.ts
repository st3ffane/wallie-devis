import {Component, Input, ViewChild, DoCheck, KeyValueDiffers, KeyValueDiffer} from "@angular/core";
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
    @Input() question:any;
    @Input() form:FormGroup;
    @Input() formulaire;//pour pouvoir faire les modifications
    @ViewChild("checker") checkBox; //la check du composant 

    @ViewChild("name") name;
    @ViewChild("texted") srchBox;
    cache = [];//poiur ne pas tout recharger a chaque fois 

    conteneur = null; //pour connaitre les limitations 
    differ_conteneur:KeyValueDiffer<any,any> = null;
   

    showImmatForm: string = 'immat';
    titulaireName: string = "";
    immatriculation: string = "";


    no_immat_type: string = "vehicule";//workaround?


    //groups=[];//les informations sur les vheicules
    loading = false;//indique si est en train de charger les infos depuis le webservice
    unknown_error=null; //si une erreur du type "immat inconnue", afficha un message au dessus de la zone d'input 
    unsupported_error = null;
    constructor(private _fnaa:FNAAProvider, private _devis:DevisProvider, private _router:Router, private differs: KeyValueDiffers){
       
    }
    ngOnInit(){
         //recupere les datas du cache 
         this.cache = this.question.__value;
         let cnt = null;

         for (let field of this.formulaire.fields){
             if(field.id == "conteneur_size"){ //id du field
                 this.conteneur = field;
                 this.differ_conteneur =  this.differs.find(this.conteneur).create(null);//pour me prevenir qd le conteneur change
                 break;
             }
         }
         //le type de conteneur est choisi????



         
         if(this.conteneur && this.conteneur.value && this.cache) this.checkBox.nativeElement.checked = true;
    }
   
    ngDoCheck() {
        //la props de conteneur a changé????
		var changes = this.differ_conteneur.diff(this.conteneur);
       
		if(changes) {
			
			changes.forEachChangedItem((r) => {
                console.log('changed ', r.currentValue);
                console.log(r);
                if(r.key != "__value") return;
                this.unknown_error = null;
                if(r.currentValue == "20"){
                    //verifie si tout est toujours valide....
                    console.log("verifie si bon");
                    let v_count = this.get_vehicule_count("voiture");
                    let m_count = this.get_vehicule_count("moto");
                    let limits = COUNTS[r.currentValue];

                    //verification
                    if(v_count > limits["voiture"] || m_count > limits["moto"] )
                    {
                        
                        let max = v_count;
                        let type = "voiture/Utilitaire";
                        if(m_count >limits["moto"]){
                            max = m_count;
                            type = "moto";
                        }
                        //popup pour avertir du probleme 
                        this.unknown_error = "Vous ne pouvez pas charger plus de "+max+" véhicules du type "+ type+". Pour changer de conteneur, assurer vous de n'avoir embarquer au maximum que "+limits['voiture']+" voitures/utilitaires et "+limits["moto"]+" motos." ;
                        
                        //remet a 40
                        //this.conteneur.__value = "40";//pas pris en compte...
                        setTimeout(()=>this.conteneur.__value = "40", 100);
                        return false;
                    } 
                    
                }
                
                
            });
		}
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
    load_vehicule_details(vehiculeConteneur){
        let name = this.titulaireName;
        let immat = this.immatriculation;
        if(!name) return;
       
        if(name && immat){

            //chargement des datas....
            this.unknown_error = null;
            this.unsupported_error = null;
            this.loading = true;


            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{
                //enregistre l'utilisateur 
                dts["titulaire_cg"] = name;
                this.ensureLimits(dts);
                /*
                //recup les limitationos 
                let limits = COUNTS[this.conteneur.__value];
                
                let type = dts["type_vehicule"].toLowerCase();;
                type = type=="utilitaire" ? "voiture":type; //utilitaire et voiture idem...

                let max = limits[type] || 0;
                

                
                let current = this.get_vehicule_count(type);
                
                //recup le nbr de vehicules deja inscits avec ce type 
                if( current + 1 > max ){
                    //refuse
                    let t = dts["type_vehicule"];
                    t = t=="voiture" ? "voiture/utilitaire" : t;

                    this.unknown_error = "Vous ne pouvez pas charger plus de "+max+" véhicules du type "+ t;
                     this.loading = false;
                    return;
                }
                
                if(!this.question.__value )this.question.__value = [];
                this.question.__value.push(dts);
                //a partir de ces infos, populate la question 
                this.loading = false;
                // this.srchBox.nativeElement.value = "";
                // this.name.nativeElement.value ="";
                this.titulaireName = "";
                this.immatriculation = "";//remet tout a zero*/
                
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
        } else if(this.showImmatForm){
            //provient des details???
            
            let dts = {};
            for(let ctrl in vehiculeConteneur.controls){
                
                dts[ctrl]= vehiculeConteneur.controls[ctrl].value;
                //remet a zero
                vehiculeConteneur.controls[ctrl].setValue("");
            }
            //recup les limitationos 
            this.ensureLimits(dts);
            //direct access to window!!!!!!!
           window.scrollTo(0,this.checkBox.nativeElement.getBoundingClientRect().top+400);
            
        }
    }
    
    ensureLimits(dts){
        let limits = COUNTS[this.conteneur.__value];
                
        let type = dts["type_vehicule"].toLowerCase();;
        type = type=="utilitaire" ? "voiture":type; //utilitaire et voiture idem...

        let max = limits[type] || 0;
        

        
        let current = this.get_vehicule_count(type);
        
        //recup le nbr de vehicules deja inscits avec ce type 
        if( current + 1 > max ){
            //refuse
            let t = dts["type_vehicule"];
            t = t=="voiture" ? "voiture/utilitaire" : t;

            this.unknown_error = "Vous ne pouvez pas charger plus de "+max+" véhicules du type "+ t;
                this.loading = false;
            return;
        }
        //enregistre l'utilisateur 
        
        if(!this.question.__value )this.question.__value = [];
        this.question.__value.push(dts);
        //a partir de ces infos, populate la question 
        this.loading = false;
        // this.srchBox.nativeElement.value = "";
        // this.name.nativeElement.value ="";
        this.titulaireName = "";
        this.immatriculation = "";//remet tout a zero
    }
    delete(index){
        
        //(index);
        if(this.question.__value[index])  this.question.__value.splice(index,1);
    }
    private get_vehicule_count(type):number{
        if(!this.question.__value) return 0;
        
        let count = 0;
        for (let veh of this.question.__value){
            let t = veh["type_vehicule"];
            t = t=="utilitaire" ? "voiture" : t;
            //probleme, vehicule et utilitaire == identique
            if (t == type) count++;
        }
        return count;
    }

     toMarchandise(){
        //navigue vers la premiere page des formulaires
        // this._devis.next("","").then( (fi)=>{
        //     //on est parti!!!
        //     // //("informations recues");
        //     // //(fi);
        //     //this.loading = false;
        //     this._router.navigate(["/devis",fi.group,fi.form]);
        // }).catch( (err)=>{
        //     //(err);
        // })
        
    }
    toDemande(){
        //voir avec vince si possible
        //this._router.navigate(["/devis",fi.group,fi.form]);
    }

}
