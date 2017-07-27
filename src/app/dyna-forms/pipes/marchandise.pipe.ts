/**
 * Une pipe pour recuperer les informations dans le devis
 * sans passer par une methode (et eviter de devoir verifier
 * a chaque tick si les données sont encore valide...)
 */
import { Pipe, PipeTransform } from '@angular/core';


//import {TARGET} from "../../target";

@Pipe({name: 'marchandise'})
export class MarchandiseTypePipes implements PipeTransform {
  
  transform(value: any, field:any): string {
      //affichage de la marchandise:
      //si une simple string, renvoie la
      if(!value) return "non renseigné";
      //sinon, recherche le type de la valeur
      //let dv = this._devis.get_devis()[id];
      
      console.log("formulaire:",field);
      let v= field.value;
      if(typeof v == "string") return v;
      if(v.filter && v.marchandise){
        //2 cas: que marchandise ou les taux aussi
        return v.marchandise_label || v.marchandise;
      }
       
      //recupe le field
      return "Invalide";
   
  }
}