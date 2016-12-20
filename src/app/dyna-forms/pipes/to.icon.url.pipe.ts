/**
 * Une pipe pour recuperer les informations dans le devis
 * sans passer par une methode (et eviter de devoir verifier
 * a chaque tick si les données sont encore valide...)
 */
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'toIconUrl'})
export class ToIconUrlPipes implements PipeTransform {
  transform(value: any): string {
      return "/wp-content/plugins/quote-generator/assets/img/marker-"+value+".svg";
   
  }
}