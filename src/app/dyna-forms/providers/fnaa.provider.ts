import {Injectable} from "@angular/core";
import {Http, Headers,Response } from "@angular/http";
import {FNAA_LOGIN, FNAA_PASSWD} from "../../gmap.key";


//un exemple de reponse par le webservice
const TEST = `<?xml version='1.0' encoding='UTF-8'?>
<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">
<soapenv:Body>
<ns3:WS_SiVin_Consulter_VehiculeResponse xmlns:ns3="http://aaa.asso.fr/sivin/schemas">
    <ns3:return>
        <ns1:carrosserie xmlns:ns1="http://aaa.asso.fr/sivin/xsd">MONOSPACE</ns1:carrosserie>
        <s691:carrosserieCG xmlns:s691="http://aaa.asso.fr/sivin/xsd">CI</s691:carrosserieCG>
        <s692:co2 xmlns:s692="http://aaa.asso.fr/sivin/xsd">173</s692:co2>
        <ns1:codeMoteur xmlns:ns1="http://aaa.asso.fr/sivin/xsd">AUY</ns1:codeMoteur>
        <s693:codifVin xmlns:s693="http://aaa.asso.fr/sivin/xsd">WF0GXXPSSG1E02165</s693:codifVin>
        <ns1:consExurb xmlns:ns1="http://aaa.asso.fr/sivin/xsd">5.3</ns1:consExurb>
        <ns1:consMixte xmlns:ns1="http://aaa.asso.fr/sivin/xsd">6.4</ns1:consMixte>
        <ns1:consUrb xmlns:ns1="http://aaa.asso.fr/sivin/xsd">8.4</ns1:consUrb>
        <ns1:couleurVehic xmlns:ns1="http://aaa.asso.fr/sivin/xsd">BEIGE</ns1:couleurVehic>
        <ns1:cylindree xmlns:ns1="http://aaa.asso.fr/sivin/xsd">1896</ns1:cylindree>
        <date1erCir xmlns="http://aaa.asso.fr/sivin/xsd">
            <jour>---12</jour><mois>--05--</mois><annee>2003</annee>
            </date1erCir>
        <dateDCG xmlns="http://aaa.asso.fr/sivin/xsd">
            <jour>---11</jour><mois>--09--</mois><annee>2006</annee>
        </dateDCG>
        <ns1:depollution xmlns:ns1="http://aaa.asso.fr/sivin/xsd">NON</ns1:depollution>
        <ns1:empat xmlns:ns1="http://aaa.asso.fr/sivin/xsd">284</ns1:empat>
        <ns1:energie xmlns:ns1="http://aaa.asso.fr/sivin/xsd">GAZOLE</ns1:energie>
        <s694:genreV xmlns:s694="http://aaa.asso.fr/sivin/xsd">VP</s694:genreV>
        <ns1:genreVCG xmlns:ns1="http://aaa.asso.fr/sivin/xsd">VP</ns1:genreVCG>
        <ns1:hauteur xmlns:ns1="http://aaa.asso.fr/sivin/xsd">171</ns1:hauteur>
        <s695:immatSiv xmlns:s695="http://aaa.asso.fr/sivin/xsd">38CSH0032</s695:immatSiv>
        <s696:largeur xmlns:s696="http://aaa.asso.fr/sivin/xsd">181</s696:largeur>
        <ns1:longueur xmlns:ns1="http://aaa.asso.fr/sivin/xsd">464</ns1:longueur>
        <s697:marque xmlns:s697="http://aaa.asso.fr/sivin/xsd">FORD</s697:marque>
        <ns1:marqueCarros xmlns:ns1="http://aaa.asso.fr/sivin/xsd">FORD</ns1:marqueCarros>
        <ns1:modeInject xmlns:ns1="http://aaa.asso.fr/sivin/xsd">INJECTEURS POMPES</ns1:modeInject>
        <ns1:modele xmlns:ns1="http://aaa.asso.fr/sivin/xsd">GALAXY</ns1:modele>
        <ns1:modeleEtude xmlns:ns1="http://aaa.asso.fr/sivin/xsd">GALAXY</ns1:modeleEtude>
        <ns1:modelePrf xmlns:ns1="http://aaa.asso.fr/sivin/xsd"></ns1:modelePrf>
        <ns1:nSerie xmlns:ns1="http://aaa.asso.fr/sivin/xsd">G1E02165</ns1:nSerie>
        <s698:nSiren xmlns:s698="http://aaa.asso.fr/sivin/xsd">000000000</s698:nSiren>
        <ns1:nbCylind xmlns:ns1="http://aaa.asso.fr/sivin/xsd">4</ns1:nbCylind>
        <s699:nbPlAss xmlns:s699="http://aaa.asso.fr/sivin/xsd">7</s699:nbPlAss>
        <ns1:nbPortes xmlns:ns1="http://aaa.asso.fr/sivin/xsd">5</ns1:nbPortes>
        <ns1:nbSoupape xmlns:ns1="http://aaa.asso.fr/sivin/xsd">2</ns1:nbSoupape>
        <ns1:nbVitesse xmlns:ns1="http://aaa.asso.fr/sivin/xsd">6</ns1:nbVitesse>
        <ns1:nbVolume xmlns:ns1="http://aaa.asso.fr/sivin/xsd">1</ns1:nbVolume>
        <ns1:poidsVide xmlns:ns1="http://aaa.asso.fr/sivin/xsd">1591</ns1:poidsVide>
        <ns1:prixVehic xmlns:ns1="http://aaa.asso.fr/sivin/xsd">31900</ns1:prixVehic>
        <ns1:propulsion xmlns:ns1="http://aaa.asso.fr/sivin/xsd">AVANT</ns1:propulsion>
        <s700:ptr xmlns:s700="http://aaa.asso.fr/sivin/xsd">2430</s700:ptr>
        <ns1:ptrPrf xmlns:ns1="http://aaa.asso.fr/sivin/xsd">0400</ns1:ptrPrf>
        <ns1:puisCh xmlns:ns1="http://aaa.asso.fr/sivin/xsd">115</ns1:puisCh>
        <ns1:puisFisc xmlns:ns1="http://aaa.asso.fr/sivin/xsd">7</ns1:puisFisc>
        <ns1:puisKw xmlns:ns1="http://aaa.asso.fr/sivin/xsd">85</ns1:puisKw>
        <ns1:tpBoiteVit xmlns:ns1="http://aaa.asso.fr/sivin/xsd">MECANIQUE</ns1:tpBoiteVit>
        <ns1:turboCompr xmlns:ns1="http://aaa.asso.fr/sivin/xsd">TURBO</ns1:turboCompr>
        <ns1:type xmlns:ns1="http://aaa.asso.fr/sivin/xsd">MFD5496A5093</ns1:type>
        <ns1:typeVarVersPrf xmlns:ns1="http://aaa.asso.fr/sivin/xsd"></ns1:typeVarVersPrf>
        <ns1:typeVinCG xmlns:ns1="http://aaa.asso.fr/sivin/xsd">GXXPSS</ns1:typeVinCG>
        <ns1:version xmlns:ns1="http://aaa.asso.fr/sivin/xsd">1.9 TDI</ns1:version>
    </ns3:return>
</ns3:WS_SiVin_Consulter_VehiculeResponse>
</soapenv:Body>
</soapenv:Envelope>`;

