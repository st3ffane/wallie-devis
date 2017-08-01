/**
 * Une pipe pour recuperer les informations dans le devis
 * sans passer par une methode (et eviter de devoir verifier
 * a chaque tick si les données sont encore valide...)
 */
import { Pipe, PipeTransform } from '@angular/core';


//import {TARGET} from "../../target";

@Pipe({name: 'isvalid'})
export class IsValidPipes implements PipeTransform {
  
  transform(value: any): boolean {
      return true;
   
  }
}