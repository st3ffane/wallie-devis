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
// import {NgModule} from "@angular/core";
// import {ReactiveFormsModule} from "@angular/forms";//formulaire dynamiques


// import {CommonModule} from "@angular/common";
// import { AgmCoreModule } from 'angular2-google-maps/core';

// import {DynamicFormComponent} from "./dyna.form.component";
// import {DynaFormItemComponent} from "./dyna.form.item.component";
// import {DynaArborescenceComponent} from "./fields/dyna.arborescence.component";
// import {GPSExpedomComponent} from "./fields/gps.expedom.component";

// import {GmapGeocodeProvider} from "./providers/gmap.geocode.provider";

// import {GMAP_KEY} from "../gmap.key";
// /**
// * Permet, a partir des proprietes d'un objet de generer un formulaire
// * pour pouvoir modifier les valeurs

// usage:
// <dynamic-form [questions]="monElement.properties"></dynamic-form>
// avec monElement:waahg-svg/datas/WaahgElement
// et   properties:waahg-svg/datas/Abstractproperty
// */
// @NgModule({
//     imports:[CommonModule, ReactiveFormsModule,AgmCoreModule.forRoot({
//       apiKey: GMAP_KEY//'AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038'
//     })],
//     declarations:[DynamicFormComponent,DynaFormItemComponent,DynaArborescenceComponent,GPSExpedomComponent],
//    providers:[GmapGeocodeProvider],
//     exports:[DynamicFormComponent]
// })
// export class DynaFormsModule{}
