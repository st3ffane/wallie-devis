/**
 * Definition pour le formulaire dynamique...
 * 
 */
import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";//formulaire dynamiques


import {CommonModule} from "@angular/common";
import { AgmCoreModule } from 'angular2-google-maps/core';

import {DynamicFormComponent} from "./dyna.form.component";
import {DynaFormItemComponent} from "./dyna.form.item.component";
import {DynaArborescenceComponent} from "./fields/dyna.arborescence.component";
import {GPSExpedomComponent} from "./fields/gps.expedom.component";




/**
* Permet, a partir des proprietes d'un objet de generer un formulaire
* pour pouvoir modifier les valeurs

usage:
<dynamic-form [questions]="monElement.properties"></dynamic-form>
avec monElement:waahg-svg/datas/WaahgElement
et   properties:waahg-svg/datas/Abstractproperty
*/
@NgModule({
    imports:[CommonModule, ReactiveFormsModule,AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038'
    })],
    declarations:[DynamicFormComponent,DynaFormItemComponent,DynaArborescenceComponent,GPSExpedomComponent],
    exports:[DynamicFormComponent]
})
export class DynaFormsModule{}
