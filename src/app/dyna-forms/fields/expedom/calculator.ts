import {Component, Input, ChangeDetectorRef} from "@angular/core";
import {DevisProvider} from "app/providers/devis.provider";
import {FormGroup, FormControl, Validators} from "@angular/forms";
//import {DynaForm} from "./forms/dyna.form";
import {verify_form_constraint} from "../../forms/constraints/constraints";
import * as validate from "../../validators/constraints.validator";


import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NG_VALIDATORS} from '@angular/forms';

@Component({
  selector:"volume-calculator",
  templateUrl:"./calculator.html",
  styleUrls:["./calculator.scss"]

})
export class Calculator{
  volume:number = 0;
  @Input()question:any;
  @Input() form:FormGroup;


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
    if (changes.counterRangeMin || changes.counterRangeMax) {
      this.validateFn = createCounterRangeValidator(0);
    }
  }
 

  validate(c: FormControl) {
    return true;//this.validateFn(c);
  }
}


function createCounterRangeValidator(minValue) {
  return function validateCounterRange(c: FormControl) {
    let err = {
      rangeError: {
        given: c.value,
        min: minValue
      }
    };

    return (c.value < minValue) ? err: null;
  }
}