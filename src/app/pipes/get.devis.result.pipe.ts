/**
 * Une pipe pour recuperer les informations dans le devis
 * sans passer par une methode (et eviter de devoir verifier
 * a chaque tick si les données sont encore valide...)
 */
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'GetDevisDetailsPipe'})
export class GetDevisResultPipe implements PipeTransform {
  transform(value: any, group: string, name:string): string {
      
     let frm = value[group];
        if(frm) {
            //recherche le field
            for(let field of frm.fields){
                if(name == field.id) return field.value || "-- --";
            }
            
            
        }
        else return "NON RESEIGNE";
   
  }
}