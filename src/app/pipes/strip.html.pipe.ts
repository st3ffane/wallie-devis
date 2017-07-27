import{Pipe} from "@angular/core";


@Pipe({name: 'stripHTML'})
export class StripHtmlPipe {
  constructor(){}

  transform(value: string): string {
    if(!value) return "--";
    return value.replace(/<[^>]+>/gm, '');
    // return this.sanitizer.bypassSecurityTrustHtml(style);
    // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
  }
}