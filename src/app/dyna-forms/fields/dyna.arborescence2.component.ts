import {Component, Input, ChangeDetectorRef} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";


/**
 * Generation d'arborescence de choix:
 * permet de decouper un choix -unqieument des radio- en graph
 * et permet la navigation dedans.
 * 
 * 
 * PROBLEME: l'initialisation reste a optimiser comme il faut....
 */
@Component({
    selector:'df-arbo-question',
    templateUrl:"./dyna.arbo2.html",
    styleUrls:[
        "./dyna.arbo2.scss"
    ]
    // ,styles:[
    //     `.label>input{
    //         font-size: 1.1em;
    //     }
    //     .inert{
    //         pointer-events:none;
    //         color: #E3E3E3;
    //     }`
    // ]
})
export class DynaArborescence2Component{
    @Input()options:any; //les options pour mon groupe
    @Input()question:any;//la question a binder
    @Input() form:FormGroup;//le formulaire (pour validation par angular)
    @Input() groupName:string;//le nom du 'sous-groupe' auquel appartiennent les radios de ce niveau
    @Input() ctrlActive:boolean;

    constructor( private _change:ChangeDetectorRef){}
    groupValue:string = "";//le binding pour les groupes de ce niveau

    main_level = null;//les choix de base
    groups_level=[];//tous les groupes possibles (levels)
    
    //pour savoir si le controle est valide "formulairement"
    get isValid(){
        let frm = this.form.controls[this.question.id];
        return frm.errors && (frm.dirty || frm.touched);
    }

    private get_level_options(title, desc, level,parent, groupName, bindingValue = null): Array<any>{
        let opts = [];
        let subs = [];//les sous groupes generes 


        //description du level
        let first_level = {
            'title': title,
            'description': desc,
            'binding': bindingValue,
            'parent':parent,
            'groupName': groupName,

            
        };//groupe pour le premier level, celui toujours visible 
        let radios = [];//les radios presentent dans le level 
        

        for (let option of level){
            //cas le plus simple, une radio normale
            if (option.value){
                radios.push({
                    'label':option.label,
                    'groupName': groupName,
                    'value': option.value
                });
            } else if(option.options){
                //doit recreer un groupe specifique...
                 //creation d'un nouveau groupe de form au besoin
                    
                let frmctrl = this.form.controls[groupName];
                if(!frmctrl)  {
                    
                    frmctrl = new FormControl('');
                    this.form.addControl (groupName, frmctrl);//renvoie le groupe d'infos

                }

                radios.push({
                    'label':option.label,
                    'isGroup': true,
                    'value': option.label,
                    'groupName': groupName
                })
                let groups = this.get_level_options(option.label, "", option.options,groupName, option.label);//recupere les sous groupes 
                for (let g of groups) subs.push(g);//ajoute au sous groupe....
            }
        }
        //rajoutte les options au groupe 
        first_level["options"] = radios;
        
        opts.push(first_level);//ajoute le level 
        //ajoute les sous groupes 
        for (let g of subs) opts.push(g);

        return opts;

    }
    ngOnChanges(){
         
        //remappe les données pour l'affichage: par groupes de radios 
        //pour chaque groupe/level 
        
        this.groups_level = this.get_level_options('','',this.question.options,null,'main');

        this.repopulate();
        // let subs = [];//les sous groupes generes 


        // //description du level
        // let first_level = {
        //     'title': "",
        //     'description': "", //deja affiché!!
        //     'binding': 1,
        //     'parent':null

        // };//groupe pour le premier level, celui toujours visible 
        // let radios = [];//les radios presentent dans le level 
        // let groupName = "main";

        // for (let option of this.question.options){
        //     //cas le plus simple, une radio normale
        //     console.log("ajout d'un nouveau control "+option.label+" au groupe: "+groupName)
        //     if (option.value){
        //         radios.push({
        //             'label':option.label,
        //             'groupName': groupName,
        //             'value': option.value
        //         });
        //     } else if(option.options){
        //         //doit recreer un groupe specifique...
        //          //creation d'un nouveau groupe de form au besoin
        //             console.log("creation d'un groupe avec nom: "+groupName);
        //         let frmctrl = this.form.controls[groupName];
        //         if(!frmctrl)  {
        //             frmctrl = new FormControl('');
        //             this.form.addControl (groupName, frmctrl);//renvoie le groupe d'infos
        //         }

        //         radios.push({
        //             'label':option.label,
        //             'isGroup': true,
        //             'value': option.label,
        //             'groupName': groupName
        //         })
        //         let groups = this.get_level_options(option.label, "", option.options,groupName, option.label);//recupere les sous groupes 
        //         for (let g of groups) subs.push(g);//ajoute au sous groupe....
        //     }
        // }
        // //rajoutte les options au groupe 
        // first_level["options"] = radios;
        // this.main_level = first_level; //le niveau toujours visible quoi qu'il se passe 


        // //les autres niveaux
        // this.groups_level = subs;
        

        
        
        //ajoute comme nouveau groupe d'options 
        //this.groups_level = this.get_level_options("","", this.question.options,this.question.id, 'main', 1);

        //les données ont changées, recréé l'arbre de controles
        //verifie si une des options 'simples' est selectionnée 
       

        // if(this.options.options){
            
        //     for(let opt of this.options.options){
                
        //         if(opt.options){
        //             //creation d'un nouveau groupe de form au besoin
                    
        //             let frmctrl = this.form.controls[this.groupName];
        //             if(!frmctrl)  {
        //                 frmctrl = new FormControl('');
        //                 this.form.addControl (this.groupName, frmctrl);//renvoie le groupe d'infos
        //             }


        //             //stoopid monkey: verifie si un leaf de se groupe est selectionné
        //             //si peu de niveau et peu de choix, ok
        //             //mais en cas d'arborescence complexe, ca peut poser probleme....(performances)
        //             //A VOIR PLUS TARD....
        //             //2 optimisations: empecher de faire tout l'arbre a chaque fois  == DONE
        //             //                 si on a deja trouvé le groupe selectionné, ne pas le faire pour les autres groupes du niveau ==> frmctrl.value!=undefined
        //             if (value && !frmctrl.value  &&  this.has_leaf_selected(value, opt.options)){
                       
        //                 this.groupValue = opt.label;
        //             } 
                    
                    
                    
        //         }
        //     }

        //     //console.log(this.form);
        // }
        
    }

