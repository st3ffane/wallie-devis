

import { Component, OnInit, HostListener } from '@angular/core';
import { DevisProvider} from "../providers/devis.provider";

import { HistoryProvider} from "../providers/history.provider";


import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';

@Component({
  selector: 'devis-main',
  template: `
<div class="container">
    <h2 class="app_title">Calculateur de devis</h2>
    <div *ngIf="error">
      <span>Oups, nous avons eu un probleme de chargement des informations....</span>
      <a routerLink="/">Retour a l'acceuil</a>
    </div>

    <div *ngIf="infos">
            <!-- test only, cree un formulaire a partir des infos passées par le js 
            voir a mettre en forme les données.... -->
            <div class="formulaire">
                <dynamic-form [formulaire]="infos" (submit)="next()"></dynamic-form>
            <div>
           
    </div>
    
</div>
  `,
  styles: [`
.container{
    width: 100%;
}
.formulaire{
    width: 80%;
    max-width: 700px;
    min-width: 400px;
    margin: 0 auto;

    min-height: 90vh;
    position: relative;
}
.app_title{
    text-align:center;
}
.form-check{
    display: flex;
}
  `]



})
export class DynFormsComponent implements OnInit{
  title = 'app works!';
  infos:any = undefined;
  //devis:any = null;
  error:string;

 //IMPORTANT
  group:string;//le groupe du formulaire (global, voitures,...)
  form:string;//le nom du formulaire (marchandise,...)

  routerSubscription:any;


  constructor(private _devis:DevisProvider,
            private route: ActivatedRoute,
            private _router:Router){}

  ngOnInit(){
    // console.log("Initialisation du composant formulaire  -1er visite");
    //initialisation du composant:
    //1 recup les infos dans l'URL pour savoir quoi demander
    //2 recup les infos dans localstorage pour prepopulation
    //3 affiche le resultat....

    //en cas de back/prev directement depuis le navigateur...
    //ecoute les events du router
    this.routerSubscription = this._router.events.map( event => event instanceof NavigationEnd )
    .subscribe( (evt) => {
       //permet de savoir qd les parametres de l'URL on changés!!!
        
      if(evt === true) {

        //navigation finie, doit enregistrer une nouvelle entree dans l'historique 
        //SAUF si navigation via BACK ou NEXT...


        //  console.log("Navigation ended");
        this.error = null;
        //tente d'afficher les données du formulaire
        //si pas de données, annule la navigation
        this.make_form_from_url();
      }
    
    
  });
  }
  ngOnDestroy(){
    //qd quitte la page, n'ecoute plus les infos....
    // console.log("quitte la page");
      if(this.routerSubscription){

        this.routerSubscription.unsubscribe();
      }
  }

  make_form_from_url(){


    this.group = this.route.snapshot.params['group']; //recup imediatement les données  
    this.form = this.route.snapshot.params['form']; //recup imediatement les données
     
    //enrgistre dans l'historic
    //this._history.push({"group":this.group, "form":this.form});

    // console.log(this.group+","+this.form);
    //demande au providers la description de ce formulaire 
    //probleme, si arrive directement ici, doit le charger....
    this._devis.get_form_descriptor(this.group, this.form).then( (fi) =>{

        if(fi) this.infos = fi;//affichage

    }).catch( (err)=>{
      //erreur de chargement des données du formulaire, voir quoi faire...
      console.log(err);
    });
    
  }
  


 
  next(evt:any){
    this._devis.next(this.group,this.form).then( (fi)=>{
            //on est parti!!!
           if(fi) return  this._router.navigate(["/devis",fi.group,fi.form]);
           return this._router.navigate(["/generated"]); //resultat a afficher

        }).catch( (err)=>{
          console.log("une erreur de navigation");
            console.log(err);
        })



  
    
  }
  set_value(cat:string, value:string, singular:boolean = true){
    //passe a la page suivante, enregistre la valeur actuelle
    //this._devis.set_devis_value(cat, value, singular);
    //this.infos = this._devis.next_page();
  }

  get_current_property_name(){
    //return this._devis.get_current_property();
    return "";
  }
}
