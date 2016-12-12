import {Component, Input, OnInit, Output, EventEmitter} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {DynaForm} from "./forms/dyna.form";
import {verify_form_constraint} from "./forms/constraints/constraints";
import * as validate from "./validators/constraints.validator";
/**
 * Ce composant se charge de creer un formulaire dans la page
 * et de generer les divers champs de ce dernier
 */


@Component({
    //moduleId: module.id,
    selector: 'dynamic-form',
    template: `
<div>
    <div *ngIf="error">
        {{error}}
    </div>
    <form #devisForm="ngForm" (ngSubmit)="onSubmit()" [formGroup]="form">
        <h1>{{formulaire.title}}</h1>
        <h2>{{formulaire.description}}</h2>
        <div *ngFor='let field of formulaire.fields' class='form-row'>
           <df-question [question]="field" [form]="form"></df-question>
        </div>
        <div class="next_step">
            <button class="btn btn-primary wide" type="submit" [disabled]="devisForm.form?.valid == false">Next</button>
        </div>
    </form>
</div>
    `,
    styles:[`
    .next_step{
        width: 100%;
        text-align: right;
    }
    .wide{
        min-width: 100%;
    }
    `]
})
export class DynamicFormComponent implements OnInit{
    @Input() formulaire:DynaForm; //les questions du formulaire a afficher
    form: FormGroup; //le group d'inputs de ce formulaire
    error:string;//en cas de non validation des contraintes de formulaires

    @Output() submit = new EventEmitter();
    constructor(){}

    ngOnInit(){
        //this.form = this._dynaForm.toFormGroup(this.questions);
        /*let group:any = {};
        for (let key in this.questions) {
            //va falloir voir comment gerer les validators????
            group[this.questions[key].key] = new FormControl(this.questions[key].value || '');
        }
        this.form = new FormGroup(group);//renvoie le groupe d'infos*/
    }

    onSubmit(){
        //si je garde l'idée des contraintes de formulaires,
        //c'est ici que ca se passera....
        this.error = null;
        if (this.formulaire.constraints){
            for (let constraint of this.formulaire.constraints){
                //suivant la contrainte, reagit comme il faut
                //ex: assert_not_eq: 
                let msg = verify_form_constraint(constraint, this.formulaire)
                if(msg){
                    this.error = msg;
                    console.log("verify not passed!!");
                    console.log(constraint.type);
                    return false;
                }

            }
        }
        return true;
    }

    ngOnChanges(){

        //questions a ete modifié, met a jour le formulaire...
        let group:any = {};
        for (let question of this.formulaire.fields) {
            let key = question.id;//la clé de la property a connaitre....
            //dans le cas des radiogroup, ca se complique un peu...
            // if (question.type == "radio" && question.options){
            //     if (group['triggerer'] === undefined){ 
            //         console.log("un nouveau radiogroup!!!")
            //          group['triggerer'] = new FormControl('');
                    
            //     }
            // }
            
            if (group[key] === undefined)  {
                //cree un nouveau control pour cette clé 
                //si a des contraintes, ajoute les 
                group[key] = new FormControl(question.value || '', this.get_validators_for_field(question));
            }
            //sinon, groupe existe deja....
        }
        this.form = new FormGroup(group);//renvoie le groupe d'infos
    }

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
                    case "required":{
                        valids.push(Validators.required);
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
