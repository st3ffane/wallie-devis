import {Component, Input, OnInit, Output, EventEmitter, HostListener} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {DynaForm} from "./forms/dyna.form";
import {verify_form_constraint} from "./forms/constraints/constraints";
import * as validate from "./validators/constraints.validator";


import {DevisProvider} from "../providers/devis.provider";

/**
 * Ce composant se charge de creer un formulaire dans la page
 * et de generer les divers champs de ce dernier
 * 
 * * NOTE: on DOIT indiquer la contrainst 'required' si on la desire 
     * NOTE: pour donner une valeur par defaut a un field de formulaire, on indique le champs Field.value
 */


@Component({
    //moduleId: module.id,
    selector: 'dynamic-form',
    templateUrl:"./dyna.form.html",
    //styleUrls:["./dyna.form.scss"]
})
export class DynamicFormComponent implements OnInit{
    @Input() formulaire:DynaForm; //les questions du formulaire a afficher
    form: FormGroup; //le group d'inputs de ce formulaire
    error:string;//en cas de non validation des contraintes de formulaires

    @Output() submit = new EventEmitter();//pour prevenir le component parent que le formulaire a ete submitted
    constructor(private _devis:DevisProvider){}


    


    ngOnInit(){
        // silence is golden
    }

    onSubmit(){
        //si je garde l'idée des contraintes de formulaires,
        //c'est ici que ca se passera....
        // this.error = null;
        // if (this.formulaire.constraints){
        //     for (let constraint of this.formulaire.constraints){
        //         //suivant la contrainte, reagit comme il faut
        //         //ex: assert_not_eq: 
        //         let msg = verify_form_constraint(constraint, this.formulaire)
        //         if(msg){
        //             this.error = msg;
        //             console.log("verify not passed!!");
        //             console.log(constraint.type);
        //             return false;
        //         }

        //     }
        // }


        //switch toutes les __value vers value (pour eviter de faire n'importe quoi avec les next/prev du navigateur)
        // permet de decoupler l'interface graphique des veritables données 
        for (let question of this.formulaire.fields) question.value = question.__value;//

        //ajoute une entrée a l'historique 
        let k = this.formulaire['key'];
        k = k.split('/');
        this._devis.addToHistoric(k[0],k[1],this.formulaire["url"], this.formulaire["title"]);


        return true;
    }

    

    ngOnChanges(){

        //questions a ete modifié, met a jour le formulaire...
        let group:any = {};
        let first: string = this.formulaire.fields? this.formulaire.fields[0].id : null;


        for (let question of this.formulaire.fields) {

            //decouple les données de traitement (ie value) des données de binding (ie __value)
            //permet d'eviter, si l'utilisateur joue avec les boutons BACK et PREV du navigateur
            //de perdre la coherence des données 
            //CONSEQUENCE: il faut SUBMIT le formulaire pour que les données soient prises en compte
            question.__value = question.value; //recupere les "vraies" valeurs pour les bindings

            
            let key = question.id;//la clé de la property a connaitre....
            
            
            if (group[key] === undefined)  {
                //cree un nouveau control pour cette clé 
                //si a des contraintes, ajoute les 
                let ctrl = new FormControl(question.value || '', this.get_validators_for_field(question));
                group[key] = ctrl;
            }
            //sinon, groupe existe deja....
        }
        this.form = new FormGroup(group);//renvoie le groupe d'infos
        
    }

    /**
     * angular: ajoute des validateurs de champs au formctrl 
     * les validations sont données par le champs Field.constraints du descripteur de formulaire
     * 
     
     */
    private get_validators_for_field(field){
        let valids = [];

        //Probleme: les types de champs particuliers (email, tel) ne sont pas traité lors de la validation sur le onBlur!!!!
        //pour remediez au probleme, lorsque rencontre un champs 'special', ajoute une contrainte de pattern dessus pour forcer la validation 
        
        this.ensure_validation(field);
       
        if(field["constraints"]){
            let constraints = field["constraints"];
            


            let keys= Object.keys(field.constraints);
            for(let key of keys){
                let v = constraints[key];//le parametre de la contrainte, pas toujours utile
                switch(key){
                    case "min":
                    {
                        valids.push(validate.minValueValidator(v));
                        break;
                    }
                    case "max":
                    {
                        valids.push(validate.maxValueValidator(v));
                        break;
                    }
                    //..et le reste demain.....
                    case "minLength":{
                        valids.push(Validators.minLength(constraints["minLength"]));
                        break;
                    }
                    case "maxLength":{
                        valids.push(Validators.maxLength(constraints["maxLength"]));
                        break;
                    }
                    case "pattern":{
                        valids.push(Validators.pattern(constraints["pattern"]));
                        break;
                    }
                    
                    case "pattern":
                    {
                        valids.push(Validators.pattern(constraints["pattern"]));
                        break;
                    }
                    case "email":{
                        valids.push(validate.emailValidator());
                        break;
                    }
                    default: break;
                }
            }
            
        }
        //desactive le required pour les checkboxs
        if(field.required !== false){
            valids.push(Validators.required);
        }
        return valids;
    }

    //me permet de forcer la validation sur les inputs meme sur les types html speciaux
    //rajouter au besoin des types particuliers....
    private ensure_validation(field){
        if(field.type == "email"){
            if(!field.constraints) field.constraints = {};
            field.constraints["email"]=true;//
        }
    }
    
}
