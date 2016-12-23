import {Component, OnInit} from "@angular/core";
import {DevisProvider} from "../providers/devis.provider";

import { Router } from "@angular/router";

/**
 * Resultat de la generation de devis:
 * affichage desresultats
 * permet de suavegarder le devis pour le recuperer plus tard....
 * 
 *  "V":12000, //valeur marchandise + taxes    !
                "P":1450,//prix du transport (port a port)!
                "PC":470,//prise en charge !
                "PT":0,//livraison domicile !
                "TSM":65,//taxe sur marchandise !
                "TVA":0,//pourcentage!
                "TVA_VALUE":0,//valeur!
                "TVA_RU":0,//tva sur prestations (locale) %!
                "TVA_RU_VALUE":0,//valeur!
                "FR":500,//dédoinement !
                "A":180,//assurance valeur!
                "CAF":14100,//valeur taxable de la marchandise ????!
                "OM":  "octroie de mer"
                {
                        "om_percentage":0,
                        "omr_percentage":0 //regionnal
                },
                "OM_VALUES":
                {
                        "OM":0,
                        "OMR":0
                },
                "TOTAL_REUNION":500,//taxes locales total!
                "TAXES":65,//taxes avant dedouanement!
                "TOTAL_A_PAYER":2665,!
                "PORT_DE_DEPART":"marseille" !

 */

@Component({
    selector:"devis-result",
    templateUrl: "./devis.html",
    styleUrls:['./devis.scss']
})
export class DevisComponent implements OnInit{
    devis_infos: any;//les informations du devis
    devis_details: any; // le devis genere via le xwebservice de calcul
    pdf_file:string; // url vers le fichier pdf genere

    loading:boolean = true;

    has_IDB: boolean = true; // pour savoir si a un acces aux base de données

    //requested_keys = [];
    workflow = [];



    constructor( private _devis:DevisProvider,
                private _router:Router){}


    ngOnInit(){
        //chargement des données du devis....
        this.has_IDB = this._devis.has_IDB();
        
        //pour l'historique, remet le current_key a null 
        //@IMPORTANT: permet, si quitte l'application ici, de ne pas sauvegarder 
        //l'historique du formulaire!!!!
        this._devis.deactive_historic();
        this.loading = true;




        // this._devis.load_requested_workflow().then ( (workflow:Array<string>)=>{
        //     this.requested_keys = workflow.map( (elem)=> elem.split('/')[1]); //les clés voulues
        //     return this._devis.load_devis_details_async(this.requested_keys);
        // })
        this._devis.load_devis_details_async()//this.requested_keys)
        .then( (res:any)=>{

            return new Promise( (resolve, reject)=>{
                
                //recup le devis courant avec les valeurs de l'utilisateur
                let devis = this._devis.get_devis();
                
                //recupere le workflow 
                let datas = res.calculated_datas;
                let wf = res.workflow;
              
                //recupere dans le 'cache' de l'application les formulaires qui nous interressent 
                //et compacte les données pour simplifier l'affichage 
                let workflow = wf.map( (key)=>{
                    let [group, form]=key.split("/");
                    return this._devis.compact_devis_form_datas(devis[form]);//le nom du formulaire a afficher....
                });

                resolve({
                    'workflow': workflow,
                    'calculated_datas':datas,
                    'pdf_file':res.pdf_file
                });

                //on a dans l'ordre les differentes parties du workflow...

                
            });
            
            
        }).then( (res:any)=>{
                
                //le recapitulatif des données
                
                this.workflow = res.workflow;
                //le devis 
                this.devis_details = res.calculated_datas;
                this.pdf_file = res.pdf_file;

                this.loading = false;
            
        }).catch( (err) => {
            console.log(err);
            this.loading = false;
        });
    }

   
    //@DEPRECATED: remplacé par une pipe!
    get_devis_details(form: string, id:string){
        let frm = this.devis_infos[form];
        if(frm) {
            //recherche le field
            for(let field of frm.fields){
                if(id == field.id) return field.value;
            }
            
            
        }
        else return ("----");
    }

    /**
     * relance un tour de formulaire avec un nouveau devis 
     */
    create_devis(){
        //rcreation d'un nouveau devis pour le formulaire
        this._devis.create_new_devis();
        this._devis.next("","").then( (fi)=>{
            //on est parti!!!
            this._router.navigate(["/devis",fi.group,fi.form]);
        }).catch( (err)=>{
            console.log(err);
        })
        
    }

    /**
     * Sauvegarde le devis courant en BdD pour pouvoir le 
     * reafficher une autre fois
     */
    save_devis(){
        //sauvegarde dans une SGBD an local 
        this.loading = true;
        this._devis.save_current_devis().then( (success)=>{
            this.loading = false;
            console.log("sauvegarde OK!!!");
        }).catch( (err)=>{
            this.loading = false;
            console.log(err);
        })

    }

}