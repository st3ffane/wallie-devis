import {Component, Input, ChangeDetectorRef, forwardRef} from "@angular/core";
import {DevisProvider} from "app/providers/devis.provider";
import {FormGroup, FormControl, Validators,Validator } from "@angular/forms";
//import {DynaForm} from "./forms/dyna.form";
import {verify_form_constraint} from "../../forms/constraints/constraints";
import * as validate from "../../validators/constraints.validator";


import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NG_VALIDATORS} from '@angular/forms';


//les infos sur le colis
class ColisDim{
  width:number;
  height:number;
  depth:number;

}



@Component({
  selector:"volume-calculator",
  templateUrl:"./calculator.html",
  styleUrls:["./calculator.scss"],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Calculator),
      multi: true
    },
    { 
      provide: NG_VALIDATORS,
      useValue: forwardRef(() => Calculator),
      multi: true
    }
  ]

})
export class Calculator  implements ControlValueAccessor, Validator{
  _volume:number = 0;
  @Input()question:any;
  @Input() form:FormGroup;


  set volume(v){
    if(v<=0) this._volume = null;
    else this._volume = +v;
    this.propagateChange(this.volume);//averti les bindings
  }
  get volume(){return this._volume;}
  colis:Array<ColisDim> = [];//les colis ajoutés
  width:number = 0;
  height:number = 0;
  depth:number = 0;
  error_msg:string = null;

  ngOnInit() {
    this.validateFn = createCounterRangeValidator(0.01);
  }

  addNewColis(){
    //verifie si c'est valide
    if(this.width > 0 && this.height > 0 && this.depth > 0) this.error_msg = null;
    else {
      this.error_msg = "Merci de renseigner les dimensions complètes de votre colis";
      return;
    }


    let c= new ColisDim();
    c.width = this.width;
    c.height = this.height;
    c.depth = this.depth;
    this.colis.push(c);
    //calcule le volume
    let v = c.width*c.height*c.depth;
    //ajoute au volume actuel 

    this.addToVolume(v);
    //remet a zero
    this.width = 0;
    this.height = 0;
    this.depth = 0;
  }
  addToVolume(v){
    this.volume += v;
    //this.propagateChange(this.volume);//averti les bindings
  }
  removeFromVolume(c){
    let v = c.width * c.height * c.depth;
    //supprime de la liste
    this.colis.splice(this.colis.indexOf(c),1);
    //modifie le volume
    this.volume -= v;

    //this.propagateChange(this.volume);//averti les bindings
  }

  //pour me faire passer pour un composant
  writeValue(value: any) {
    if (value !== undefined) {
        this.volume = value;
    }
  }
  propagateChange = (_: any) => {};

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  validateFn:Function;
  ngOnChanges(changes) {
   /* if (changes.counterRangeMin || changes.counterRangeMax) {
      this.validateFn = createCounterRangeValidator(0);
    }*/
  }
 

  validate(c: FormControl) {
     let err = {
        
          given: c.value,
          min: {
            requiredValue:0
          }
        
      };
      console.log("Asking validation");
      return (this.volume <= 0) ? err: null;
  }
}


function createCounterRangeValidator(minValue) {
  return function (c: FormControl) {
      let err = {
        rangeError: {
          given: c.value,
          min: minValue
        }
      };
      console.log("Asking validation");
      return (c.value <= minValue) ? err: null;
    
  }
}