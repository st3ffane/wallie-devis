import {Component} from "@angular/core";
import {DevisProvider} from "../providers/devis.provider";

@Component({
    selector:'demande-page',
    templateUrl:'./demande.html',
    styleUrls:["./demande.scss"]
})
export class DemandeComponent {

    constructor(private _devis:DevisProvider){}
    ngOnInit(){
        this._devis.deactive_historic();
    }
}