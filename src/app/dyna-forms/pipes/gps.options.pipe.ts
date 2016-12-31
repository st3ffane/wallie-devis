/**
 * Une pipe pour recuperer les informations dans le devis
 * sans passer par une methode (et eviter de devoir verifier
 * a chaque tick si les données sont encore valide...)
 */
import { Pipe, PipeTransform } from '@angular/core';
import {TARGET} from "../../target";

@Pipe({name: 'gpsoption'})
export class GpsOptionsPipe implements PipeTransform {
  transform(value: any, key:string, prop:string) {
      console.log(value)
      for(let opt of value.options){
          console.log(opt)
          if (opt.label == key && opt[prop]) return opt[prop];
      }
      return "";
   
  }
}