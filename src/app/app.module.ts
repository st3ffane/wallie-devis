
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
import {HistoryProvider} from "./providers/history.provider";
// import {FormDetailResolve} from "./providers/guards/form.guard";

import {DynaFormTestProvider} from "./providers/dyna.form.test.provider";
import {DynaFormsModule} from "./dyna-forms/dyna.forms.module";

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
    path:"hello",
    component:MainPageComponent
  },
  {
    path: 'devis/:group/:form',
    component: DynFormsComponent,
    // resolve:{
    //   form_infos:FormDetailResolve
    // }
  },
  //voir si on decoupe tout....
  {
    path:"generated",
    component: DevisComponent
  }
]);



@NgModule({
  declarations: [
    DynFormsComponent,
    AppComponent,
    DevisComponent,
    MainPageComponent,

    //pour tester les types de fields, DEBUG ONLY
    DynaTestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routes,
    DynaFormsModule
  ],
  providers: [DevisProvider,
              HistoryProvider,
              // FormDetailResolve,
               DynaFormTestProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
