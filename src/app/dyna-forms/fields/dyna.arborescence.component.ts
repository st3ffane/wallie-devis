import {Component, Input} from "@angular/core";
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
    selector:'df-arbo2-question',
    templateUrl:"./dyna.arbo.html",
    styleUrls:[
        "./dyna.arbo.scss"
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
export class DynaArborescenceComponent{
    @Input()options:any; //les options pour mon groupe
    @Input()question:any;//la question a binder
    @Input() form:FormGroup;//le formulaire (pour validation par angular)
    @Input() groupName:string;//le nom du 'sous-groupe' auquel appartiennent les radios de ce niveau
    @Input() ctrlActive:boolean;

    
    groupValue:string = "";//le binding pour les groupes de ce niveau
    
    //pour savoir si le controle est valide "formulairement"
    get isValid(){
        let frm = this.form.controls[this.question.id];
        return frm.errors && (frm.dirty || frm.touched);
    }

    ngOnChanges(){
        //les données ont changées, recréé l'arbre de controles
        //verifie si une des options 'simples' est selectionnée 
        let value = this.question.value;

        if(this.options.options){
            
            for(let opt of this.options.options){
                
                if(opt.options){
                    //creation d'un nouveau groupe de form au besoin
                    
                    let frmctrl = this.form.controls[this.groupName];
                    if(!frmctrl)  {
                        frmctrl = new FormControl('');
                        this.form.addControl (this.groupName, frmctrl);//renvoie le groupe d'infos
                    }


                    //stoopid monkey: verifie si un leaf de se groupe est selectionné
                    //si peu de niveau et peu de choix, ok
                    //mais en cas d'arborescence complexe, ca peut poser probleme....(performances)
                    //A VOIR PLUS TARD....
                    //2 optimisations: empecher de faire tout l'arbre a chaque fois  == DONE
                    //                 si on a deja trouvé le groupe selectionné, ne pas le faire pour les autres groupes du niveau ==> frmctrl.value!=undefined
                    if (value && !frmctrl.value  &&  this.has_leaf_selected(value, opt.options)){
                       
                        this.groupValue = opt.label;
                    } 
                    
                    
                    
                }
            }

            //console.log(this.form);
        }
        
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
    private has_leaf_selected(value, options){
        for(let opt of options){
            if(opt.value && opt.value==value) return true;
            if(opt.options){
                if(this.has_leaf_selected(value, opt.options)) return true;
            }
        }
        return false;
    }



    //si clic sur une radio node (ie, ayant un sous-groupe/options),
    //annule le choix precedement effectué 
    //le controle n'est plus valide
    annul(){
        this.question.__value = null;//cause une erreur expression already checked en mode dev...
        
    }

    /** si selectionne un element (leaf), desactive tous les radio nodes (ayant des options)
    // de son niveau et des niveaux inferieurs
    @Called sur event onChange d'une option terminale (leaf)
    @param option: un groupe d'options a verifier  si null, les options du groupe courant
    @param name: le nom du groupe d'option si null, le nom du groupe d'options courant 

    recursive
    */
    clear_groups(option, name?:string){
        option = option || this.options;
        name = name || this.groupName;

        //si un groupe du meme niveau est selectionné, deselectionne le 
        let frm = this.form.controls[name];
        if(frm){
            frm.setValue(false);
            //si des groupes inferieurs, idem....
            for(let opt of option.options){
                if(opt.options){
                    //console.log(opt.label);
                    this.clear_groups(opt,opt.label);
                }
                
            }
        }

        
    }

}