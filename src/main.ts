import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// Get the config file
// fetch('assets/config.json')
//   .then(response => response.json())
//   .then((response: any) => {
//     // Here we add the additional provider
//     platformBrowserDynamic([{provide: FIREBASE_OPTIONS, useValue: response.firebase}])
//       .bootstrapModule(AppModule)
//       .catch(err => console.log(err));
// }).catch((response: any) => {
//   console.error('On config load', response);
// });