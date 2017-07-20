import {Component, Input} from "@angular/core";


@Component({
  selector:'lght-box',
  templateUrl:"./lightbox.html",
  styleUrls:['./lightbox.scss']
})
export class LightBoxComponent{
  @Input() lighbox;//les informations sur la lighbox
  active:boolean = false;

  toggle(){
    this.active = !this.active;
  }
  
}