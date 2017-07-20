//
// Normalement, le formulaire dynamique devrait etre un module completement a part 
// pour pouvoir etre reutilisé plus facilement, MAIS, du fait des requetes extravagantes 
// necessaires pour faire recuperer les données de formulaire et du field 
// gps.expedom.component qui doit etre fortement lié a l'application, je load tout ca 
// comme des composants et providers normaux...




 /**
//  * Definition pour le formulaire dynamique...
//  * 
//  */
import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";//formulaire dynamiques
import { FormsModule } from '@angular/forms';

import { HttpModule } from '@angular/http';
import {CommonModule} from "@angular/common";

import {DynamicFormComponent} from "./dyna.form.component";
import {DynaFormItemComponent} from "./dyna.form.item.component";
import {FIELDS} from "./fields/fields";
import {DIALOGS} from "./dialogs/dialogs";

import {PIPES} from "./pipes/pipes";

import { AgmCoreModule } from '@agm/core';

import {PipesModule} from "app/pipes/pipes.module";

import {GmapGeocodeProvider} from "./providers/gmap.geocode.provider";
import {FNAAProvider} from "./providers/fnaa.provider";

/**
* Permet, a partir des proprietes d'un objet de generer un formulaire
* pour pouvoir modifier les valeurs

usage:
<dynamic-form [questions]="monElement.properties"></dynamic-form>
avec monElement:waahg-svg/datas/WaahgElement
et   properties:waahg-svg/datas/Abstractproperty
*/
@NgModule({
    imports:[
      CommonModule,
      HttpModule,
      FormsModule,
     ReactiveFormsModule,
     PipesModule,
     AgmCoreModule
     ],
    declarations:[DynamicFormComponent,DynaFormItemComponent,...FIELDS, ...DIALOGS, ...PIPES],
    providers:[GmapGeocodeProvider, FNAAProvider],
    exports:[DynamicFormComponent]
})
export class DynaFormsModule{}
