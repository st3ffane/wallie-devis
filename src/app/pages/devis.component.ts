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
    template: `<div>
        <h1>Calculateur de devis EXPEDOM</h1>
        
        <div id="recap">
        <span>Vous desirez expedier:</span>
        <ul>
             <li> un/une <strong>{{devis_infos | GetDevisDetailsPipe:"form_marchandise":"marchandise"}}</strong> </li>
             <li> depuis <strong>{{devis_infos | GetDevisDetailsPipe:"form_from":"from"}}</strong> vers <strong>{{devis_infos | GetDevisDetailsPipe:"form_to":"to"}}</strong></li>
             <li> <strong>{{devis_infos | GetDevisDetailsPipe:"form_assurance":"assurance"}}</strong></li>
             <li> ...voir quoi mettre d'autre</li>
                
        </ul>
        </div>
        <div id="results" *ngIf="devis_details">
        <h3>Votre estimation: </h3>
        <a [href]='pdf_file'>Telecharger le devis en pdf</a>
        <ul>
            <li>Valeur de la marchandise:<strong>{{devis_details.V}}</strong></li>
            <li>valeur taxable sur marchandise:<strong>{{devis_details.CAF}}</strong></li>
            <li>Taxe sur marchandise:<strong>{{devis_details.TSM}}</strong></li>
            <li>&nbsp;</li>
            <li>Assurance:<strong>{{devis_details.A}}</strong>€</li>
             <li>&nbsp;</li>
            <li>Port de depart:<strong>{{devis_details.PORT_DE_DEPART}}</strong></li>
            <li>Prix du transport (port à port)<strong>{{devis_details.P}}</strong></li>
            <li>Prise en charge <strong>{{devis_details.PC}}</strong></li>
            <li>Livraison à domicile <strong>{{devis_details.PT}}</strong></li>
             <li>&nbsp;</li>
            <li>taux de TVA:<strong>{{devis_details.TVA}}</strong>%</li>
            <li>valeur TVA:<strong>{{devis_details.TVA_VALUE}}</strong>€</li>
            <li>taux TVA sur prestation:<strong>{{devis_details.TVA_RU}}</strong>%</li>
            <li>valeur TVA sur prestation:<strong>{{devis_details.TVA_RU_VALUE}}</strong>€</li>
            <li>Total taxes locales:<strong>{{devis_details.TOTAL_REUNION}}</strong></li>
            <li>Taxes avant dedoienement:<strong>{{devis_details.TAXES}}</strong></li>
            <li>Dedoienement:<strong>{{devis_details.FR}}</strong></li>
             <li>&nbsp;</li>
              <li>&nbsp;</li>

            <li>Totalà payer:<strong>{{devis_details.TOTAL_A_PAYER}}</strong>€</li>
            
        </ul>
        <a [href]='pdf_file'>Telecharger le devis en pdf</a>
        </div>
        <div id="actions">
            <button *ngIf="has_IDB && devis_infos.date==null" class="btn btn-primary wide" (click)="save_devis()">Sauvegarder le devis</button>
             <button class="btn btn-primary wide" >Effefctuer la reservation maintenant!</button>
            <button class="btn btn-primary wide" (click)="create_devis()">Nouveau devis</button>
        </div>
        </div>`
})
export class DevisComponent implements OnInit{
    devis_infos: any;//les informations du devis
    devis_details: any; // le devis genere via le xwebservice de calcul
    pdf_file:string; // url vers le fichier pdf genere


    has_IDB: boolean = true; // pour savoir si a un acces aux base de données


    constructor( private _devis:DevisProvider,
                private _router:Router){}


    ngOnInit(){
        //chargement des données du devis....
        this.has_IDB = this._devis.has_IDB();
        this.devis_infos = this._devis.get_devis();

        //pour l'historique, remet le current_key a null 
        //@IMPORTANT: permet, si quitte l'application ici, de ne pas sauvegarder 
        //l'historique du formulaire!!!!
        this._devis.deactive_historic();

        this._devis.load_devis_details_async().then( (res)=>{
            console.log("fin chargment du devis...");
            this.devis_details = res.calculated_data;
            this.pdf_file = res.pdf_file;

        }).catch( (err) => {
            console.log(err);
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
        this._devis.save_current_devis().then( (success)=>{
            console.log("sauvegarde OK!!!");
        }).catch( (err)=>{
            console.log(err);
        })

    }

}