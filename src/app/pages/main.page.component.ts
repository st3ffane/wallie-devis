import {Component, OnInit} from "@angular/core";
import { DevisProvider} from "../providers/devis.provider";
import { Router } from "@angular/router";


/**
 * Landing page de l'application:
 * permet de demarrer la creation d'un devis
 * permet de recharger un devis precedement generer
 * liste les devis enregistrés en BdD et permet d'en afficher 1
 * 
 * 
 */
@Component({
    selector:"hello-cmp",
    templateUrl:'main.page.html',
    styleUrls:['main.page.scss']
    // template:`
    // <div>
    //     <h1>Bienvenue dans l'application de generation de devis</h1>
    //     <p>lore ipsum dolore sit amet, lore ipsum dolore sit amet, lore ipsum dolore sit amet</p>

    //     <div *ngIf="reload">
    //     <p>Un ancien formulaire est present en memoire. Voulez vous le reprendre???</p>
    //     <button (click)="reload_devis()">Reprendre</button>
    //     </div>
    //     <button (click)="create_devis()">Commencer</button>

    //     <div *ngIf="saved_devis.length > 0">
    //         <h3>Vos anciens devis sauvegardés:</h3>
    //         <ul>
    //             <li *ngFor="let saved of saved_devis" >
    //                 <span>{{saved.date | date:mediumDate}}</span> <a  (click)="to_generated( saved )">{{saved.title || "un titre"}}</a>
    //             </li>

    //         </ul>
    //     </div>
    // </div>
    // `
})
export class MainPageComponent{
    

    reload = false;//un simple semaphore pour me dire si a des données en memoire

    saved_devis = [];//les informations de devis chargés en BdD


    constructor( private _devis:DevisProvider,
                private _router:Router){}

    ngOnInit(){
        //au cas ou, desactive l'enregistrement de l'historique 
        this._devis.deactive_historic();


        //verifie si a un cache en memoire, si oui, propose de retourner en place 
        this.reload = Object.keys(this._devis._form_historic).length >0;


        //charge les devis sauvegardés precedement (tous?)
        this._devis.get_all_saved_devis().then( (devis)=>{
            // console.log(devis);
            this.saved_devis = <Array<any>>devis;
        }).catch( (err)=>{
            console.log(err);
        })
    }


    /**
     * Creation d'un nouveau devis 
     * cree les informations necessaires pour le devis 
     * navigue vers la premiere page du formulaire
     */
    create_devis(){
        //rcreation d'un nouveau devis pour le formulaire
        this._devis.create_new_devis();
        this._devis.next("","").then( (fi)=>{
            //on est parti!!!
            // console.log("informations recues");
            // console.log(fi);
            
            this._router.navigate(["/devis",fi.group,fi.form]);
        }).catch( (err)=>{
            console.log(err);
        })
        
    }

    /**
     * Si a un devis 'en cours', permet de revenir dans l'ancienne position 
     * ie: meme page du formulaire, meme historique de navigation
     */
    reload_devis(){
        // console.log("Reload le devis...");
        //ajoute toutes les entrees a l'historique
        let fi = this._devis.repop_historic();
        // console.log("dernier form infos");
        // console.log(fi);
        //navigue vers la page demandée
        this._router.navigate(["/devis",fi.group,fi.form]);
       
        
    }

    /**
     * Demande a afficher un devis deja enregistré en memoire
     * se comporte comme si avait rempli tout le formulaire deja, 
     * et relance une requete au webservice de calcul
     */
    to_generated(devis){
        console.log(devis);
      // this._devis.load_saved_devis(devis.id).then( (dt)=>{
            this._devis.set_devis_from_localstorage(devis);
            return this._router.navigate(['/generated']);
        // }).catch ( (err)=>{
        //     console.log(err);
        // });
        
    }
}