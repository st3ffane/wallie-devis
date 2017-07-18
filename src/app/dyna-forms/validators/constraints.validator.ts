import { FormControl } from '@angular/forms';
/**
 * Pour garder de la constance dans la validation des formulaires, 
 * super, je me retape tous les validators
 * 
 * NOTE: probleme pour email, tel, zipcode (ie: les champs text avec regex)
 */
export const minValueValidator = (min:number) => {
  return (control:FormControl) => {
    var num = +control.value;
    if(isNaN(num) || num < min){
      return {
          "min":{
                "requiredValue": min
              }
      };
    }
    return null;
  };
};

export const maxValueValidator = (min:number) => {
  return (control:FormControl) => {
    var num = +control.value;
    if(isNaN(num) || num > min){
      return {
          "max":{
             "requiredValue": min
          }
         
      };
    }
    return null;
  };
};

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const emailValidator = () => {
  return (control:FormControl) => {
    var mail = control.value;
    if(!EMAIL_REGEX.test(mail)){
      return {
          "email":true
         
      };
    }
    return null;
  };
};