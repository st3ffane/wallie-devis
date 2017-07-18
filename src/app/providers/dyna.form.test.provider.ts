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
	"key":"vehicule\/form_precisions",
	"title":"Pr\u00e9cisions concernant votre v\u00e9hicule",
	"description":"Merci de renseigner les champs ci-dessous. Vous devez vous munir de votre Carte Grise pour compl\u00e9ter les informations. Commencez par saisir l'immatriculation du v\u00e9hicule et cliquez sur \"D\u00e9tails\" pour d\u00e9terminer automatiquement les caract\u00e9ristiques",
	"fields":[
			//titulaire et valeur a part...
			{
				"type":"text",
				"id":"titulaire_cg",
				"title":"Nom du titulaire de la Carte Grise",
				"description":"Indiquez le nom du (ou des) titulaire(s) de la Carte Grise"
			},
			{
				"type":"number",
				"id":"valeur",
				"title":"Valeur",
				"description":"Valeur du v\u00e9hicule en \u20ac",
				"data-type":"currency",
				"constraints":{"min":1}
			},
			{
				"type":"switch_details",//permet de switcher entre 2 vues, pour l'instant,
				//c'est pas DU TOUT reutilisable, on peut franchement parler de rustine
				//pour la vue details_vehicules!!!!!!!!!
				"title":"Informations sur votre véhicule",
				"description":"Nous avons besoin blablabla et en plus 2 possibilites blablabla...",
				"id":"group_view",//a voir si on garde l'id ou pas
				"value":"Immatriculation",
				options:[
					{
						"label":"Immatriculation",//le texte du selecteur
						"description":"Vous connaissez votre numero de plaque d'immatriculation...",
						fields:[
							{
								
								"type":"text",//normalement FNAA
								"id":"fnaa",
								"required":false,
								"hide":true,//c'est quoi ca????
								"title":"Imatriculation du v\u00e9hicule",
								"description":"Entrez l'immatriculation du v\u00e9hicule pour que nous puissions d\u00e9terminer automatiquement les caract\u00e9ristiques de votre v\u00e9hicule."
								
							}
						]
					},
					{
						"label":"Infos a la main",
						"description":"Vous ne connaissez pas.....Entrez les infos a la main....",
						fields:[
							{
								"type":"text",
								"id":"immatriculation",
								"title":"nom du capitaine",
								"description":"le nm du capitaine"
							},
							{
								"type":"text",
								"id":"marque",
								"title":"Marque",
								"description":"Marque du v\u00e9hicule"
							},
							{
								"type":"text",	
								"id":"modele",
								"title":"Mod\u00e8le",
								"description":"Mod\u00e8le du v\u00e9hicule"
							}
						]
					}
				]
			},
				
		]
};/*const TEST_FORM={
	"key":"voiture\/form_pec",
	"title":"Prise en charge de votre v\u00e9hicule",
	"description":"Vous pouvez amener votre v\u00e9hicule au port de d\u00e9part, ou dans un de nos d\u00e9p\u00f4ts Expedom partout en France, ou encore le faire enlever \u00e0 votre domicile.",
	
	"fields":[
		{
			"id":"anid",
			"type":"fnaa",
			"title":"Entrez vote numero de plaque d'immatriculation (0 pour provoquer une erreur):",
			"description":"champs FNAA test",
			//données de fallback, serviront a creer le formulaire en cas d'erreur 
			//ainsi qu'a mapper les datas pour les renvoyer au webservice
			
		}
		// ,{
		// 	"id":"anotherid",
		// 	"type":"fnaa-group",
		// 	"title":"Informations sur vos vehicules:",
		// 	"description":"champs FNAA Group test"
		// }
	]
};*/
@Injectable()
export class DynaFormTestProvider{

    load_form_description():Promise<dynaform.DynaForm>{
        return new Promise( (resolve, reject)=>{
            //creation du formulaire a partir des informations données
            resolve(TEST_FORM);//en theorie, je n'ai rien a faire d'autre....
        });
    }
}