    /**
     * recherche dans les sous-options d'un groupe si une des leafs est activée
     * si oui, active le groupe
     * @param value: la valeur actuelle du field du formulaire
     * @param options: les options du groupe 
     * 
     * @return true/false: si une des options (ou sous-option, ou sous-sous....) est actuellement active (checked)
     * A OPTIMISER
     * NOTE: n'est utilisé qu'a l'initalisation du field. (et ne DOIS PAS etre utiliser ailleurs)
     */
    private has_leaf_selected(value, options, parent = "main"){
        for(let opt of options){
            if(opt.value && opt.value==value) return true; //simple valeur, le binding s'en charge....
            if(opt.options){
               
                if(this.has_leaf_selected(value, opt.options, opt.label)) {
                    //groupe selected, change la valeur ds le binding du groupe 
                   
                    if(this.form.controls[parent]){ this.form.controls[parent].setValue(opt.label);}
                    
                    return true;
                }
            }
        }
        return false;
    }

    private repopulate( ){
        let v = this.question.__value;
        //remet comme c'etait....
        //ie remet la valeur ET les sous groupes
        this.has_leaf_selected(v, this.question.options);

    }

    //si clic sur une radio node (ie, ayant un sous-groupe/options),
    //annule le choix precedement effectué 
    //le controle n'est plus valide
    annul(id){
        this.question.__value = null;//cause une erreur expression already checked en mode dev...
        this._change.detectChanges() ;

       
        //scroll smooth vers l'element
        
       
         
        
        //force le check???
        //au mieux, scroll to the new components 
        // let top = document.getElementById(id).offsetTop - 100; //Getting Y of target element
        //  console.log("position: "+top)
        // let  w_top = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
        
        setTimeout( (v)=>{
             scrollIt(id, 300, 'easeInQuad');
             console.log("hello")
        }, 100)
       
    }

