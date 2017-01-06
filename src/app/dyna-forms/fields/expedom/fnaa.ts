import {Component, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {FNAAProvider} from "../../providers/fnaa.provider";


//permet d'interroger la base des cartes grises pour recuperer les infos sur un vehicule 

@Component({
    selector:'fnaa-input',
    templateUrl:"./fnaa.html",
    styleUrls:['./fnaa.scss']
})
export class FNAAComponent{
    @Input()question:any;
    @Input() form:FormGroup;
    @Input() formulaire;//pour pouvoir faire les modifications

    vehicule_infos:any = null;//si validé, sera la reponse a la question!
    
    
    error: any;
    loading: boolean = false;//semaphore de chargeement

    constructor(private _fnaa:FNAAProvider){}

    load_vehicule_details(immat:string){
        if(immat){
            this.error = null;
            
            this.loading = true;

            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{
                console.log("reponse du webservice....");
                console.log(dts);
                this.vehicule_infos = dts;
                //a partir de ces infos, populate la question 
                return new Promise( (resolve, reject)=>{
                   
                    //new enregistre les données et affiche un recap 
                    
                    //old: populate le formulaire
                    for (let field of this.formulaire.fields) {
                        //recherche la données correspondante
                    //    let ctrl = this.form.controls[field];
                    //    if(ctrl){
                    //        ctrl.setValue(dts[field]);
                    //    }
                    console.log(field.id);
                        if(this["set_"+field.id]){
                            this["set_"+field.id](dts, field);
                        }
                    }
                    resolve();
                });

            }).then( ()=>{
                this.loading = false;

            }).catch( (err)=>{
                
               if(err == "UNKNOWN"){
                   //plaque inconnue, demande a verifier
                   this.error = "Le numéro de plaque est inconnu du service de carte grise. Merci de verifier ou de remplir le formulaire ci dessous";
               }
               else if (err == "ERROR"){
                   this.error = "Une erreur est arrivée lors de la récuperation des informations sur votre véhicule. Merci de remplir le formulaire suivant à l'aide de votre carte grise";
               }
               else{
                   //bug reseau ou autre
                   this.error = err;
               }
               this.loading = false;
                
            });
        }
    }

    next(){
        //appellé par le submit????
        console.log("hello");
        //recupere les infos et submit!
    }

    private set_valeur(dts, field){
        this.form.controls[field.id].setValue( dts["valeur"]);
    }
     private set_immatriculation(dts, field){
        this.form.controls[field.id].setValue( dts["immatriculation"]);
    }
    private set_marque(dts, field){
        this.form.controls[field.id].setValue( dts["marque"]);
    }
    private set_modele(dts, field){
        this.form.controls[field.id].setValue( dts["modele"]+" "+dts["version"]);
    }
    private set_longueur(dts, field){
       //doit determiner la valeur possible 
        //recupere la derniere valeur
        let length = +dts["longueur"];
        this.set_value_for_select(length, field);
    }
    private set_hauteur(dts, field){
       //doit determiner la valeur possible 
        //recupere la derniere valeur
        let length = +dts["hauteur"];
        this.set_value_for_select(length, field);
    }
    private set_cylindree(dts, field){
        let length = +dts["cylindree"];
        this.set_value_for_select(length, field);
    }
    private set_poids(dts, field){
       //doit determiner la valeur possible 
        //recupere la derniere valeur
        let length = +dts["poidsVide"];
        this.set_value_for_select(length, field);
    }

    private set_motorisation(dts, field){
        let v = dts["energie"].toLowerCase();
        if (v == "gazole") v="diesel";
        //voir si besoin de mappings
       this.form.controls[field.id].setValue(v);
    }

    private set_ptac(dts, field){
        let length = +dts["ptac"] || 0;//A voir
        this.set_value_for_select(length, field);
    }
    private set_roues_motrices(dts,field){
        let length = +dts["rm"] || 2;
         this.form.controls[field.id].setValue(length);
    }



    private set_value_for_select(value, field){
        let values = field.options.map( (elem)=>{            
            let vs = elem.value.split('_');
            return +vs[vs.length-1];
        });
        let v = 0;
        for (let p of values){
            if(value >= p) v++;
            else break;
        }
        v = v == values.length ? values.length-1 : v;
       this.form.controls[field.id].setValue( field.options[v].value);
      field.__value = field.options[v].value;
    }


}