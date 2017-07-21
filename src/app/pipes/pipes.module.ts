//pour rendre dispo partout, cree en tant que shared module
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';


import { BooleanPipe }   from './boolean.pipe';
//import { GetDevisDetailsPipe }     from './get.devis.details.pipe';
import { GetDevisResultPipe }     from './get.devis.result.pipe';
import { SafeHtmlPipe } from './safe.html.pipe';
import {StripHtmlPipe} from "./strip.html.pipe";
import {FNAAGroupPipe} from "./fnaa.group.pipe";
import {ToImageUrlPipes} from "./to.icon.url.pipe";

import {LightBoxComponent} from "./lighbox";

@NgModule({
  imports:      [ CommonModule ],
  declarations: [ BooleanPipe, GetDevisResultPipe, SafeHtmlPipe, StripHtmlPipe,FNAAGroupPipe , LightBoxComponent, ToImageUrlPipes],
  exports:      [ BooleanPipe, GetDevisResultPipe, SafeHtmlPipe, StripHtmlPipe, FNAAGroupPipe, LightBoxComponent, ToImageUrlPipes ]
})
export class PipesModule { }