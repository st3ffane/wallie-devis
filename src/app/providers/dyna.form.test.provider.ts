import {Injectable} from "@angular/core";
import * as dynaform from "../dyna-forms/forms/dyna";

/**
 * Juste un simple provider qui me permet de tester la creation dynamique de formulaire
 * principe:
 * fourni un descriptif du formulaire a generer dans la variable TEST_FORM
 * et go....
 * 
 * @DEBUG ONLY: a supprimer avant mise en production
 * 
 */


//un formulaire tout simple avec chq type simple possible
//test formulaire radio: +constraint sur valeur 


const TEST_FORM={
	"key":"voiture\/form_pec",
	"title":"Prise en charge de votre v\u00e9hicule",
	"description":"Vous pouvez amener votre v\u00e9hicule au port de d\u00e9part, ou dans un de nos d\u00e9p\u00f4ts Expedom partout en France, ou encore le faire enlever \u00e0 votre domicile.",
	"confirm":{
		"if":{ //si present, n'apparait que si la condition est realisée
			"field":"anid",//ici, apparit si anid==0
			"value":0
		},
		"title":"un titre pour la confirm",
		"description":"le texte de description <strong>(html friendly)</strong>",
		"check":"Je confirme avoir bien lu tout ca",//si present, ajoute une checkbox pour valider la lecture
		"cancellable":true //si true, ajoute un bouton Annuler a la dialog
	},
	"fields":[
		{
			"id":"anid",
			"type":"fnaa",
			"title":"Entrez vote numero de plaque d'immatriculation:",
			"description":"champs FNAA test"
		}
		,{
			"id":"anotherid",
			"type":"fnaa-group",
			"title":"Informations sur vos vehicules:",
			"description":"champs FNAA Group test"
		}
	]
};
@Injectable()
export class DynaFormTestProvider{

    load_form_description():Promise<dynaform.DynaForm>{
        return new Promise( (resolve, reject)=>{
            //creation du formulaire a partir des informations données
            resolve(TEST_FORM);//en theorie, je n'ai rien a faire d'autre....
        });
    }
}