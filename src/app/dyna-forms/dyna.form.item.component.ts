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
    @Input() hasValidate:boolean;

    @Input() forcedisplay: boolean = false;
    error: any;
    
    //validation des champs de formulaires
    //voir a le faire reagir au onblur
    //probleme, doit etre appeller a chaque modif...
    isValid(){
      this.error = null;
        let frm = this.form.controls[this.question.id];        
        //console.log("ISVALID: form",frm);
        let has_errors = frm ?  !frm.valid  : false;
        //console.log(frm.errors, has_errors);
        if(has_errors){
            //recup l'erreur actuelle de validation
            //console.log("pour: "+this.question.id);
            // console.log(frm.errors);
            this.error = frm.errors;
            

        }
        //console.log(this.hasValidate, this.error);
        return (this.hasValidate || frm.touched) && this.error!=null;
    }
   

    // @DEPRECATED
    // annul(){
    //     this.question.value = null;//cause une erreur expression already checked en mode dev...
        
    // }
    // annul_group(){
    //     if(this.question.group) this.question.group = undefined;
    // }
    
}
