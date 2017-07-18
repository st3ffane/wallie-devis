import {Component, OnInit} from "@angular/core";
import {DevisProvider} from "../providers/devis.provider";

import { Router } from "@angular/router";

@Component({
    selector:'demande-page',
    templateUrl:'./demande.html',
    styleUrls:["./demande.scss"]
})
export class DemandeComponent  implements OnInit{

    loading:boolean = true;
    error:string = null; //en cas de probleme....

    constructor(
    	private _devis:DevisProvider,
    	private _router:Router){}
    ngOnInit(){
        this._devis.deactive_historic();

          this._devis.load_devis_details_async()//this.requested_keys)
        .then( (res:any)=>{

            return new Promise( (resolve, reject)=>{
                
                console.log('demande spéciale envoyée');

                
            });
            
            
        }).catch( (err) => {
            //(err);
            this.loading = false;
            this.error = err;
        });


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
            //(err);
        })
        
    }


}