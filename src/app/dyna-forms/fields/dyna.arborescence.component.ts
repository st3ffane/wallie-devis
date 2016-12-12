import {Component, Input} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";


/**
 * Generation d'arborescence de choix:
 * permet de decouper un choix -unqieument des radio- en graph
 * et permet la navigation dedans.
 */
@Component({
    selector:'df-arbo-question',
    template: `
              <fieldset  class="form-group" [formGroup]="form" >
                  <div class="form-check" *ngFor="let it of options.options">  
                    <!-- si une simple checkbox -->                    
                      <label *ngIf="it.value" class="form-check-label" > 
                      
                        <input  [formControlName]="question.id"                        
                         type="radio" 
                         [(ngModel)]="question.value"
                         (change)="clear_groups()"
                         [value]="it.value"
                         [attr.name]="question.id"
                            class="form-check-input"
                            required
                            >
                        {{it.label}}</label>    

                    <!-- si un groupe d'options cree une checkbox par defaut qui permettra l'edition des autres????-->
                    <fieldset *ngIf="it.options" class="form-group" >
                   
                        <label >
                        <input type="radio" [formControlName]="groupName" 
                        [attr.name]="groupName"
                        (change)="annul()" 
                         [value]="it.label"
                        #trigger
                        >{{it.label}}</label>
                        <span>{{trigger.checked}}</span>
                        <df-arbo-question [question]="question" [groupName]="it.label"  [options]="it" [form]="form" 
                            [class.inert]="!trigger.checked"></df-arbo-question>
                        
                    </fieldset>         


                  </div>
              </fieldset>
           
    `
    ,styles:[
        `.label>input{
            font-size: 1.1em;
        }
        .inert{
            pointer-events:none;
            color: #E3E3E3;
        }`
    ]
})
export class DynaArborescenceComponent{
    @Input()options:any; //les options pour mon groupe
    @Input()question:any;//la question a binder
    @Input() form:FormGroup;
    @Input() groupName:string;

    
    //pour savoir si le controle est valide "formulairement"
    get isValid(){
        let frm = this.form.controls[this.question.id];
        return frm.errors && (frm.dirty || frm.touched);
    }

    ngOnChanges(){
        //les données ont changées, recréé l'arbre de controles
        if(this.options.options){
            
            for(let opt of this.options.options){
                
                if(opt.options){
                    //creation d'un nouveau groupe de form 
                    this.form.addControl (this.groupName, new FormControl(''));//renvoie le groupe d'infos
                }
            }
        }
        
    }

    //si clic sur une radio node (ie, ayant un sous-groupe/options),
    //annule le choix precedement effectué 
    //le controle n'est plus valide
    annul(){
        this.question.value = null;//cause une erreur expression already checked en mode dev...
        
    }

    //si selectionne un element (leaf), desactive tous les radio nodes (ayant des options)
    // de son niveau et des niveaux inferieurs
    clear_groups(option, name?:string){

        option = option || this.options;
        name = name || this.groupName;

        //si un groupe du meme niveau est selectionné, deselectionne le 
        let frm = this.form.controls[name];
        if(frm){
            frm.setValue(false);
            //si des groupes inferieurs, idem....
            for(let opt of option.options){
                if(opt.options){
                    console.log(opt.label);
                    this.clear_groups(opt,opt.label);
                }
                
            }
        }
    }

}