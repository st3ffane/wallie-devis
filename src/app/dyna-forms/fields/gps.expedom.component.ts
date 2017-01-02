import {Component, OnInit, Input, ViewChild} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GmapGeocodeProvider} from "../providers/gmap.geocode.provider";

//pas le choix....
import {DevisProvider} from "../../providers/devis.provider";

//juste pour me permettre de limiter les resultats aux pays concernés
//permet d'accelerer/ preciser  les resultats google geocode
const CCTD={
    'france':'FR',
    'reunion':'RE',
    "mayotte":"YT"
}
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
    @ViewChild("domicileMarker") domicileMarker; //le marker domicile....

    srch_zipcode: string; //le zip  a rechercher
    is_localising:boolean = true;//par defaut, tente de se localiser...si false: localisation achevée (success ou error)

    constructor(private _gmap:GmapGeocodeProvider,
                private _devis:DevisProvider){}
    //position GPS de l'utilisateur
    position:any = null;
    def_zoom = 6;//niveau de zoom de la map par defaut  -renseigné par question.default_localisation


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
        //this.question["position"] = {};//sauf si viens du cache....

        
        this.noGeo = this.question["use-geolocation"] === undefined ? true : this.question["use-geolocation"] == "1"  ;
        

        //trie les options des locations pour affichage 

        for (let opt of this.question.options){
            for (let loc of opt.locations){
                if(loc.options){
                     let sorted = loc.options.sort( (elem1:any, elem2:any)=>{
                        let v1 = +elem1.value.split('|')[1];
                        let v2 = +elem2.value.split('|')[1];
                        return v1 - v2;
                    });
                    loc.options = sorted;
                }
            }
        }
        //mappe les locations a afficher sur la map
        this.remap_options();
    // }

    // ngAfterViewInit(){
        //recupere les coordonnées GPS si dispo et les informations sur les prix d'enlevement/livraison 
        //a domicile
        //si a des valeurs en cache, met en place 
        let has_location = false;


        console.log("cache datas: ");
        console.log(this.question.__value);


        //DOIT PAS SE FAIRE ICI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if(this.question.__value){
            //si domicile, a part 
            
            if(this.question.__value.startsWith("domicile")){
                //recup de la geolocation
                //2 cas, ou arrive par un prec, ou arrive par un reload???
                console.log("cache a domicile")
                this.position = this.question.position;

                
                //a deja les options???
                if(this.position && this.position.options){
                    for (let opt of this.position.options){
                        if(opt.value == this.question.__value){
                            //trouvé, affichera de toute facon la popup
                            this.filter = "domicile";
                            has_location = true; //annule le chargment
                        }
                    }
            }/*
                else if(this.position && this.position.latitude){
                    
                    has_location = true;//evite de relancer la geolocalisation
                    this._devis.load_domicile_prices(this.position).then( (dt)=>{
                            //valide la position et enregistre
                                this.position['options'] = dt;
                                //recherche la valeur 
                                for (let opt of this.position.options){
                                    if(opt.value == this.question.__value){
                                        //trouvé
                                        this.filter = "domicile";

                                    }
                                }

                    }).catch( (err)=>{
                        console.log("Error geolocalisation");
                        console.log(err);
                        this.position={};//objet vide???
                        // this.position = {};// = this.question.default_location;//remet a zero??? ou garde l'ancien????
                        this.is_localising = false;
                    });
                }
                //recupere les valeurs 
               */

            } else {
                //une reponse en cache, doit selectionner le filtre correspondant

                
                for (let filtre of this.question.options){
                    for(let opt of filtre.locations){
                        for(let v of opt.options){
                            if(v.value == this.question.__value){
                                
                                opt["open_window"] = true;
                                this.filter = filtre.label;//affiche avec le filtre defini...
                            }
                        }
                        
                    }
                }
            }
            
        }

        if(!this.noGeo || has_location) return; //si a deja une location (geo ou une adresse...), ne fait rien...
    
        this._gmap.geolocalise().then( (pos:any)=> {
            
            console.log(pos);
            //demande le nom du patelin 
            return this._gmap.get_departement_from_coords_async(pos.latitude,pos.longitude,true);

        }).then( (rep)=>{
            
            //VERIFIE SI LE PAYS EST BON.....
            console.log(rep);
            if(rep["country"].toUpperCase() != this.question.default_location.country.toUpperCase()){
                throw "not in place!";
                
            }

            console.log("valid!!!");
            this.position = rep;
            this.question["position"] = this.position;
            
            
            this.is_localising = false;
            return this._devis.load_domicile_prices(this.position)
            // return true;
        })
        .then( (dt)=>{
                //valide la position et enregistre
               
                    this.position['options'] = dt;

        }).catch( (err)=>{
            console.log("Error geolocalisation");
            console.log(err);
            //this.position=null;//objet vide???
             this.position = {'error':err};// = this.question.default_location;//remet a zero??? ou garde l'ancien????
             this.is_localising = false;
        });

        
   
    }


    /**
     * Permet de recuperer la position gps (pour centrer la google map)
     * a partir d'un zipcode entré par l'utilisateur 
     */
    localise_from_zipcode(zipcode){
        
        this.is_localising = true;
        //determine le code CCDT du pays -optimise
        let cnt = CCTD[this.question.default_location.country] || "FR";

        console.log("recherche pour nom: "+zipcode);
        //this._gmap.get_coords_from_departement_async(zipcode).then( (rep)=>{
        this._gmap.get_coords_from_departement_name_async(zipcode,cnt).then( (rep)=>{
            console.log(rep);
            //VERIFIE SI LE PAYS EST BON.....
            if(rep["country"] && rep["country"].toUpperCase() != this.question.default_location.country.toUpperCase()){
                throw "not in place!";
            }
            
            this.position = rep;
            this.question["position"] = this.position;

            this.is_localising = false;
            return this._devis.load_domicile_prices(this.position)
            // return true;
        })
        .then( (dt)=>{
                    this.position['options'] = dt;
                    this.domicileMarker.open();

        }).catch( (err)=>{
            
            console.log(err);
            this.position.price_error = "Erreur lors de la recherche des tarifs...";
             //this.position = {};//remet a zero??? ou garde l'ancien????
             this.is_localising = false;
        });


    }

    /**
     * lance la geolocalisation 
     * utilise le navigator, mais on pourra en modifiant cette methode 
     * utiliser un autre service au besoin (si pas de https par exemple)
     * 
     * @DEPRECATED
     * CHANGE: utilise le service de geoloc de google
     */
    private geolocalise(){
        return new Promise ( (resolve, reject)=>{
            
             if(navigator.geolocation){
                 
                navigator.geolocation.getCurrentPosition((pos)=>{
                    
                    if(pos.coords){
                       
                        resolve(pos.coords);
                        
                    }  
                    else {
                       
                        reject("no coords");
                    }
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
                        let lbl = loc.label.toUpperCase();
                        if (this.search==null || lbl.indexOf(this.search.toUpperCase())!= -1) {
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


    /**
     * appellé lors d'un click sur la map: positionne un marquer et recupere les infos de tarifs
     * depuis le webservice
     */
    positionne_marker(evt){

        console.log("ici, "+this.filter);

        if(this.filter!='domicile') return;



        //annule la reponse precedente
        this.question.__value = null;

        //enregistre la position: permet d'afficher imediatement le marqueur
       this.position = evt.coords;
       
       console.log(evt.coords);

       this._gmap.get_departement_from_coords_async(this.position.lat,this.position.lng,true).then( (rep)=>{
            
            //VERIFIE SI LE PAYS EST BON.....
            
            /*if(rep["country"].toUpperCase() != this.question.default_location.country.toUpperCase()){
                
                throw "not in place!";
            }*/
            this.position = rep;
            this.question["position"] = this.position;
            this.is_localising = false;
            return this._devis.load_domicile_prices(this.position);
            
        })
        .then( (dt)=>{
            if(!dt || !Array.isArray(dt) || dt.length == 0) throw "Aucune reponse/erreur";
            
            console.log("recentrage de la carte???");
                    this.position['options'] = dt;
                    console.log(this.domicileMarker)
                    this.domicileMarker.open();
                    //recentre la carte
                    // this.question.default_location.lat = this.position.lat;
                    // this.question.default_location.lng = this.position.lng;

        }).catch( (err)=>{
            console.log("erreur");
            console.log(err);
             this.position['price_error']="Nous n'avons pas pu recuperer les informations de tarifs à partir de votre localisation...";// = this.question.default_location;//remet a zero??? ou garde l'ancien????
             this.is_localising = false;
        });
       

    }


    /**
     * click sur un marqueur pour l'ouvrir, verifie combien d'options
     * si une seule, selectionne
     */
    check_options(location:any){
        console.log("click");
        if(location.options && location.options.length == 1){
            //selectionne 
            this.question.__value = location.options[0].value;
        }
    }
}