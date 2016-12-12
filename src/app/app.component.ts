import {Component,HostListener} from "@angular/core";
import { DevisProvider} from "./providers/devis.provider";

/**
 * bootstrap l'application
 * permet juste d'afficher ce qui est sur toutes les pages ainsi que le router 
 * pour la navigation
 */

@Component({
    selector:"app-root",
    template: `<router-outlet></router-outlet>
    <a routerLink="/test">dev test</a>
    `
})
export class AppComponent{

    constructor(private _devis:DevisProvider){


    }
    //GESTION LOCALSTORAGE DE L'application
    ngOnInit() {
        this._devis.load_from_LS();
        
    }
    //si l'application decide de quitter, tente de sauvegarder l'etat pour la prochaine fois
  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHander(event) {
    // enregistre les datas du formulaire courant???
   this._devis.save_to_LS();
  }


}


