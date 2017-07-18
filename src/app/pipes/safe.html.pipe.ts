import{Pipe, Sanitizer, SecurityContext} from "@angular/core";


@Pipe({name: 'safeHTML'})
export class SafeHtmlPipe {
  constructor(private sanitizer:Sanitizer){}

  transform(safeHtml) {
    return this.sanitizer.sanitize(SecurityContext.HTML, safeHtml);
    // return this.sanitizer.bypassSecurityTrustHtml(style);
    // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
  }
}