import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ConfigService } from './common/config.service';

@NgModule({
  providers: [
    ConfigService,
      {
          provide: APP_INITIALIZER,
          useFactory:(configService:ConfigService)=>()=>configService.loadConfig(),
          deps:[ConfigService],
          multi:true,
      }
  ]
})
export class InitModule { }