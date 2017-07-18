

import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { DevisProvider} from "../providers/devis.provider";
import {Observable} from "rxjs/Observable";



import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';

@Component({
  selector: 'devis-main',
  templateUrl:"dyn.forms.html",
  //styleUrls:["dyn.forms.scss"]
//   styles: [`
// .container{
//     width: 100%;
// }
// .formulaire{
//     width: 80%;
//     max-width: 700px;
//     min-width: 400px;
//     margin: 0 auto;

//     min-height: 90vh;
//     position: relative;
// }
// .app_title{
//     text-align:center;
// }
// .form-check{
//     display: flex;
// }
//   `]



})
export class DynFormsComponent implements OnInit{
  title = 'app works!'; //parfaitement utile, clé de voute psychologique de l'application!
  infos:any = undefined; //la description du formulaire a afficher
  infosObs = null;//l'observable

  //devis:any = null;
  error:string;
  loading:boolean = true;

  
  prec_form_name: string = null;//pour le bouton retour: le nom du formulaire precedent

 //IMPORTANT
  group:string;//le groupe du formulaire (global, voitures,...)
  form:string;//le nom du formulaire (marchandise,...)

  routerSubscription:any;//angular: le listener pour les event location.popstate
  
  constructor(private _devis:DevisProvider,
            private route: ActivatedRoute,
            private _router:Router,
            private _ref:ElementRef){

              /*this.infosObs = this._devis.getFormAsObservable();
              this.infosObs.subscribe((infos)=>{
                this.infos = infos;//mise a jour du formulaire
              })*/

            }


  //indique si le changement a ete validé  @DEPRECATED
  has_changed():boolean{
    return true;
  }



  ngOnInit(){
    
    console.log("get route params")
    //en cas de back/prev directement depuis le navigateur, listen to Location.popstate...
    //ecoute les events du router
    this.routerSubscription = this._router.events.map( event => event instanceof NavigationEnd )
    .subscribe( (evt) => {
        //permet de savoir qd les parametres de l'URL on changés!!!
        console.log("something here")
          console.log(evt);
        if(evt === true) {

          //navigation finie, doit enregistrer une nouvelle entree dans l'historique 
          //SAUF si navigation via BACK ou NEXT...
          this.error = null;
          //tente d'afficher les données du formulaire
          
          this.make_form_from_url();
        }
    
    
     });
     this.make_form_from_url();
  }
  ngOnDestroy(){
    //qd quitte la page, annule les listeners
      if(this.routerSubscription){
        this.routerSubscription.unsubscribe();
      }
  }


  /**
   * recupere la description du formulaire a afficher en fonction des
   * parametres de l'URL.
   * 
   */
  make_form_from_url(){
    this.loading = true;

    
    //recupere les parametres de l'URL
    this.group = this.route.snapshot.params['group']; //recup imediatement les données  
    this.form = this.route.snapshot.params['form']; //recup imediatement les données
     
    console.log("RELOAD to page "+this.group+","+this.form);
    //demande au providers la description de ce formulaire 
    this._devis.get_form_descriptor(this.group, this.form).then( (fi) =>{
        
        if(fi) {

          //recup le nom du formulaire dans historic -2
////(this._devis._current_historic_index);
//(this._devis._form_historic.length);
          this.prec_form_name = this._devis.getTitleFromHistoric(this.group, this.form);
         // if(this._devis._form_historic.length>0 && this._devis._current_historic_index>=0)  this.prec_form_name = this._devis._form_historic[this._devis._current_historic_index]["name"];
          //probleme: si revient depuis historique....


          console.log(fi)
          this.infos = fi;//affichage
          window.scrollTo(0,0);
        //this._ref.nativeElement.scrollIntoView();
      } else {
        console.log("pass de FI????")
      }

        
        this.loading = false;

    }).catch( (err)=>{
      //erreur de chargement des données du formulaire, voir quoi faire...
      console.log(err);
      //("ici");
      this.loading = false;
      this.error = err;
      this.infos = null;
    });
    
  }
  


  /**
   *  charge le prochain formulaire a afficher en fonction des 
   * parametres de l'url actuelle 
   * 
   * NOTE: si pas de formulaire en retour, part vers le resultats
   *      a revoir !!!!!
   */
  next(){

    

    this.loading = true;
    //initialisation du composant:
     //FUN but not GOOD
        window.scrollTo(0,0);

    this._devis.next(this.group,this.form).then( (fi)=>{
            //on est parti!!!
            this.loading = false;
            
            //si une erreur????
            //les differentes possibilités
            if(fi.error){
              throw fi.error_msg;//demande l'affichage de l'erreur et basta
            }
            if(fi.results) return this._router.navigate(["/generated"]); 
            if(fi.message) return this._router.navigate(["/demande"]);

            //sinon, navigue dans la prochaine page du formulaire
           return  this._router.navigate(["/devis",fi.group,fi.form]);

           

        }).catch( (err)=>{
          this.loading = false;
          this.error = err;
          this.infos = null;
        })



  
    
  }

  back(){
    //recharge la page precedente 
    //pour le cache, sauvegarde les valeurs du formulaires 
    for (let question of this.infos.fields) question.value = question.__value;//
    this._devis.back();
  }
  //@DEPRECATED
  set_value(cat:string, value:string, singular:boolean = true){
    //passe a la page suivante, enregistre la valeur actuelle
    //this._devis.set_devis_value(cat, value, singular);
    //this.infos = this._devis.next_page();
  }


  //@DEPRECATED
  get_current_property_name(){
    //return this._devis.get_current_property();
    return "";
  }
}
