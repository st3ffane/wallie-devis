import {Component,HostListener} from "@angular/core";
import { DevisProvider} from "./providers/devis.provider";

/**
 * bootstrap l'application
 * permet juste d'afficher ce qui est sur toutes les pages ainsi que le router 
 * pour la navigation
 */

@Component({
    selector:"app-root",
    templateUrl:"app.component.html",// `<router-outlet></router-outlet>
    //<a routerLink="/test">dev test</a>
    //
    styleUrls:["app.component.scss"]
})
export class AppComponent{

    constructor(private _devis:DevisProvider){


    }
    //GESTION LOCALSTORAGE DE L'application
    ngOnInit() {

        //demarrage de l'application, charge les données du LOCALSTORAGE
        //  - le cache de données (les reponses precedentes au formulaire)
        //  - l'historic (si present)
        this._devis.load_from_LS();
        
    }
    
    //si l'application decide de quitter, tente de sauvegarder l'etat pour la prochaine fois
  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHander(event) {
    // enregistre les datas du formulaire courant???
     this._devis.save_to_LS();
     //window.localStorage.removeItem("app_datas"); DEBUG: me permet de remettre a zero le localstorage qd je joue trop avec...
  }


}


