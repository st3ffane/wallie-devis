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
    templateUrl:"dyna.form.item.html",
    styleUrls:["dyna.form.item.scss"]
})
export class DynaFormItemComponent{
    @Input()question:any;
    @Input()formulaire:any;//le formulaire en question, au cas ou
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
