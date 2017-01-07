import {Injectable} from "@angular/core";
import {Http, Headers,Response, RequestOptions, RequestMethod } from "@angular/http";
import {FNAA_LOGIN, FNAA_PASSWD} from "../../gmap.key";

import {TARGET} from "../../target";



//remappage des noms entre le webservice et l'interface
const REMAP = {
    'prixVehic':"valeur",
    'immatSiv':'immatriculation'
}

//les valeurs acceptables par l'application
const ESSENCE = "essence";
const DIESEL = "diesel";
const HYBRID = "hybride";
const ELECTRIC = "electrique";


const MAPPING= {
    "ESSENCE":ESSENCE,
    "ESS+GAZO":ESSENCE,
    "ESS+G.P.L":ESSENCE,
    "ESS+G.NAT":ESSENCE,
    "BICARBUR":ESSENCE,
    "SUPERETHANOL":ESSENCE,
    "GAZOLE":DIESEL,
    "FUEL-OIL":DIESEL,
    "GAZOLE+GAZO":DIESEL,
    "GAZOGENE":DIESEL,
    "ELECTRIC":ELECTRIC,
    "PETROL.LAMP":DIESEL,
    "INCONNUE":ESSENCE,
    "AUTRES":ESSENCE

}

const API = TARGET+"/wp-admin/admin-ajax.php?action=fnaa&immat="
@Injectable()
export class FNAAProvider{
    constructor(private _http:Http){}
    //recupere les details de l'immatriculation pour le vehicule
    get_vehicule_details(immat:string):Promise<any>{

       

       

        //ca a voir....
        // let headers = new Headers();
        // headers.append('Content-Type', 'text/xml');

        // let options = new RequestOptions({
        //     method: RequestMethod.Post,
        //    // url: 'http://www.fna-cartegrise.fr/test.asp',
        //     headers: headers,

        //     body:req
        // });
        return this._http.get(API+immat).toPromise().then( (details:any)=>{
            //parse le contenu pour savoir ce qu'il se passe
            console.log(details);
            let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(details._body,"text/xml");
                //les données recuperees du webservice
                let datas = {};
                //recupere les infos necessaires dedans
                //verifie si pas d'erreur 
                let error = xmlDoc.getElementsByTagName("erreur");
                if(error.length>0){
                    let error_number = xmlDoc.getElementsByTagName("numero").item(0).innerHTML;
                    throw error.item(0).innerHTML+" ("+error_number+")";
                }


                let rep = xmlDoc.getElementsByTagName("return");
                if (rep && rep.length > 0){
                    let reponse = rep[0].children;
                    let count = reponse.length;
                    for (let i=0; i<count;i++){

                        let elem = reponse.item(i);
                        let key = REMAP[elem.localName] || elem.localName;//si inconnu, le nom correspond
                        if(elem.localName.startsWith("date")){
                            //parse les differentes dates
                            datas[key] = this.parseDate(elem);

                        }else  datas[key] = elem.innerHTML;//recup simplement
                    }
                }

                //mapping des differents valeurs : principalement essence 
                let v = datas["energie"];
                console.log("mapping des differentes energies possibles");
                console.log(v);
                if(v in MAPPING) datas["energie"]=MAPPING[v];
                else datas["energie"]=HYBRID;


                return datas;
        });
        
        

    }
    private parseDate(elem:Element){
        let dt = [];
        //en theorie, 3 elements dans la date
        for (let i=0;i<3;i++){
            let el=elem.children.item(i);
            //dt[el.localName]=el.innerHTML;
            let v = el.innerHTML;
            v = v.replace(/\D/g, '');
            
            dt.push(v);
        }

        return dt.join("/");
    }

    
}
