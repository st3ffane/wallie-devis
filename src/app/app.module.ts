
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes }   from '@angular/router';
import "./rxjs-operators";


//import {ReactiveFormsModule} from "@angular/forms";//formulaire dynamiques
import { FormsModule } from '@angular/forms';
//les composants principaux de l'application
import { AppComponent } from './app.component';//bootstrap
import {DevisComponent} from "./pages/devis.component";//resultat du devis
import {MainPageComponent} from "./pages/main.page.component";//landing page 
import {DynFormsComponent} from "./pages/dyn.forms.component";//ce qui genere les formulaires
import {DemandeComponent} from "./pages/demande.component";//marchandise = autre


//le module pour le provider principal
import {CoreModule} from "./providers/provider.module";

//les formulaires dynamiques
import {DynaFormsModule} from "./dyna-forms/dyna.forms.module";

//des composants pour tout le monde
import {PipesModule} from "./pipes/pipes.module";

//les routes de l'application
import { AppRoutingModule } from './app.routing.module';
//import { AgmCoreModule } from 'angular2-google-maps/core';
import { AgmCoreModule } from '@agm/core';
import {GMAP_KEY} from "./gmap.key";

/*
//reactive forms et generation dynamique des formulaires
import {ReactiveFormsModule} from "@angular/forms";//formulaire dynamiques



import {DynamicFormComponent} from "./dyna-forms/dyna.form.component";
import {DynaFormItemComponent} from "./dyna-forms/dyna.form.item.component";
import {DynaArborescenceComponent} from "./dyna-forms/fields/dyna.arborescence.component";
import {DynaArborescence2Component} from "./dyna-forms/fields/dyna.arborescence2.component";
import {FNAAComponent} from "./dyna-forms/fields/expedom/fnaa";
import {FNAAGroupComponent} from "./dyna-forms/fields/expedom/fnaa.group";

//import {AutoScrollComponent} from "./directives/autoscroll.component";
import {ConfirmDialog} from "./dyna-forms/dialogs/confirm.dialog";

import {GPSExpedomComponent} from "./dyna-forms/fields/expedom/gps.expedom.component";

import {GmapGeocodeProvider} from "./dyna-forms/providers/gmap.geocode.provider";
import {FNAAProvider} from "./dyna-forms/providers/fnaa.provider";


import {GetDevisResultPipe} from "./pipes/get.devis.result.pipe";
import {GetDevisDetailsPipe} from "./pipes/get.devis.details.pipe";
import {ToIconUrlPipes} from "./dyna-forms/pipes/to.icon.url.pipe";
import {SafeHtmlPipe} from "./pipes/safe.html.pipe";
import {StripHtmlPipe} from "./pipes/strip.html.pipe";
import {GpsOptionsPipe} from "./dyna-forms/pipes/gps.options.pipe";
import {BooleanPipe} from "./pipes/boolean.pipe";
import {FNAAGroupPipe} from "./dyna-forms/pipes/fnaa.group.pipe";

//bootstrap 
//import { ButtonsModule } from 'ng2-bootstrap/ng2-bootstrap';
//normalement, je devrais definir un fichier special pour ca, mais vu qu'il y a pas
//grand chose....
//let routes = RouterModule.forRoot([

*/

@NgModule({
  declarations: [
    DynFormsComponent,
    AppComponent,
    DevisComponent,
    MainPageComponent,
    DemandeComponent,
    //DynaTestComponent,
    // DynamicFormComponent,
    // DynaFormItemComponent,
    // DynaArborescenceComponent,
    // DynaArborescence2Component,
    // GPSExpedomComponent,
    // FNAAComponent,
    // FNAAGroupComponent,
    
    // GetDevisResultPipe,
    // ToIconUrlPipes,
    // SafeHtmlPipe,
    // StripHtmlPipe,
    // GpsOptionsPipe,
    // BooleanPipe,
    // FNAAGroupPipe,
    // GetDevisDetailsPipe,
    // //AutoScrollComponent
    // ConfirmDialog

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CoreModule.forRoot({}),
    
    PipesModule,
    // ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: GMAP_KEY//'AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038'
    }),
    DynaFormsModule,
  ],
  providers: [
              // GmapGeocodeProvider,
              // FNAAProvider
              ],
  bootstrap: [AppComponent]
})
export class AppModule { }
