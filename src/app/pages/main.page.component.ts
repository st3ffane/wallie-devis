import {Component, OnInit} from "@angular/core";
import { DevisProvider} from "../providers/devis.provider";
import { Router } from "@angular/router";


/**
 * Landing page de l'application:
 * permet de demarrer la creation d'un devis
 * permet de recharger un devis precedement generer
 * 
 * 
 */
@Component({
    selector:"hello-cmp",
    template:`
    <div>
        <h1>Bienvenue dans l'application de generation de devis</h1>
        <p>lore ipsum dolore sit amet, lore ipsum dolore sit amet, lore ipsum dolore sit amet</p>

        <div *ngIf="reload">
        <p>Un ancien formulaire est present en memoire. Voulez vous le reprendre???</p>
        <button (click)="reload_devis()">Reprendre</button>
        </div>
        <button (click)="create_devis()">Commencer</button>

        <div *ngIf="saved_devis.length > 0">
            <h3>Vos anciens devis sauvegardés:</h3>
            <ul>
                <li *ngFor="let saved of saved_devis" >
                    <span>{{saved.date | date:mediumDate}}</span> <a  (click)="to_generated( saved )">{{saved.sgbd_title || "un titre"}}</a>
                </li>

            </ul>
        </div>
    </div>
    `
})
export class MainPageComponent{
    

    reload = false;

    saved_devis = [];
    constructor( private _devis:DevisProvider,
                private _router:Router){}

    ngOnInit(){
        //verifie si a un cache en memoire, si oui, propose de retourner en place 
        this.reload = Object.keys(this._devis.devis_infos).length >0;
        this._devis.get_all_saved_devis().then( (devis)=>{
            console.log(devis);
            this.saved_devis = <Array<any>>devis;
        }).catch( (err)=>{
            console.log(err);
        })
    }
    create_devis(){
        //rcreation d'un nouveau devis pour le formulaire
        this._devis.create_new_devis();
        this._devis.next("","").then( (fi)=>{
            //on est parti!!!
            console.log("informations recues");
            console.log(fi);
            
            this._router.navigate(["/devis",fi.group,fi.form]);
        }).catch( (err)=>{
            console.log(err);
        })
        
    }

    reload_devis(){
        console.log("Reload le devis...");
        //ajoute toutes les entrees a l'historique????                      VOIR SI POSSIBLE SANS TROP DE PROBLEME///
        //navigue vers la page 
        
    }

    to_generated(devis){
        console.log(devis);
        this._devis.set_devis_from_localstorage(devis);
        this._router.navigate(['/generated']);
    }
}