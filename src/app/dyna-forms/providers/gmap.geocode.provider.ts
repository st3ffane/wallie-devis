import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {GMAP_KEY} from "../../gmap.key";


const ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json?";

//ex:
// https://maps.googleapis.com/maps/api/geocode/json?latlng=43.6866578,-1.3520870999999999&result_type=locality&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
//https://maps.googleapis.com/maps/api/geocode/json?address=Landes&components=administrative_area_level_2&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
//https://maps.googleapis.com/maps/api/geocode/json?address=40180&components=postal_code&key=AIzaSyAsbik8b9mp-_O3ubvV0ybqozM7UGJfToQ&#038
@Injectable()
export class GmapGeocodeProvider {

    cached_position:any;//possede lat, lng, name, zipcode, country
    //me permet, une fois les infos de position determinée, de ne plus faire appel aux webservice

    constructor (private _http:Http){}

    /**
     * Recupere, a partir des informations de latitude et longitude, les informations
     * sur la position du client (ie: nom du departement, zipcode,....)
     */
    get_departement_from_coords_async(latitude:number, longitude: number ){

        if(this.cached_position) return Promise.resolve(this.cached_position);


        let url = ENDPOINT + "latlng="+latitude+","+longitude+"&key="+GMAP_KEY;
        return this._http.get(url)
        .toPromise()
        .then ( (rep:any)=>{
            console.log(rep);
            rep = JSON.parse(rep._body);
            if(rep.status == "OK" && rep.results && rep.results.length){
                console.log("des reponses");
                let address = rep.results[0].address_components;//la plus precise

                this.cached_position = {
                    "lat":latitude,
                    "long": longitude,
                    "name":this.get_type("administrative_area_level_2", address),
                    "zipcode":this.get_type("postal_code", address),
                    "country":this.get_type("country", address)
                }
               

                return this.cached_position;

            } else throw ("Erreur recherche du departement");
        });
    }

    /**
     * permet, a partir d'un numero de departement, de recuperer les informations de position 
     * du client (ie: latitude, longitude, pays...)
     */
    get_coords_from_departement_async(zipCode: string){
        if(this.cached_position && zipCode == this.cached_position.zipcode) return Promise.resolve(this.cached_position);
        console.log("Recherche coords a partir du departement...");

        let url = ENDPOINT + "address="+zipCode+"&components=postal_code&key="+GMAP_KEY;
        return this._http.get(url)
        .toPromise()
        .then ( (rep:any)=>{
             rep = JSON.parse(rep._body);
            if(rep.status == "OK" && rep.results && rep.results.length){
                console.log("des reponses");
                let address = rep.results[0].address_components;//la plus precise
                let geo = rep.results[0].geometry.location;

                 this.cached_position = {
                     "lat":geo.lat,
                     "long": geo.long,
                    "name":this.get_type("administrative_area_level_2", address),
                    "zipcode":this.get_type("postal_code", address),
                    "country":this.get_type("postal_code", address)
                 }
                return this.cached_position;//la plus precise
                
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