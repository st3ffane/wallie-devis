//des infos sur une contrainte particuliere (de formulaire?)

class Constraints{

    "assert_not_eq"= function(c:any,form:any){
        //verifie qu'aucun des champs n'est egal
        let total = c.field.length;
        console.log(form);
        let fields = c.field.map( (key) => getFieldByKey(key, form).value);//recup tous les champs 
        let f;
        let j;
        //verifie qu'ils sont tous differents
        for(f = 0; f<total-1;f++){
            let r = fields[f];

            for ( j=f+1;j<total;j++) {
                if (r == fields[j]) return "formulaire invalide!!! assert_not_eq";
            }
        }
        return null;
    }
    "if"= function(c:any, form: any){
        let field = getFieldByKey(c.field, form);//le champs de reference
        let ref = c.is;
        if(field.value == ref){
            //youhou
        } 

    }
}
const FORM_CONSTRAINTS = new Constraints();
function getFieldByKey(key, form){
        for (let field of form.fields){
            if (field.key == key) return field;
        }
    }
export function verify_form_constraint(c:any, form:any){
    if(FORM_CONSTRAINTS[c.type]) return FORM_CONSTRAINTS[c.type](c,form);
    else return null;//si contrainte inconnue, elle est valide
}