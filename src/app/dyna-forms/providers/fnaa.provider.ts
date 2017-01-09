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

const VOITURE="voiture";
const UTILITAIRE="utilitaire";
const MOTO="moto";

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
const TYPE_MAPPING = {
    "VP":VOITURE,
    "CTTE":UTILITAIRE,//TCP, CAM, CTTE,VASP, TRR, VTST, VTSU
    "CAM":UTILITAIRE,
    "TCP":UTILITAIRE,
    "VASP":UTILITAIRE,
    "TRR":UTILITAIRE,
    "VTST":UTILITAIRE,
    "VTSU":UTILITAIRE,
    //tout le reste, moto
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
            //(details);
            let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(details._body,"text/xml");
                //les données recuperees du webservice
                let datas = {};
                //recupere les infos necessaires dedans
                //verifie si pas d'erreur 
                let error = xmlDoc.getElementsByTagName("erreur");
               
                if(error.length>0){
                    let error_number = xmlDoc.getElementsByTagName("numero").item(0).innerHTML;
                    throw {"code":"ERROR", "msg":error.item(0).innerHTML+" ("+error_number+")"};
                }
                 let fault = xmlDoc.getElementsByTagName("Fault");
                 if(fault.length>0){
                     throw {"code":"UNKNOWN", "msg":"immatriculation inconnue"};
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
                //("mapping des differentes energies possibles");
                //(v);
                if(v in MAPPING) datas["energie"]=MAPPING[v];
                else datas["energie"]=HYBRID;

                //pour connaitre le type recuperer en fonction de ce que nous utilisons
                v = datas["genre_v"];
                datas["type_vehicule"] = MOTO;//par defaut
                if(v in TYPE_MAPPING)datas["type_vehicule"] = TYPE_MAPPING[v];

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
