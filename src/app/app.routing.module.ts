import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

//les composants principaux de l'application
import { AppComponent } from './app.component';//bootstrap
import {DevisComponent} from "./pages/devis.component";//resultat du devis
import {MainPageComponent} from "./pages/main.page.component";//landing page 
import {DynFormsComponent} from "./pages/dyn.forms.component";//ce qui genere les formulaires
import {DemandeComponent} from "./pages/demande.component";//marchandise = autre



const routes:Routes =[ 
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
  imports: [
    RouterModule.forRoot(
      routes,
      //{ enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}