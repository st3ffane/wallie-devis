/**
 * Une pipe pour recuperer les informations dans le devis
 * sans passer par une methode (et eviter de devoir verifier
 * a chaque tick si les données sont encore valide...)
 */
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'GetDevisResultPipe'})
export class GetDevisDetailsPipe implements PipeTransform {
  transform(value: any, group: string, name:string): string {
      console.log("recherche: group:"+group+", id:"+name);
     let frm = value[group] || value;
        if(frm) {
            //recherche le field
            console.log(frm);
            for(let field of frm.fields){
                console.log(field);
                if(name == field.id) return field.__value || field.value || "-- --";
            }
            
            
        }
        else return "-- --";
   
  }
}
