import {Injectable} from "@angular/core";

/**
 * tente de sauvegarder l'etat de l'application et de la reloader entiereemnt
 * ie: historic de navigation, valeur actuelle des données....
 * lors d'un rechargement de page
 * 
 */

const KEY = "app_historic";

@Injectable()
export class HistoryProvider{

    historic = [];

    constructor(){

    }

    load_historic(){
        //charge l'historique provennant du localstorage 
        if(window.localStorage){
            let d = window.localStorage.getItem(KEY);
            if(d){
                this.historic = JSON.parse(d);
                //remet en place le dernier historique de l'application
                for(let params of this.historic){
                    //ajoute les entrées a l'historic
                    console.log(params);
                    window.history.pushState(null,"","/devis/"+params["group"]+"/"+params["form"]);
                }
                
            }
        }
    }
    save_historic(){
        //enregistre l'historic dans le LS
        if(window.localStorage){
            let d = JSON.stringify(this.historic);
           window.localStorage.setItem(KEY,d);//save!!!
        }
    }
    push(url:any){
        //ajoute une entrée a l'historique
        this.historic.push( url );
    }
    pop(){
        //supprime le dernier element de l'historique 
        return this.historic.pop();
    }
    clear(){
        //efface tout l'historique 
        this.historic = [];
    }
}