@Injectable()
export class FNAAProvider{
    constructor(private _http:Http){}
    //recupere les details de l'immatriculation pour le vehicule
    get_vehicule_details(immat:string):Promise<any>{
        let req = `<?xml version="1.0" encoding="UTF-8" ?>
        <root>
        <login>${FNAA_LOGIN}</login>
        <passwd>${FNAA_PASSWD}</passwd>
        <immat>${immat}</imat>
        </root>`;

        //ca a voir....
        // let headers = new Headers();
        // headers.append('Content-Type', 'text/xml');
        // return this._http.post('http://www.fna-cartegrise.fr/test.asp',req).toPromise().then( (details:any)=>{
        //     //parse le contenu pour savoir ce qu'il se passe
        //     console.log(details);
        // });

        //recup et parse le XML 
        return new Promise( (resolve, reject)=>{
            try{
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(TEST,"text/xml");
                //les données recuperees du webservice
                let datas = {};
                //recupere les infos necessaires dedans

                let rep = xmlDoc.getElementsByTagName("return");
                if (rep && rep.length > 0){
                    let reponse = rep[0].children;
                    let count = reponse.length;
                    for (let i=0; i<count;i++){

                        let elem = reponse.item(i);
                        if(elem.localName.startsWith("date")){
                            //parse les differentes dates
                            datas[elem.localName] = this.parseDate(elem);

                        }else  datas[elem.localName] = elem.innerHTML;//recup simplement
                    }
                }


                resolve(datas);

            } catch(err){
                reject(err);
            }

        });
        

    }
    private parseDate(elem:Element){
        let dt = {};
        //en theorie, 3 elements dans la date
        for (let i=0;i<3;i++){
            let el=elem.children.item(i);
            dt[el.localName]=el.innerHTML;
        }

        return dt;
    }

    private parseDoc(){

    }
}
