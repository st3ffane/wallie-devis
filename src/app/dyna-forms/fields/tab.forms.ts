import {Component, Input, ChangeDetectorRef} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import {DevisProvider} from "../../providers/devis.provider";

@Component({
  selector:"tab-forms",
  templateUrl:"./tab.forms.html",
  styleUrls:["./tab.forms.scss"]
})
export class TabComponent {
    @Input()question:any;
    @Input() form:FormGroup;
    //@Input() formulaire;//pour pouvoir faire les modifications
    //choix du filtre
    _filter:string ;
    filter_form_ctrl = null;//nom du control text (angular)

    get filter(){return this._filter;}

     constructor( private _devis:DevisProvider,
        private _changeRef:ChangeDetectorRef){}

    ngOnInit(){
      this.create_forms_elements();
      //recup le 1er id comme valeur de l'input
      if(this.question){
        this._filter = this.question.options[0].id;
      }
    }

    /**
     * Creation des elements du formulaire pour ce control
     * angular specific
     */
    private create_forms_elements(){
      this.filter_form_ctrl = "tabs_"+this.question.id;
      this.form.addControl(this.filter_form_ctrl, new FormControl(''));
        //zone de recherche        
        /*this.filter_form_ctrl = "gps_search_"+this.question.id
        

        this.filter_form_ctrl = "gps_filter_"+this.question.id;
        this.form.addControl(this.filter_form_ctrl, new FormControl(''));*/
    }
}