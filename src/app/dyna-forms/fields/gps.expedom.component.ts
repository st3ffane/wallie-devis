import {Component, OnInit, Input} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GmapGeocodeProvider} from "../providers/gmap.geocode.provider";
/**
 * Un composant pour gerer l'affichage des informations GPS 
 * pour l'application expedom
 * NOTE/ c'est tellement specifique que je sais pas si ca pourra etre reutilisé qqpart....
 * 
 * <sebm-google-map-marker  *ngFor="let m of question.options"
            [latitude]="m.lat" [longitude]="m.lng" [label]="m.label">
                <sebm-google-map-info-window>
                        <strong>{{m.label}}</strong>
                        <p>{{m.description}}</p>
                        <input type="radio">Selectionne
                </sebm-google-map-info-window>    
        </sebm-google-map-marker>

         <sebm-google-map-marker  *ngFor="let m of question.options"
            [latitude]="m.lat" [longitude]="m.lng" [label]="m.label">
                <sebm-google-map-info-window>
                        <strong>{{m.label}}</strong>
                        <p>{{m.description}}</p>
                        <input type="radio">Selectionne
                </sebm-google-map-info-window>    
 */
@Component({
    selector:"dyna-gps",
    template:`
    <div [formGroup]="form">


        <div *ngIf="!position">
            <p>Afin de permettre de calculer les tarifs, nous procedons a votre localisation GPS.</p>
        </div>
        <div *ngIf="position">
            
                    <span *ngIf="!position.zipcode">
                        <p>Vous n'avez pas pu etre geolocalisé, merci de renseigner votre numero de département</p>
                    </span>
                    <span *ngIf="position.zipcode">Vous avez été géolocalisé: <strong>{{position.name+"("+position.zipcode+")"}}</strong></span>
                    <div >
                        <h4>Choisir un autre Departement</h4>
                        <input type="text" value="Un autre departement" #zipcode [value]="position.zipcode || '' "><button type="button" (click)="localise_from_zipcode(zipcode.value)">Localisation</button>
                    </div>
                    
                
            
         </div>



            <!-- pour pouvoir filtrer les reponses -->
            <div *ngFor="let qfilter of question.options">
                <label>
                <input type="radio" [(ngModel)]="filter" 
                    [formControlName]="filter_form_ctrl"
                    [attr.name]="filter_form_ctrl"
                    [value]="qfilter.label"                
                    #trigger>
                {{qfilter.label}}</label>
                <p>{{qfilter.description}}</p>
                
                

                <div *ngIf="qfilter.locations && trigger.checked">
                    <input *ngIf="question['use-text-filter']" 

                            type="text" 
                            list="choices"
                            [(ngModel)]="search" 
                            [formControlName]="search_form_ctrl"
                            placeholder="Entrez les premieres lettres">
                    <datalist id="choices">
                        <option *ngFor="let l of filtered_datalist" [value]="l">
                    </datalist>
                </div>
            </div>

       





        

        <sebm-google-map [latitude]="position?.lat || question?.default_location.lat" [longitude]="position?.long || question?.default_location.lat"
            [zoom]="def_zoom">
            <div *ngFor="let opt of filtered_options">

                    
                    <div *ngIf="position">
                        <!-- DOMICILE : permet d'afficher les differents prix: Toujours afficher a l'ecran-->
                        <sebm-google-map-info-window  [latitude]="position?.lat" [longitude]="position?.long" [isOpen]="'true'">
                            <strong>Retrait/livraison à domicile</strong>
                            <p>Une description?</p>

                            <fieldset>
                                <label  *ngFor="let price of position?.options">
                                    <input [formControlName]="question.id"                        
                                    type="radio" 
                                    [(ngModel)]="question.value"
                                    [value]="price.value"
                                    class="form-check-input"
                                    required>{{price.description}}
                                </label>
                            </fieldset>


                            <!--input [formControlName]="question.id"                        
                            type="radio" 
                            [(ngModel)]="question.value"
                            [value]="opt.value"
                            class="form-check-input"
                            required
                            >Selectionne -->
                        </sebm-google-map-info-window> 
                    </div>
            


            
                <!-- les ports et les depots -->
                <sebm-google-map-marker  *ngFor="let m of opt.locations; let count = opt.locations.length"
                    [latitude]="m?.lat" [longitude]="m?.lng" [label]="m?.id | slice:0:1 | uppercase">

                    <!-- si une seule reponse, affiche directement l'infos window???  -->
                    <sebm-google-map-info-window [isOpen]="count == 1">
                        <div class="infos">
                            <strong>{{m?.label}}</strong>
                            <p>{{m?.description}}</p>
                            <fieldset>
                                <label  *ngFor="let price of m?.options">
                                    <input [formControlName]="question.id"                        
                                    type="radio" 
                                    [(ngModel)]="question.value"
                                    [value]="price.value"
                                    class="form-check-input"
                                    required>{{price.description}}
                                </label>
                            </fieldset>
                        </div>
                    </sebm-google-map-info-window>   

                </sebm-google-map-marker>
            

            </div>
            
        
        </sebm-google-map>
    </div>
    `,
    styles:[`
    .sebm-google-map-container {
        height: 400px;
        }
    sebm-google-map-info-window > div{
        display: flex;

    }
    `]
})
export class GPSExpedomComponent{
    @Input()question:any;
    @Input() form:FormGroup;
    noGeo: boolean = false;

