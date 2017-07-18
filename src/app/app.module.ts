
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes }   from '@angular/router';
import "./rxjs-operators";

//les composants principaux de l'application
import { AppComponent } from './app.component';//bootstrap
import {DevisComponent} from "./pages/devis.component";//resultat du devis
import {MainPageComponent} from "./pages/main.page.component";//landing page 
import {DynFormsComponent} from "./pages/dyn.forms.component";//ce qui genere les formulaires
import {DemandeComponent} from "./pages/demande.component";//marchandise = autre

//debug only
import {DynaTestComponent} from './pages/dyna.test.component';



//import { DevisRestProvider} from "./providers/devis.rest.provider";
import {DevisProvider} from "./providers/devis.provider";
// import {FormDetailResolve} from "./providers/guards/form.guard";
// import {FormDeactiveGuard} from "./providers/guards/form.deactive.guard";

import {DynaFormTestProvider} from "./providers/dyna.form.test.provider";
//import {DynaFormsModule} from "./dyna-forms/dyna.forms.module";



//reactive forms et generation dynamique des formulaires
import {ReactiveFormsModule} from "@angular/forms";//formulaire dynamiques

import { AgmCoreModule } from 'angular2-google-maps/core';

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

import {GMAP_KEY} from "./gmap.key";

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
let routes:Routes =[ 
  {
    path:"",
    redirectTo:"/hello",
    pathMatch: 'full'
  },
  /*{
    path: 'test',
    component: DynaTestComponent  //juste pour pouvoir tester a fond les forms dynamiques
  },*/
 {
    path:"devis-transport-demenagement-reunion",
    component:MainPageComponent
  },
  {
    path:"hello",
    component:MainPageComponent
  },
  {
    path: 'devis/:group/:form',
    component: DynFormsComponent,
    //canDeactivate:[FormDeactiveGuard] n'empeche pas l'URL de changer...
    // resolve:{
    //   form_infos:FormDetailResolve
    // }
  },
  //voir si on decoupe tout....
  {
    path:"generated",
    component: DevisComponent
  },
  {
    path:"demande",
    component: DemandeComponent
  }
  , { path: '**', component: MainPageComponent }//regle pe le probleme de l'URL avec quote_id???
];



@NgModule({
  declarations: [
    DynFormsComponent,
    AppComponent,
    DevisComponent,
    MainPageComponent,
    DemandeComponent,
    
    DynaTestComponent,
    DynamicFormComponent,
    DynaFormItemComponent,
    DynaArborescenceComponent,
    DynaArborescence2Component,
    GPSExpedomComponent,
    FNAAComponent,
    FNAAGroupComponent,
    
    GetDevisResultPipe,
    ToIconUrlPipes,
    SafeHtmlPipe,
    StripHtmlPipe,
    GpsOptionsPipe,
    BooleanPipe,
    FNAAGroupPipe,
    GetDevisDetailsPipe,
    //AutoScrollComponent
    ConfirmDialog

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(
      routes,
      //{ enableTracing: true } // <-- debugging purposes only
    ),
    //ButtonsModule,
    //DynaFormsModule
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: GMAP_KEY//'AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038'
    })
  ],
  providers: [DevisProvider,
              //FormDeactiveGuard,
              GmapGeocodeProvider,
              FNAAProvider,
               DynaFormTestProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