    /**
     * ALERT: utilise le smooth scrolling pour afficher les nouveaux elements, pas franchement angular2-spirit!!!
     * 
     * code trouvé sur le web... appel a des timeout, voir a trouver mieux que ca...
     */
    // private currentYPosition() {
    //     // Firefox, Chrome, Opera, Safari
    //     if (self.pageYOffset) return self.pageYOffset;
    //     // Internet Explorer 6 - standards mode
    //     if (document.documentElement && document.documentElement.scrollTop)
    //         return document.documentElement.scrollTop;
    //     // Internet Explorer 6, 7 and 8
    //     if (document.body.scrollTop) return document.body.scrollTop;
    //     return 0;
    // }
    // private elmYPosition(eID) {
    //     var elm = document.getElementById(eID);
    //     var y = elm.offsetTop;
    //     var node:any = elm;
    //     while (node.offsetParent && node.offsetParent != document.body) {
    //         node = node.offsetParent;
    //         y += node.offsetTop;


    //     } return y - 100;
    // }
    // private smoothScroll(eID) {
    //     var startY = this.currentYPosition();
    //     var stopY = this.elmYPosition(eID);
    //     var distance = stopY > startY ? stopY - startY : startY - stopY;
    //     if (distance < 100) {
    //         scrollTo(0, stopY); return;
    //     }
    //     var speed = Math.round(distance / 100);
    //     if (speed >= 10) speed = 10;
    //     var step = Math.round(distance / 25);
    //     var leapY = stopY > startY ? startY + step : startY - step;
    //     var timer = 0;
    //     if (stopY > startY) {
    //         for ( var i=startY; i<stopY; i+=step ) {
    //             setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
    //             leapY += step; if (leapY > stopY) leapY = stopY; timer++;
    //         } return;
    //     }
    //     for ( var i=startY; i>stopY; i-=step ) {
    //         setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
    //         leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    //     }
    //     return false;
    // }

    /** si selectionne un element (leaf), desactive tous les radio nodes (ayant des options)
    // de son niveau et des niveaux inferieurs
    @Called sur event onChange d'une option terminale (leaf)
    @param option: un groupe d'options a verifier  si null, les options du groupe courant
    @param name: le nom du groupe d'option si null, le nom du groupe d'options courant 

    recursive
    */
    clear_groups(group: any){
        // option = option || this.options;
        // name = name || this.groupName;

        // //si un groupe du meme niveau est selectionné, deselectionne le 
        // let frm = this.form.controls[name];
        // if(frm){
        //     frm.setValue(false);
        //     //si des groupes inferieurs, idem....
        //     for(let opt of option.options){
        //         if(opt.options){
        //             //console.log(opt.label);
        //             this.clear_groups(opt,opt.label);
        //         }
                
        //     }
        // }
        //deselectionne tous les sous groupes des niveaux inferieurs 
        // je sais pas encore comment faire ca....
        let groupname = group.groupName;

        if(groupname == "main") this.form.controls[groupname].setValue(1);//pour les childs????
        else if(this.form.controls[groupname]) this.form.controls[groupname].setValue(null);//pour les childs????
        //le groupe en dessous
        
        for (let opt of group.options){
            if(opt.isGroup){
                if(this.form.controls[opt.label] && this.form.controls[opt.label].value){
                    //desactive le groupe 
                    this.form.controls[opt.label].setValue(null); //limiter a 2 niveaux, ca suffit dans notre cas, 
                    //si besoin de plus, rendre ca recursif....
                }
            }
        }

        
    }


}

function scrollIt(elementID, duration = 200, easing = 'linear', callback=null) {
  let element = document.getElementById(elementID);
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
    let rest = (destination - start);
    rest = rest < 1 ? 1 : rest;

    let amout = (timeFunction * rest ) + start;
    
    body.scrollTop = amout ;

    if (amout >= destination) {
      if (callback) callback();

      
      return;
    }
    
   
    requestAnimationFrame(scroll);
  }
  scroll();
}