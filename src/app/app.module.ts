
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';


//les composants principaux de l'application
import { AppComponent } from './app.component';//bootstrap
import {DevisComponent} from "./pages/devis.component";//resultat du devis
import {MainPageComponent} from "./pages/main.page.component";//landing page 
import {DynFormsComponent} from "./pages/dyn.forms.component";//ce qui genere les formulaires

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

import {AutoScrollComponent} from "./directives/autoscroll.component";

import {GPSExpedomComponent} from "./dyna-forms/fields/gps.expedom.component";

import {GmapGeocodeProvider} from "./dyna-forms/providers/gmap.geocode.provider";
import {GMAP_KEY} from "./gmap.key";

import {GetDevisDetailsPipe} from "./pipes/get.devis.details.pipe";
import {ToIconUrlPipes} from "./dyna-forms/pipes/to.icon.url.pipe";
//bootstrap 
//import { ButtonsModule } from 'ng2-bootstrap/ng2-bootstrap';
//normalement, je devrais definir un fichier special pour ca, mais vu qu'il y a pas
//grand chose....
let routes = RouterModule.forRoot([
  {
    path:"",
    redirectTo:"/hello",
    pathMatch: 'full'
  },
  {
    path: 'test',
    component: DynaTestComponent  //juste pour pouvoir tester a fond les forms dynamiques
  },
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
  }
  //, { path: '**', component: MainPageComponent }
]);



@NgModule({
  declarations: [
    DynFormsComponent,
    AppComponent,
    DevisComponent,
    MainPageComponent,

    
    DynaTestComponent,
    DynamicFormComponent,
    DynaFormItemComponent,
    DynaArborescenceComponent,
    DynaArborescence2Component,
    GPSExpedomComponent,

    GetDevisDetailsPipe,
    ToIconUrlPipes,

    AutoScrollComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routes,
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
              // FormDetailResolve,
               DynaFormTestProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
