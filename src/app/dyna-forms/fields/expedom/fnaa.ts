import {Component, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {FNAAProvider} from "../../providers/fnaa.provider";
import {DevisProvider} from "../../../providers/devis.provider";
import {Router} from "@angular/router";

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
    unsupported_error = null;
    loading: boolean = false;//semaphore de chargeement

    constructor(private _fnaa:FNAAProvider, private _devis:DevisProvider, private _router:Router){}

    load_vehicule_details(immat:string){
        if(immat){
            this.error = null;
            this.unsupported_error =null;
            this.loading = true;

            this._fnaa.get_vehicule_details(immat).then( (dts:any)=>{
                //("reponse du webservice....");
                //(dts);
                
                //a partir de ces infos, populate la question 
                return new Promise( (resolve, reject)=>{
                   
                    //new enregistre les données et affiche un recap 
                    //verifie si le type de vehicule correspond
                    if(dts["type_vehicule"] != this._devis.get_raw_param("form_marchandise","marchandise")){
                        //erreur, refuse le vehicule 
                        console.log("unsupported!!!");
                        reject({"code":"UNSUPPORTED", "msg":"type invalide","type":dts["type_vehicule"]});
                    }              

                    this.vehicule_infos = dts;      
                    //old: populate le formulaire
                    for (let field of this.formulaire.fields) {
                        //recherche la données correspondante
                    //    let ctrl = this.form.controls[field];
                    //    if(ctrl){
                    //        ctrl.setValue(dts[field]);
                    //    }
                    //(field.id);
                        if(this["set_"+field.id]){
                            this["set_"+field.id](dts, field);
                        }
                    }
                    
                    resolve();
                });

            }).then( ()=>{
                this.loading = false;

            }).catch( (err)=>{
                
               if(err.code == "UNKNOWN"){
                   console.log("unknown!!!");
                   //plaque inconnue, demande a verifier
                   this.error = "Le numéro de plaque est inconnu du service de carte grise. Merci de verifier ou de remplir le formulaire ci dessous";
               }
               else if (err.code == "ERROR"){
                   console.log("error!!!");
                   this.error = "Une erreur est arrivée lors de la récuperation des informations sur votre véhicule. Merci de remplir le formulaire suivant à l'aide de votre carte grise";
               }
               else if (err.code == "UNSUPPORTED"){
                   console.log("unsupported!!!");
                   this.unsupported_error = err;
                
               }
               else{
                   //bug reseau ou autre
                   console.log("error rezo!!!");
                   this.error = err;
               }
               this.loading = false;
                
            });
        }
    }

    next(){
        //appellé par le submit????
        //("hello");
        //recupere les infos et submit!
    }

    toMarchandise(type:string){
        //navigue vers la premiere page des formulaires
        let form = this._devis.devis_infos["form_marchandise"];
        if(form){
            //modifie le type de marchandise 
            for (let field of form.fields){
                if(field.id=="marchandise"){
                    field.value = type;
                }
            }
        }
        //probleme, si return, tout l'historique part en couille....
        this._devis.clearHistoric();//remet a zero
        this._devis.current_key = "";
        this._router.navigate(["/devis","global","form_marchandise"]);
        
       
        
    }
    toDemande(){
        //voir avec vince si possible
        //this._router.navigate(["/devis",fi.group,fi.form]);
         let form = this._devis.devis_infos["form_marchandise"];
        if(form){
            //modifie le type de marchandise 
            for (let field of form.fields){
                if(field.id=="marchandise"){
                    field.value = "autre";
                }
            }
        }
        
        //supprime la derniere entrée: le formulaire de precisions
        this._devis._form_historic.pop();
        //met le key qui va bien
        this._devis.current_key = "global_nocache/form_to";
        this._devis.load_form_datas_async("global_nocache","form_to").then( (fi)=>{
            this._router.navigate(["/devis","autre","form_coords"]);
        });
    }


    //mise en place de toutes les props
    // private set_valeur(dts, field){
    //     this.form.controls[field.id].setValue( dts["valeur"]);
    // }
     private set_immatriculation(dts, field){
        this.form.controls[field.id].setValue( dts["immatriculation"]);
    }
    private set_date1erCir(dts, field){
        this.form.controls[field.id].setValue( dts["date1erCir"]);
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
    private set_carrosserieCG(dts, field){
        this.form.controls[field.id].setValue( dts["carrosserieCG"]);
    }
     private set_codifVin(dts, field){
        this.form.controls[field.id].setValue( dts["codifVin"]);
    }
    private set_type(dts, field){
        this.form.controls[field.id].setValue( dts["type"]);
    }
     private set_genreVCG(dts, field){
        this.form.controls[field.id].setValue( dts["genreVCG"]);
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