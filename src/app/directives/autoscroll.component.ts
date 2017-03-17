import {Directive, ElementRef} from "@angular/core";



@Directive({
    selector:"[autoscroll]"
})
export class AutoScrollComponent{
    constructor(private _elemRef:ElementRef){}

    ngAfterViewInit(){
        console.log("Hello autoscroll")
    }
}