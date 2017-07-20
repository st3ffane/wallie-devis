/*import {Component, OnInit} from "@angular/core";
import {DynaForm} from "../dyna-forms/forms/dyna.form";
import {DynaFormTestProvider} from "../providers/dyna.form.test.provider";

/**
 * @DEBUG ONLY: me permet de generer simplment et rapidement un formulaire de test
 *
@Component({
    selector: "test-dyna-forms",
    template:`
        <div>
            <h3>Test formulaire dynamique</h3>
            <div *ngIf="infos" class="formulaire">
                <dynamic-form [formulaire]="infos" (submitted)="next()"></dynamic-form>
            <div>
        </div>
    `
})
export class DynaTestComponent implements OnInit{
    infos: DynaForm = null;

    constructor(private _test:DynaFormTestProvider){}

    ngOnInit(){
        //recupere le formulaire a tester et affiche...
        this._test.load_form_description().then( (form)=> this.infos = form);
    }

    next(){
        console.log("doing submit!!!!");
    }
}
*/