    is_localising:boolean = true;//par defaut, tente de se localiser...

    constructor(private _gmap:GmapGeocodeProvider){}
    //position GPS de l'utilisateur
    position:any = null;
    def_zoom = 6;//niveau de zoom de la map par defaut


    //le necessaire pour les formulaires presents ici
    //recherche zone text
    _search:string = "";
    search_form_ctrl= null;

    //choix du filtre
    _filter:string ;
    filter_form_ctrl = null;

    get filter(){return this._filter;}
    set filter(value){
        this._filter = value;
        this._search = null;
        this.remap_options();
        //remet a zero le choix
        this.question.value = null;
    }
    get search(){
        return this._search;

    }
    set search(v){
        this._search = v;
        this.remap_options();
        
        
    }
    //le choix pour ce formulaire


    ngOnInit(){
        //creation des elements de formulaires necessaires
        this.create_forms_elements();

        //mappe les locations a afficher sur la map
        this.remap_options();
        
        //recupere les coordonnées GPS si dispo, sinon????
        this.geolocalise().then( (pos)=> {
            this.position = pos;
            //demande le nom du patelin 
            return this._gmap.get_departement_from_coords_async(this.position.latitude,this.position.longitude);

        }).then( (rep)=>{

            //VERIFIE SI LE PAYS EST BON.....
            this.position = rep;
            this.is_localising = false;

            return true;
        })
        .then ( (good)=>{
            if(good){
                //recupere la table des prix
            } else {
                //une erreur
            }
        }).catch( (err)=>{
            
             this.position = {};//remet a zero??? ou garde l'ancien????
             this.is_localising = false;
        });

        
   
    }



    localise_from_zipcode(zipcode){
        console.log("recherche localisation...");
        console.log("zipcode:"+zipcode);
        this.is_localising = true;
        this._gmap.get_coords_from_departement_async(zipcode).then( (rep)=>{
            // VERIFIE SI PAYS OK


            this.position = rep;
            this.is_localising = false;

            return true;
        }).then ( (good)=>{
            if(good){
                //recupere la table des prix
            } else {
                //une erreur
            }
        }).catch( (err)=>{
            console.log(err);
            
            this.position = {};//remet a zero??? ou garde l'ancien????
            this.is_localising = false;
        });

    }
    private geolocalise(){
        return new Promise ( (resolve, reject)=>{
             if(navigator.geolocation){
                console.log("geolocalisation ON");
                navigator.geolocation.getCurrentPosition((pos)=>{
                    if(pos.coords){
                        resolve(pos.coords);
                        console.log(this.position);
                    }  
                    else reject("no coords");
                },
                (err)=>{
                    reject(err);
                });
            } else {
                reject("geolocalisation OFF");
            }
        });
    }

    /**
     * Creation des elements du formulaire pour ce control
     * angular specific
     */
    create_forms_elements(){
        //zone de recherche        
        this.search_form_ctrl = "gps_search_"+this.question.id
        this.form.addControl(this.search_form_ctrl, new FormControl(''));

        this.filter_form_ctrl = "gps_filter_"+this.question.id;
        this.form.addControl(this.filter_form_ctrl, new FormControl(''));
    }


   
    filtered_options=undefined; //les options sur la map
    filtered_datalist=undefined;//les options de la datalist 

   
   /**
    * a partir des options fournis dans le descripteur du control;
    * cree les listes filtrées (suivant les types et la zone de recherche) valides pour affichage
    */
    remap_options(evt?:any){
         //probleme, occure avant le changement de filter...
        let opt = [];
        //appellé lors d'un clic sur un filtre, recree le tableau d'options
        if(this.filter === undefined) {
            this.filtered_options = this.question.options;
            this.filtered_datalist = null;//pas de filtre possible ou toutes les options????

           // this.filtered_options = opt;
            return;
        }


        let options = [];
        let list = [];

        for (let opt of this.question.options){
            if(opt.label == this.filter){
                //options.push(opt);
                let truc = {
                    "label":opt.label,
                    "description":opt.description,
                    "useGeo":opt.useGeo,
                    "value":opt.value,
                    "locations":[]
                };


                if(opt.locations){
                     //les locations selectionnées
                    for(let loc of opt.locations){
                        //directement les locations...
                        //ajoute les differents points
                        if (this.search==null || loc.label.indexOf(this.search)!= -1) {
                            truc["locations"].push(loc);//bon pour affichage
                            list.push(loc.label);
                        }
                    }
                }
               
                
                options.push(truc);
                
                
            }
        }
        
        //les filtres 
        this.filtered_datalist = list;
        this.filtered_options = options;
        return;
    }
}