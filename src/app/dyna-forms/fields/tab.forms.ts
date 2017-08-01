import {Component, Input, ChangeDetectorRef, forwardRef} from "@angular/core";
import {DevisProvider} from "../../providers/devis.provider";
import {FormGroup, FormControl, Validators} from "@angular/forms";
//import {DynaForm} from "./forms/dyna.form";
import {verify_form_constraint} from "../forms/constraints/constraints";
import * as validate from "../validators/constraints.validator";


import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NG_VALIDATORS} from '@angular/forms';

@Component({
  selector:"tab-forms",
  templateUrl:"./tab.forms.html",
  styleUrls:["./tab.forms.scss"],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TabComponent),
      multi: true
    },
    { 
      provide: NG_VALIDATORS,
      useValue: forwardRef(() => TabComponent),
      multi: true
    }
  ]
})
export class TabComponent {
    @Input()question:any;
    @Input() form:FormGroup;
    @Input() hasValidate:boolean;
    
    //@Input() formulaire;//pour pouvoir faire les modifications
    //choix du filtre
    _filter:string ;
    filter_form_ctrl = null;//nom du control text (angular)

    selected_tab : any = null;

    cache:any = null;


    get filter(){return this._filter;}
    set filter(value:any){
      this.setFilterData(value);
      this.propagateChange(this._filter);

    }

    private setFilterData(value:any){

      //("SET FILTER DATE FOR ", value);
      //if(this._filter == value) return;//pe metre a jour les datas????

      this._filter = value;
      ////("valeur de cache ", value)
      //recupere la tab a afficher
      for(let tab of this.question.options){
        if(tab.id == this.filter){

          //modifie le formulaire pour les validations
          this.clearFormCtrls();
          
          this.selected_tab = tab;
          this.addFormCtrls();
          break;
        }
      }
    }
    private clearFormCtrls(){
      if(this.selected_tab){
        //supprime
        //("Suppression des controls");
        for(let question of this.selected_tab.fields){
         let key =question.id;//la clé de la property a connaitre....
         //("control:",key,this.form.controls[key])
         //question.value = this.form.controls[key].value;
        try{this.form.removeControl(key);}catch(err){}
        //("OK")
      }
      }
    }
    private addFormCtrls(){
      let tab = this.selected_tab;
      if(!tab) return;

      //("selected tab: ", tab)
      for(let question of tab.fields){
        question.__value = question.value; //recupere les "vraies" valeurs pour les bindings
        let key =question.id;//la clé de la property a connaitre....
        
                //("add control",key)
                //cree un nouveau control pour cette clé 
                //si a des contraintes, ajoute les 
                let ctrl = new FormControl(undefined, this.get_validators_for_field(question));
                //(this.form[key]);

                if(this.form[key])this.form.setControl(key,ctrl);
                else{
                  //("add new control");
                  try{this.form.addControl(key,ctrl);}catch(err){}
                }


                //("set value",question.__value);
                ctrl.setValue(question.__value || '');
                
      }
      
      
    }
     constructor( private _devis:DevisProvider,
        private _changeRef:ChangeDetectorRef){}

    ngOnInit(){
      this.create_forms_elements();
      //recup le 1er id comme valeur de l'input
      if(this.question){
        let id = this.question.value;
        
        if(id) this.filter = id;
        else this.filter = this.question.options[0].id;
      }
    }

    /**
     * Creation des elements du formulaire pour ce control
     * angular specific
     */
    private create_forms_elements(){
      this.filter_form_ctrl = "tabs_"+this.question.id;
      
      //ajoute au questionnaire pour profiter du cache ???
      // ERREUR: le cache n'enregistre pas...
      let ctrl = new FormControl('');
      //recup la valeur????
      //ctrl.setValue(this.question.value.filter);
      this.form.addControl(this.filter_form_ctrl, ctrl);
        //zone de recherche        
        /*this.filter_form_ctrl = "gps_search_"+this.question.id
        

        this.filter_form_ctrl = "gps_filter_"+this.question.id;
        this.form.addControl(this.filter_form_ctrl, new FormControl(''));*/
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
            //ajoute le au field 
            field["required"] = true;
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




  writeValue(value: any) {
    //("WRITE VALUE ------------------------")
    //("set value from cache ", value)
    if (value) {

      if(  value == this.cache) return;

      this.cache = value;
      //("current filter ",value);
        let filter = value.filter;
        //("filter: ",filter);
        //set panel values
        if(filter && this.question){
          for(let q of this.question.options){
            if(filter == q.id){
              for(let f of q.fields){
                f.value = value[f.id];
                //f.__value = value[f.id];
                //("set ",f.id,"to",f.value)
                
              }
            }
          }

        }
        else {
            //une simple string, donc récupere dans le 1er???
            //recup le current tab
            filter = this.question.options[0].id;
            //EXPEDOM old version HACK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let f = this.question.options[0].fields[0];
            f.value = value;
            //END HACK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        }
        this.setFilterData(filter);
    } else {
      //valeur par defaut
     //("question: ",this.question)
     /*if(this.question){
        let id = this.question.value ?  this.question.value.filter : null;
        //("precendtly tabs: ",id);
        if(!id) id = this.question.options[0].id;
        this.setFilterData(id);
        //recup le current tab
      }*/
    }
  }
  propagateChange = (_: any) => {};

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  validateFn:Function;
  
 

  validate(c: FormControl) {
    return true;//this.validateFn(c);
  }
}