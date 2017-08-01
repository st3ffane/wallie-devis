import {Component, Input, OnInit, Output, EventEmitter, HostListener} from "@angular/core";
import {FormGroup, FormControl, Validators, FormGroupDirective} from "@angular/forms";
import {DynaForm} from "./forms/dyna.form";
import {verify_form_constraint} from "./forms/constraints/constraints";
import * as validate from "./validators/constraints.validator";


import {DevisProvider} from "../providers/devis.provider";

/**
 * Ce composant se charge de creer un formulaire dans la page
 * et de generer les divers champs de ce dernier
 * 
 * * NOTE: on DOIT indiquer la contrainst 'required' si on la desire 
     * NOTE: pour donner une valeur par defaut a un field de formulaire, on indique le champs Field.value
 */


@Component({
    //moduleId: module.id,
    selector: 'dynamic-form',
    templateUrl:"./dyna.form.html",
    styleUrls:["./dyna.form.scss"]
})
export class DynamicFormComponent implements OnInit{
    @Input() formulaire:any; //les questions du formulaire a afficher
    form: FormGroup; //le group d'inputs de ce formulaire
    error:string;//en cas de non validation des contraintes de formulaires

    has_validate:boolean = false;

    show_confirm : boolean = false; //si une confirmation, trigger pour l'afficher


    @Output() submitted = new EventEmitter();//pour prevenir le component parent que le formulaire a ete submitted
    constructor(private _devis:DevisProvider){
      ////("here constructor")
    }

   


    ngOnInit(){
        // silence is golden
        ////("here")
    }

    onSubmit(form:FormGroupDirective){
        //si je garde l'idée des contraintes de formulaires,
        //c'est ici que ca se passera....
        // this.error = null;
        // if (this.formulaire.constraints){
        //     for (let constraint of this.formulaire.constraints){
        //         //suivant la contrainte, reagit comme il faut
        //         //ex: assert_not_eq: 
        //         let msg = verify_form_constraint(constraint, this.formulaire)
        //         if(msg){
        //             this.error = msg;
        //             //("verify not passed!!");
        //             //(constraint.type);
        //             return false;
        //         }

        //     }
        // }
         this.has_validate = true;
        if(!form.valid){
          console.log("INVALID!!!!!!!!!!!!!!!!");
          //recup la premiere erreur
          let elem = document.getElementsByClassName("ng-invalid")[1];
          console.log(elem)
          scrollIt(elem);

          return;
        }
        if(this.isConfirmNeeded() ){
            //affiche la dialog de confirmation 
            this.show_confirm = true;
            return false; //attends la confirmation du code

        }

        //switch toutes les __value vers value (pour eviter de faire n'importe quoi avec les next/prev du navigateur)
        // permet de decoupler l'interface graphique des veritables données 
        // for (let question of this.formulaire.fields) question.value = question.__value;//

        // //ajoute une entrée a l'historique 
        // let k = this.formulaire['key'];
        // k = k.split('/');
        // this._devis.addToHistoric(k[0],k[1],this.formulaire["url"], this.formulaire["title"]);


        // return true;
        this.doSubmit(true);
        return true;
    }

    private doSubmit(form?:any){
        //switch toutes les __value vers value (pour eviter de faire n'importe quoi avec les next/prev du navigateur)
        // permet de decoupler l'interface graphique des veritables données 
         //remet la dialog en place
        //this.show_confirm = false;
        if(!form){
            return;
        }
       
        this.show_confirm = false;
        //recup les valeurs des formulaires,
        //Doit aussi se faire si back???
        for (let question of this.formulaire.fields) {
            question.value = question.__value;
            //si vehicule_infos; HACK POUR FNAA
            //probleme si revient du cache....
            if(question._raw_value) question.value = question._raw_value;

            //si tabs, cree un objet
            if(question.type=="tabs"){
              //console.log("validate tabs, create object", question);
              let v= question.value;

              //recup la tab 
              for(let t of question.options){
                if (t.id == v){
                  //youpi
                  //console.log("tab trouvée");
                  
                      let obj = {
                        filter: v
                      };
                        
                        
                          //recup les données
                          for(let f of t.fields){
                            //enregistre les valeurs
                            obj[f.id] = f.__value;//?
                            //si un select, recup aussi le label
                            if(f.type=="select"){
                              obj[f.id+"_label"] = this.get_label_for_value(f.__value,f.options);
                            }
                            //obj[f.id+"_label"] = f.
                          }
                        

                      
                      question.value = obj;
                }
              }
            }
           
        }

        //ajoute une entrée a l'historique 
        let k = this.formulaire['key'];
        k = k.split('/');
        this._devis.addToHistoric(k[0],k[1],this.formulaire["url"], this.formulaire["title"]);
        

        this.submitted.emit();

    }
    private get_label_for_value(value, options){
        for (let opt of options){
            
            
            if (opt["options"] || opt["locations"]){
                let lbl = this.get_label_for_value(value, opt["options"] || opt["locations"] );
                if(lbl) return lbl;
                //sinon, continue
            }
            else if (opt["value"] && opt["value"] == value) return opt["label"] || opt['title'];
        }
        return false;//on a pas trouvé
    }
    doConfirmReturn(ok){
        if(ok) this.doSubmit();
    }

