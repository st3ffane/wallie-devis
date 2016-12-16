import {Component, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";


/**
 * here is the magic!
 * pour chaque descripteur de champs de formulaire, recherche le type
 * de composant a afficher et inscript le dans les formgroups (angular specific)
 * 
 * note: seul les champs 'simples' (ie input text, email, radio....)
 * sont gérés directement ici, les types plus complexes (arborescence, gps)
 * ont un composant dedié
 */

@Component({
    selector:'df-question',
    template: `
    <div [formGroup]="form" >
      <div [ngSwitch]="question.type">



        <div *ngSwitchCase="'text'" class="form-group">
            <label [attr.for]="question.id">{{question.title}}</label>
            
            <input  [formControlName]="question.id"
                    [id]="question.id" type="text" [(ngModel)]="question.__value"
                    class='form-control form-control-lg' required>
                    
        </div>



        <div *ngSwitchCase="'number'" class="form-group">
            <label>{{question.title}}</label>
            <input  [formControlName]="question.id"
                    [id]="question.id" type="number" [(ngModel)]="question.__value"
                    class='form-control form-control-lg'
                    required
                    >
        </div>



        <div *ngSwitchCase="'email'" class="form-group">
            <label [attr.for]="question.id">{{question.title}}</label>
            <input  [formControlName]="question.id"
                    [id]="question.id" type="email" [(ngModel)]="question.__value"
                    class='form-control form-control-lg'
                    required
                    >

            
        </div>


        <div *ngSwitchCase="'textarea'" class="form-group">
            <label [attr.for]="question.id">{{question.title}}</label>
            <textarea [formControlName]="question.id"
                    [id]="question.id" [(ngModel)]="question.__value"
                    class='form-control form-control-lg' required
                    ></textarea>
        </div>



        <div *ngSwitchCase="'select'" class="form-group">
            <label [attr.for]="question.id">{{question.title}}</label>
            <select [id]="question.id"  [formControlName]="question.id" [(ngModel)]="question.__value" 
             class="form-control" required>
                <option *ngFor="let opt of question.options" [value]="opt.value">{{opt.label}}</option>
            </select>
        </div>




        

        
        <div *ngSwitchCase="'radio'">
              <fieldset  class="form-group">
                  <legend>{{question.title}}</legend>
                  <div class="form-check" *ngFor="let it of question.options">                                       
                      <label class="form-check-label"> 
                        <input  [formControlName]="question.id"                        
                         type="radio" 
                         [(ngModel)]="question.__value"
                         [value]="it.value"
                         required
                            class="form-check-input">
                        {{it.label}}</label>    

                  </div>
              </fieldset>
           
            
        </div>

        <div *ngSwitchCase="'arbo-radio'">
                <df-arbo-question [question]="question" [groupName]="'trigger'" [options]="question" [form]="form"></df-arbo-question>            
        </div>

        <div *ngSwitchCase="'gps'">
            <dyna-gps [question]="question" [form]="form"></dyna-gps>
        </div>



        <div *ngSwitchCase="'category-radio'">
              
            <div class="form-check" *ngFor="let it of question.options">
                <fieldset  class="form-group">
                  <legend>{{it.label}}</legend>
                      <label class="form-check-label" *ngFor="let opt of it.options">              
                        <input [formControlName]="question.id"                        
                         type="radio" 
                         [(ngModel)]="question.__value"
                         [value]="opt.value"
                         required
                            class="form-check-input">
                        {{opt.label}}</label>    
                </fieldset>                      
            </div>
              
           
            
        </div>
      </div>
      <div *ngIf="isValid"  class="alert alert-danger">
        <ul>
            <li *ngIf="error.required">
            Ce champs doit obligatoirement etre renseigné!
            </li>
            <li *ngIf="error.minlength">
            Ce champs doit faire plus de <span>{{error.minlength.requiredLength}}</span> caractères.
            </li>
            <li *ngIf="error.maxlength">
            Ce champs doit faire moins de <span>{{error.maxlength.requiredLength}}</span> caractères.
            </li>
            <li *ngIf="error.pattern">
            Le contenu de ce champs n'est pas valide!
            </li>

            <li *ngIf="error.email">
            Merci d'indiquer une adresse mail valide.
            </li>

            <li *ngIf="error.min">
            Vous devez renseigner un nombre superieur à <span>{{error.min.requiredValue}}</span>.
            </li>
             <li *ngIf="error.max">
            Vous devez renseigner un nombre inferieur à <span>{{error.max.requiredValue}}</span>.
            </li>
        </ul>
      </div>
    
        
    </div>

    `,
    styles:[
        `
        
        .react{
            pointer-events:auto;
        }
        `
    ]
})
export class DynaFormItemComponent{
    @Input()question:any;
    @Input() form:FormGroup;
    error: any;
    
    //validation des champs de formulaires
    //voir a le faire reagir au onblur
    get isValid(){
        let frm = this.form.controls[this.question.id];        
        let has_errors = !frm.valid && frm.touched;
        
        if(has_errors){
            //recup l'erreur actuelle de validation
            console.log("pour: "+this.question.id);
            console.log(frm.errors);
            this.error = frm.errors;
            

        } else this.error = undefined;
        return has_errors;
    }
   

    // @DEPRECATED
    // annul(){
    //     this.question.value = null;//cause une erreur expression already checked en mode dev...
        
    // }
    // annul_group(){
    //     if(this.question.group) this.question.group = undefined;
    // }
    
}
