import{Pipe} from "@angular/core";


@Pipe({name: 'ouinon'})
export class BooleanPipe {
  constructor(){}

  transform(check) {
    return check ? "Oui" :"Non";
  }
}