    private isConfirmNeeded():boolean{
        let confirm = this.formulaire["confirm"];
        if(!confirm) return false;

        if(confirm["if"]){
            //les tests
            let field_name = confirm["if"]["field"];
            let value = confirm["if"]["value"];

            return this.form.controls[field_name].value == value;
        }
        //sinon, demande toujours confirmation
        return true;
    }

    ngOnChanges(dt){
        //questions a ete modifié, met a jour le formulaire...
        this.has_validate = false;
        let group:any = {};
        let first: string = this.formulaire.fields? this.formulaire.fields[0].id : null;


        for (let question of this.formulaire.fields) {

            //decouple les données de traitement (ie value) des données de binding (ie __value)
            //permet d'eviter, si l'utilisateur joue avec les boutons BACK et PREV du navigateur
            //de perdre la coherence des données 
            //CONSEQUENCE: il faut SUBMIT le formulaire pour que les données soient prises en compte
            question.__value = question.value; //recupere les "vraies" valeurs pour les bindings
            //remet a null pour ce cas 
            question.value = null;
            
            //SI FNAA, DOIT AUSSI RECUP LES RAWS_VALUES???
            if(question.type=="fnaa"){
                let v = question.value;//normalement, le raw du WS
                
                question._raw_value = question.value;
                question.value = question._raw_value ? question._raw_value['immatriculation'] : "";
            } else if(question.type == "tabs"){
              //("had a tabs", question);
              //parse le contenu de la value: doit normalement avoir le type(filter) et les datas
              if(question.__value){
                let v = question.__value;
                
              }
            } 

            
            let key = question.id;//la clé de la property a connaitre....
            
            
            if (group[key] === undefined)  {
                //cree un nouveau control pour cette clé 
                //si a des contraintes, ajoute les 
                let ctrl = new FormControl(question.value || '', this.get_validators_for_field(question));
                group[key] = ctrl;

                //probleme, certains groupes definissent des inner-fields, notamment le hack pour 
                //les details vehicules, donc si un type 'a la con', recupere les inner pour les inscrires
                
                //pourquoi la suppression de ce code???=> parceque tous les champs sont deja presents...
               
                /*if (question.type=="switch_details"){
                    //("un switch details");
                    for (let option of question.options){
                        //(option);
                        for (let inner_field of option.fields){
                            //(inner_field.id)
                            let ctrl = new FormControl(inner_field.value || '', this.get_validators_for_field(inner_field));
                            group[inner_field.id] = ctrl;
                        }
                    }
                }*/
            }
            //sinon, groupe existe deja....
        }
        ////(group);
        this.form = new FormGroup(group);//renvoie le groupe d'infos
        ////(this.form.controls);
    }

    /**
     * angular: ajoute des validateurs de champs au formctrl 
     * les validations sont données par le champs Field.constraints du descripteur de formulaire
     * 
     
     */
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
    
}

function scrollIt(element, duration = 200, easing = 'linear', callback=null) {
  //let element = document.getElementById(elementID);
  if(!element) return;
  console.log(element.offsetTop);

  // define timing functions
  const easings = {
    linear(t) {
      return t;
    },
    easeInQuad(t) {
      return t * t;
    },
    easeOutQuad(t) {
      return t * (2 - t);
    },
    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    easeInCubic(t) {
      return t * t * t;
    },
    easeOutCubic(t) {
      return (--t) * t * t + 1;
    },
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    easeInQuart(t) {
      return t * t * t * t;
    },
    easeOutQuart(t) {
      return 1 - (--t) * t * t * t;
    },
    easeInOutQuart(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    },
    easeInQuint(t) {
      return t * t * t * t * t;
    },
    easeOutQuint(t) {
      return 1 + (--t) * t * t * t * t;
    },
    easeInOutQuint(t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    }
  };

  // Returns document.documentElement for Chrome and Safari
  // document.body for rest of the world
  function checkBody() {
    document.documentElement.scrollTop += 1;
    const body = (document.documentElement.scrollTop !== 0) ? document.documentElement : document.body;
    document.documentElement.scrollTop -= 1;
    return body;
  }

  const body = checkBody();
  const start = body.scrollTop;
  const startTime = Date.now();

  // Height checks to prevent requestAnimationFrame from infinitely looping
  // If the function tries to scroll below the visible document area
  // it should only scroll to the bottom of the document
  const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
  const destination = documentHeight - element.offsetTop < windowHeight ? documentHeight - windowHeight : element.offsetTop;


  console.log(destination+","+windowHeight+","+documentHeight)
  function scroll() {
    const now = Date.now();
    const time = Math.min(1, ((now - startTime) / duration));
    const timeFunction = easings[easing](time);
    let rest = (start - destination);
    rest = rest < 1 ? 1 : rest;

    let amout = start - (timeFunction * rest );
    
    body.scrollTop = amout ;
    console.log(amout)
    if (amout <= destination) {
      if (callback) callback();

      
      return;
    }
    
   
    requestAnimationFrame(scroll);
  }
  scroll();
}