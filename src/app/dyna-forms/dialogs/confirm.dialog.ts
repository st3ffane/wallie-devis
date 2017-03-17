import {Component, Input,Output, EventEmitter} from "@angular/core";


@Component({
    selector:"confirm-dlg",
    templateUrl:"./confirm.dialog.html",
    styleUrls:["./confirm.dialog.scss"]
})
export class ConfirmDialog{
    @Input() confirm; //les informations sur la confirmation
    @Input() display:boolean = false;//pour savoir si doit etre visible ou pas 
    @Output("onAnswered") onAnswered : EventEmitter<boolean> = new EventEmitter<boolean>();//la reponse de la confirmation 

    is_Checked = false;

    onSubmit(ok:boolean){
        
        this.onAnswered.emit(ok);
    }

}