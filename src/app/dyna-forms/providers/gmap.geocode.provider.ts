import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {GMAP_KEY} from "../../gmap.key";


const ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json?";

//ex:
// https://maps.googleapis.com/maps/api/geocode/json?latlng=43.6866578,-1.3520870999999999&result_type=locality&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
//https://maps.googleapis.com/maps/api/geocode/json?address=Landes&components=administrative_area_level_2&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
//https://maps.googleapis.com/maps/api/geocode/json?address=40180&components=postal_code&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
//https://maps.googleapis.com/maps/api/geocode/xml?address=Mamoudzou+YT&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
/**
 * Un simple provider pour me mapper les appels aux service geocode de google 
 */
@Injectable()
export class GmapGeocodeProvider {

    cached_position:any;//possede lat, lng, name, zipcode, country
    //me permet, une fois les infos de position determinée, de ne plus faire appel aux webservice

    constructor (private _http:Http){}

    //tente une geolocalisation, si a le cache, renvoie le cache
    public geolocalise(){

        if(this.cached_position) {
            return Promise.resolve(this.cached_position);//renvoie la position en cache pour eviter de refaire
        }

        return new Promise ( (resolve, reject)=>{
            
             if(navigator.geolocation){
                 
                navigator.geolocation.getCurrentPosition((pos)=>{
                    
                    if(pos.coords){
                       
                        this.cached_position = pos.coords;//enregistre 
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
     * Recupere, a partir des informations de latitude et longitude, les informations
     * sur la position du client (ie: nom du departement, zipcode,....)
     * @param latitude, longitude: les coordonnées GPS de l'utilisateur 
     * 
     * @return les informations sur sa position {lat, long, name, zipcode, country}
     * 
     * NOTE: met en cache pour les appels suivant
     * 
     */
    get_departement_from_coords_async(latitude:number, longitude: number , force?:boolean){



       // if(force !== true && this.cached_position) return Promise.resolve(this.cached_position);


        let url = ENDPOINT + "latlng="+latitude+","+longitude+"&key="+GMAP_KEY;
        return this._http.get(url)
        .toPromise()
        .then ( (rep:any)=>{
            // //(rep);
            rep = JSON.parse(rep._body);
            if(rep.status == "OK" && rep.results && rep.results.length){
                // //("des reponses");
                // //(rep);

                //recupere les infos administrative_area_level_3
                // let address = rep.results[0].address_components;
                //si france
                // let address = this.getAddressComponent( rep.results,["administrative_area_level_3","administrative_area_level_2","locality","postal_code"]);//rep.results[0].address_components;//la plus precise
                // if(!address) throw ("Localisation ECHEC!");
                let address = rep.results;


                let country = this.getAddressComponent( address, "country") || "Unknown";
                let zip = "";
                let city = "";
                //city, depend si France ou ailleurs 
                // let city = this.get_type("locality", address) || this.get_type("administrative_area_level_1", address)  ;
                
                // //("Recherche pays: "+country);
                // //(address);
                 if(country=="France"){
                    zip  = this.getAddressComponent( address, "postal_code");
                    city = this.getAddressComponent( address, "locality");
                    // //("city: "+city+", zip:"+zip);
                } else {
                    //tente de recuperer les infos possibles
                    //me moque du zip 
                    city = this.getAddressComponent( address, "locality")//le plus petit possible
                        || this.getAddressComponent( address, "administrative_area_level_3")
                        || this.getAddressComponent( address, "administrative_area_level_2")
                        || this.getAddressComponent( address, "administrative_area_level_1")
                }
                
                let cached_position = {
                    "city":city,
                    "lat":latitude,
                    "lng": longitude,
                    "name":city,
                    "zipcode":zip,
                    "country":country
                }
               
                //(cached_position);
                return cached_position;

            } else throw ("Erreur recherche du departement");
        });
    }


    private getAddressComponent( results:Array<any>, type:string){

        // //("getaddresscomponents");
        let addr = null;
        for (let res of results){
            let types = res.types;
            // //("type: ");
            // //(types);
            for (let t of types){
                if(type.indexOf(t)!=-1){ 
                    // //("find: "+t);
                    return this.get_type(type,res.address_components);
                }
            }
        }
        return null;
    }

    /**
     * permet, a partir d'un numero de departement, de recuperer les informations de position 
     * du client (ie: latitude, longitude, pays...)
     * @deprecated utilise get_coords_from_departement_name_async 
     * 
     * @param zipcode: le code postal a rechercher
     * 
     * @return les informations sur sa position {lat, long, name, zipcode, country}
     * 
     */
    get_coords_from_departement_async(zipCode: string){
        if(this.cached_position && zipCode == this.cached_position.zipcode) return Promise.resolve(this.cached_position);
        // //("Recherche coords a partir du departement...");

        let url = ENDPOINT + "address="+zipCode+"&components=postal_code&region=YT&key="+GMAP_KEY;
        return this._http.get(url)
        .toPromise()
        .then ( (rep:any)=>{
             rep = JSON.parse(rep._body);
            if(rep.status == "OK" && rep.results && rep.results.length){
                // //("des reponses");
                let address = rep.results[0].address_components;//la plus precise
                let geo = rep.results[0].geometry.location;

                 this.cached_position = {
                     "lat":geo.lat,
                     "lng": geo.lng,
                    "name":this.get_type("administrative_area_level_2", address),
                    "zipcode":this.get_type("postal_code", address),
                    "country":this.get_type("country", address)
                 }
                return this.cached_position;//la plus precise
                
            } else throw ("Erreur recherche du departement");
        });
    
    }

    get_coords_from_departement_name_async(name:string, cctd:string){
         let url = ENDPOINT + "address="+name+"+&components=country:"+cctd+"&key="+GMAP_KEY;
        return this._http.get(url)
        .toPromise()
        .then ( (rep:any)=>{
            ////(rep)
            //si uniquement le nom d'une ville, me renvoie juste locality
             rep = JSON.parse(rep._body);
            if(rep.status == "OK" && rep.results && rep.results.length){
               
                 //recupere les infos administrative_area_level_3
                let address = rep.results[0].address_components;
                

                //si france
                // address = this.getAddressComponent( rep.results,["locality","street_address",'postal_code']);//rep.results[0].address_components;//la plus precise
                // if(!address) throw ("Localisation ECHEC!");


                let geo = rep.results[0].geometry.location;
                let country = this.get_type("country", address);

                let city = "";
                let zip = "";
                if(country=="France"){
                    zip  = this.get_type("postal_code", address);
                    city = this.get_type("locality", address)
                } else {
                    //tente de recuperer les infos possibles
                    //me moque du zip 
                    city = this.get_type("administrative_area_level_4", address)  || this.get_type("administrative_area_level_3", address) ;
                }


                
                
                 let cached_position = {
                     "city": city,
                     "lat":geo.lat,
                     "lng": geo.lng,
                    "name":this.get_type("administrative_area_level_2", address),
                    "zipcode":zip,
                    "country": country
                 }

                 if((cctd!="FR" && city == undefined) || (cctd=="FR" && zip==undefined)){
                    //("doit relancer la requete avec les parametres");
                    return this.get_departement_from_coords_async(cached_position.lat, cached_position.lng);
                }


                return cached_position;//la plus precise
                
            } else throw ("Erreur recherche du departement");
        });
    }

    //juste pour pouvoir recuperer les informations de types dans les donnéés
    //fournies par le webservice
    private get_type(stype:string, contener:Array<any>){
        
        for (let elem of contener){
            
            for (let type of elem.types){
                
                if(type == stype) return elem.long_name;
            }
        }
    }
}