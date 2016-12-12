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


const TEST_FORM = {
	key: "precisions_frm",
	title: "Précisions sur votre marchandise",
	description: "Merci de nous renseigner sur les caracteristiques de votre marchandise",
	
	
	fields:
	[
		{
			id:"motif",
			type:"arbo-radio",
			description:"une super description des motifs",
			title:"Pour quel motif?",

			options:[
				{
					label:"Demenagement",
					value:"DEM"
				},
				{
					label:"Succession de biens",
					value:"SUC"
				},
				{
					label:"Achat ou vente",
					options:[
						{
							label:"Neuf HT",
							options:[
								{
									label:"Importation Directe",
									value:"IMP"
								},
								{
									label:"Transit 1 mois",
									value:"T1"
								},
								{
									label:"Transit 2 mois",
									value:"T2"
								}
							]
						},
						{
							label:"Occasion HT",
							value:"OHT"
						},
						{
							label:"Neuf TTC",
							value:"NTTC"
						},
						{
							label:"Occasion TTC",
							options:[
								{
									label:"Particulier avec contrat",
									value:"PAP"
								},
								{
									label:"Particulier Argus",
									value:"PAR"
								},
								{
									label:"Professionnel/concessionnaire",
									value:"PRO"
								}
							]
						}
					]
				}
			]
		}
	]
			
};
/*
const TEST_FORM = {
	"key":"voiture\/form_pec",
	"title":"Prise en charge de votre v\u00e9hicule",
	"description":"Vous pouvez amener votre v\u00e9hicule au port de d\u00e9part, ou dans un de nos d\u00e9p\u00f4ts Expedom partout en France, ou encore le faire enlever \u00e0 votre domicile.",
	"fields":[
		{
			"type":"gps",
			"id":"pec",
			"title":"Prise en charge",
			"description":"",
			"use-text-filter":true,
			"options":[
				{
					"label":"port",
					"description":"J'am\u00e8ne mon v\u00e9hicule directement au port de d\u00e9part",
					"selected":true,
					"locations":[
						{"id":"pepot_roissy","title":"D\u00e9p\u00f4t Expedom Roissy CDG","description":"","lat":49.0098288,"lng":-2.5222987,
					"options":[
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"DEP-BRDX-MAR"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"q"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"Dds"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"efdfsf"
						}
					]},
						{"id":"pepot_toulouse","title":"D\u00e9p\u00f4t Expedom Toulouse","description":"","lat":45.1637045,"lng":-12.7266732,
					"options":[
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"DdAR"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"cdcsq"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"bh"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"htttr"
						}
					]},
						{"id":"pepot_lyon","title":"D\u00e9p\u00f4t Expedom Lyon","description":"","lat":45.7527021,"lng":4.8031399,
					"options":[
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"dvds"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"vdvsv"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"vdssee"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"zaaz"
						}
					]},
						
					]
				},
				{
					"label":"depot",
					"description":"J'am\u00e8ne mon v\u00e9hicule dans un des d\u00e9p\u00f4ts Expedom",
					"selected":false,
					"locations":
					[
						
						{
							"id":"depot_le_havre",
							"title":"D\u00e9p\u00f4t Expedom Le Havre",
							"description":"",
							"lat":49.4812929,
							"lng":0.1047474,
							"options":[
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"ooiR"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"oimii"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"uity"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"trry"
						}
					]
						},
						{"id":"depot_valenton","title":"D\u00e9p\u00f4t Expedom Valenton","description":"","lat":48.763651,"lng":2.4223637,
					"options":[
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"aghn"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"imfg"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"trzv"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"ggf"
						}
					]},
						{"id":"depot_rouen","title":"D\u00e9p\u00f4t Expedom Rouen","description":"","lat":49.4475502,"lng":1.0503412,
					"options":[
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"DuyyiiulAR"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"luidbfr"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"sgjyukulyl"
						},
						{
							"title":"Via Marseille",
							"description":"via port de marseille 400€",
							"value":"zzzrg"
						}
					]},
						{"id":"depot_nantes","title":"D\u00e9p\u00f4t Expedom Nantes","description":"","lat":47.2130902,"lng":-1.5530707},
						{"id":"depot_aubagne","title":"D\u00e9p\u00f4t Expedom Aubagne","description":"","lat":43.2960761,"lng":5.5569343},
						{"id":"depot_plaisir","title":"D\u00e9p\u00f4t Expedom Plaisir","description":"","lat":48.8118961,"lng":1.9128194}
					]
				},
				{
					"label":"domicile",
					"description":"Recuperer la marchandise chez moi: 400€",
					"value":"DOM",
					"useGeo":true
				}
				
			]}]};
//un formulaire tout simple avec chq type simple possible
/*const TEST_FORM={
	"key":"voiture\/form_pec",
	"title":"Prise en charge de votre v\u00e9hicule",
	"description":"Vous pouvez amener votre v\u00e9hicule au port de d\u00e9part, ou dans un de nos d\u00e9p\u00f4ts Expedom partout en France, ou encore le faire enlever \u00e0 votre domicile.",
	"fields":[
		{
			"id":"anid",
			"type":"text",
			"title":"un text",
			"constraints":{
				"required":true,
				"minLength":3,
				"maxLength":25,
				"pattern":"[A-Za-z]{3}"
			}

		},
		
		{
			"id":"anid2",
			"type":"email",
			"title":"un email",
			"constraints":{
				"required":true
			}

		},
		{
			"id":"anid3",
			"type":"number",
			"title":"un nombre (3-25)",
			"constraints":{
				"required":true,
				"min":3,
				"max":25
			}

		},
		{
			"id":"anid4",
			"type":"textarea",
			"title":"une textarea",
			"constraints":{
				"required":true
			}

		}
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