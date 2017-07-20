
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

import {enableProdMode} from '@angular/core';
enableProdMode();


@NgModule({
  declarations: [
    DynFormsComponent,
    AppComponent,
    DevisComponent,
    MainPageComponent,
    DemandeComponent,
    

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CoreModule.forRoot({}),
    
    PipesModule,
    AgmCoreModule.forRoot({
      apiKey: GMAP_KEY//'AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038'
    }),
    DynaFormsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
