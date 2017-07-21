import {Component, Input, ChangeDetectorRef} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {DevisProvider} from "../../../providers/devis.provider";

@Component({
  selector:"exp-expert",
  templateUrl:"./expert.taux.html",
  styleUrls:["./expert.taux.scss"]
})
export class ExpertTaux {
    @Input()question:any;
    @Input() form:FormGroup;
    //@Input() formulaire;//pour pouvoir faire les modifications

     constructor( private _devis:DevisProvider,
        private _changeRef:ChangeDetectorRef){}

    ngOnInit(){

    }
}