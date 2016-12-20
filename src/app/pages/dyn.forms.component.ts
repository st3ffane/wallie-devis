

import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { DevisProvider} from "../providers/devis.provider";



import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';

@Component({
  selector: 'devis-main',
  templateUrl:"dyn.forms.html",
  styleUrls:["dyn.forms.scss"]
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
  //devis:any = null;
  error:string;
  loading:boolean = true;

  

 //IMPORTANT
  group:string;//le groupe du formulaire (global, voitures,...)
  form:string;//le nom du formulaire (marchandise,...)

  routerSubscription:any;//angular: le listener pour les event location.popstate
  
  constructor(private _devis:DevisProvider,
            private route: ActivatedRoute,
            private _router:Router,
            private _ref:ElementRef){}


  //indique si le changement a ete validé  @DEPRECATED
  has_changed():boolean{
    return true;
  }



  ngOnInit(){
    
    //initialisation du composant:


    //en cas de back/prev directement depuis le navigateur, listen to Location.popstate...
    //ecoute les events du router
    this.routerSubscription = this._router.events.map( event => event instanceof NavigationEnd )
    .subscribe( (evt) => {
        //permet de savoir qd les parametres de l'URL on changés!!!
          
        if(evt === true) {

          //navigation finie, doit enregistrer une nouvelle entree dans l'historique 
          //SAUF si navigation via BACK ou NEXT...
          this.error = null;
          //tente d'afficher les données du formulaire
          this.make_form_from_url();
        }
    
    
     });
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
     
    // console.log("RELOAD to page "+this.group+","+this.form);
    //demande au providers la description de ce formulaire 
    this._devis.get_form_descriptor(this.group, this.form).then( (fi) =>{
        
        if(fi) {
          this.infos = fi;//affichage
        this._ref.nativeElement.scrollIntoView();
      }

        
        this.loading = false;

    }).catch( (err)=>{
      //erreur de chargement des données du formulaire, voir quoi faire...
      console.log(err);
      console.log("ici");
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
  next(evt:any){

    

    this.loading = true;
    this._devis.next(this.group,this.form).then( (fi)=>{
            //on est parti!!!
            this.loading = false;
           if(fi) return  this._router.navigate(["/devis",fi.group,fi.form]);
           return this._router.navigate(["/generated"]); //resultat a afficher

        }).catch( (err)=>{
          this.loading = false;
         this.error = err;
      this.infos = null;
        })



  
    
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
