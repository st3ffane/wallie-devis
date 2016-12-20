import {Component, OnInit, Input} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GmapGeocodeProvider} from "../providers/gmap.geocode.provider";

//pas le choix....
import {DevisProvider} from "../../providers/devis.provider";

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
    templateUrl:"./gps.expedom.html",
    styleUrls:["./gps.expedom.scss"]
})
export class GPSExpedomComponent{
    @Input()question:any; // le champs du formulaire
    @Input() form:FormGroup; // le formulaire (angular)
    noGeo: boolean = false; //@deprecated


    srch_zipcode: string; //le zip  a rechercher
    is_localising:boolean = true;//par defaut, tente de se localiser...si false: localisation achevée (success ou error)

    constructor(private _gmap:GmapGeocodeProvider,
                private _devis:DevisProvider){}
    //position GPS de l'utilisateur
    position:any = null;
    def_zoom = 6;//niveau de zoom de la map par defaut


    //le necessaire pour les formulaires presents ici
    //recherche zone text
    _search:string = "";
    search_form_ctrl= null;//nom du control text (angular)

    //choix du filtre
    _filter:string = "port" ;
    filter_form_ctrl = null;//nom du control text (angular)

    get filter(){return this._filter;}
    
    /**
     * modifie le filtre pour l'affichage des marqueurs sur la google map (par exemple: port ou depot)
     * change le contenu du filtre
     * annule le filtre textuel
     * remape les marqueurs pour afficher uniquement les bons (correspondant au filtre choisi)
     * annule le choix effectué precedement
     */
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

    /**
     * Modifie le filtre textuel pour l'affichage des marqueurs sur la google map 
     * change le contenu du filtre textuel
     * remappe les marqueurs pour n'afficher que ceux qui contiennent dans le titre le texte entré
     * annule le choix effectué précedement
     */
    set search(v){
        this._search = v;
        this.remap_options();
        //remet a zero le choix
        this.question.value = null;
        
    }
    //le choix pour ce formulaire


    ngOnInit(){
        //creation des elements de formulaires necessaires (angular)
        this.create_forms_elements();

        //mappe les locations a afficher sur la map
        this.remap_options();
    }

    ngAfterViewInit(){
        //recupere les coordonnées GPS si dispo et les informations sur les prix d'enlevement/livraison 
        //a domicile
        this.geolocalise().then( (pos:any)=> {

            
            console.log(this.position);
            //demande le nom du patelin 
            return this._gmap.get_departement_from_coords_async(pos.latitude,pos.longitude);

        }).then( (rep)=>{
            // console.log(rep);
            // console.log(this.question.default_location);

            //VERIFIE SI LE PAYS EST BON.....
            if(rep["country"].toUpperCase() != this.question.default_location.country.toUpperCase()){
                throw "not in place!";
            }
            this.position = rep;
            this.question["position"] = this.position;
            // console.log("add position to question");
            // console.log(this.question);


            
            this.is_localising = false;
            return this._devis.load_domicile_prices(this.position)
            // return true;
        })
        /*.then ( (good)=>{
            if(good){
                //recupere la table des prix
                return this._devis.load_domicile_prices(this.position.zipcode.slice(0,2))

            } else {
                //une erreur
                throw "Undefined datas";
            }
        })*/.then( (dt)=>{
                    this.position['options'] = dt;

        }).catch( (err)=>{
            
             this.position = null;// = this.question.default_location;//remet a zero??? ou garde l'ancien????
             this.is_localising = false;
        });

        
   
    }


    /**
     * Permet de recuperer la position gps (pour centrer la google map)
     * a partir d'un zipcode entré par l'utilisateur 
     */
    localise_from_zipcode(zipcode){
        // console.log("recherche localisation...");
        // console.log("zipcode:"+zipcode);
        this.is_localising = true;
        this._gmap.get_coords_from_departement_async(zipcode).then( (rep)=>{
            // VERIFIE SI PAYS OK
            console.log(rep);
            console.log(this.question.default_location);
            
            //VERIFIE SI LE PAYS EST BON.....
            if(rep["country"].toUpperCase() != this.question.default_location.country.toUpperCase()){
                throw "not in place!";
            }
            // console.log(rep);
            this.position = rep;
            this.question["position"] = this.position;
            this.is_localising = false;
            return this._devis.load_domicile_prices(this.position)
            // return true;
        })/*.then ( (good)=>{
            if(good){
                //recupere la table des prix
                return this._devis.load_domicile_prices(this.position.zipcode.slice(0,2))

            } else {
                //une erreur
                throw "Undefined datas";
            }
        })*/.then( (dt)=>{
                    this.position['options'] = dt;

        }).catch( (err)=>{
            //  console.log("hello, une couille");
             console.log(err);
             //this.position = {};//remet a zero??? ou garde l'ancien????
             this.is_localising = false;
        });


    }

    /**
     * lance la geolocalisation 
     * utilise le navigator, mais on pourra en modifiant cette methode 
     * utiliser un autre service au besoin (si pas de https par exemple)
     */
    private geolocalise(){
        return new Promise ( (resolve, reject)=>{
             if(navigator.geolocation){
                // console.log("geolocalisation ON");
                navigator.geolocation.getCurrentPosition((pos)=>{
                    if(pos.coords){
                        resolve(pos.coords);
                        // console.log(this.position);
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
    private create_forms_elements(){
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
         
        let opt = [];
        
        if(this.filter === undefined) {
            //en regle general, le field vient juste de se charger, on affiche tout sous forme 
            //de marqueurs.
            this.filtered_options = this.question.options;
            this.filtered_datalist = null;//pas de filtre possible ou toutes les options????

           // this.filtered_options = opt;
            return;
        }
        //appellé lors d'un clic sur un filtre, recree le tableau d'options

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