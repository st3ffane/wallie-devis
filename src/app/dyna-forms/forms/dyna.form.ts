/**
 * Informatins sur un formulaire dynaimque a generer
 * 
 * Note: toute cette partie du module ne sert qu'a generer les données "bien formées"
 * dans le cas ou le webservice ne renvoie pas exactement ce dont on a besoin
 * 
 * PAS UTILE DANS LE CAS D'EXPEDOM, pas la peine de se prendre la tete sur ca....
 * 
 */
import {Field} from "./fields/field";

export class DynaForm {
    title: string; //le titre du formulaire (ex: Que voulez vous transporter?)
    description: string;//description des informations demandées
    constraints:Array<any>;//on creera un type plus tard...

    //les champs du formulaire
    fields: Array<Field> = [];

    
}