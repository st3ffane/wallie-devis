import {
  ModuleWithProviders, NgModule,
  Optional, SkipSelf }       from '@angular/core';

import { CommonModule }      from '@angular/common';


import { DevisProvider }       from './devis.provider';
import { DevisProviderConfig } from './devis.provider.config';

@NgModule({
  imports:      [ CommonModule ],
  providers:    [ DevisProvider ]
})
export class CoreModule {

  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: DevisProviderConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        {provide: DevisProviderConfig, useValue: config }
      ]
    };
  }
}
