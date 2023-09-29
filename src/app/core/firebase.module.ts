import { InjectionToken, NgModule, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppCheckInstances } from '@angular/fire/app-check';
import { ConfigService } from '../common/config.service';

export const FUTU_FIRESTORE = new InjectionToken('firestore_second_injector');
export const IB_FIRESTORE = new InjectionToken('firestore_third_injector');
export const TIGER_FIRESTORE = new InjectionToken('firestore_fourth_injector');

export function AngularFirestoreFactory(platformId: any, zone: NgZone, configService: ConfigService, projectId: string) {
  let schedulers = new ɵAngularFireSchedulers(zone);
  let config = configService.readConfig();
  if (config) {
    switch (projectId) {
      case 'FUTU_FIRESTORE':
        return new AngularFirestore(config.futuFirebase, projectId, true, null, platformId, zone, schedulers, null, false, AngularFireAuth as any, false, false, null, null, null, null, AppCheckInstances as any);
      case 'IB_FIRESTORE':
        return new AngularFirestore(config.ibFirebase, projectId, true, null, platformId, zone, schedulers, null, false, AngularFireAuth as any, false, false, null, null, null, null, AppCheckInstances as any);
      case 'TIGER_FIRESTORE':
        return new AngularFirestore(config.tigerFirebase, projectId, true, null, platformId, zone, schedulers, null, false, AngularFireAuth as any, false, false, null, null, null, null, AppCheckInstances as any);
      }
  }
  return null;
}

export function AngularFireAuthFactory(platformId: any, zone: NgZone, configService: ConfigService, projectId: string) {
  let schedulers = new ɵAngularFireSchedulers(zone);
  let config = configService.readConfig();
  if (config) {
    switch (projectId) {
      case 'FUTU_FIRESTORE':
        return new AngularFireAuth(config.futuFirebase, projectId, platformId, zone, schedulers, null, false, null, null, false, null, AppCheckInstances as any);
      case 'IB_FIRESTORE':
        return new AngularFireAuth(config.ibFirebase, projectId, platformId, zone, schedulers, null, false, null, null, false, null, AppCheckInstances as any);
      case 'TIGER_FIRESTORE':
        return new AngularFireAuth(config.tigerFirebase, projectId, platformId, zone, schedulers, null, false, null, null, false, null, AppCheckInstances as any);
      }    
  }
  return null;
}

export const FIRESTORE_REFERENCES = {
  TIGER_FIRESTORE: 'tiger-firestore',
  TIGER_FIREAUTH: 'tiger-fireauth',
  FUTU_FIRESTORE: 'futu-firestore',
  FUTU_FIREAUTH: 'futu-fireauth',
  IB_FIRESTORE: 'ib-firestore',
  IB_FIREAUTH: 'ib-fireauth',
};

@NgModule({
  declarations: [],
  providers: [
    {provide: TIGER_FIRESTORE, useValue: 'TIGER_FIRESTORE'},
    {provide: FUTU_FIRESTORE, useValue: 'FUTU_FIRESTORE'},
    {provide: IB_FIRESTORE, useValue: 'IB_FIRESTORE'},
    {
      provide: FIRESTORE_REFERENCES.FUTU_FIRESTORE,
      deps: [PLATFORM_ID, NgZone, ConfigService, FUTU_FIRESTORE],
      useFactory: AngularFirestoreFactory
    },
    {
      provide: FIRESTORE_REFERENCES.FUTU_FIREAUTH,
      deps: [PLATFORM_ID, NgZone, ConfigService, FUTU_FIRESTORE],
      useFactory: AngularFireAuthFactory
    },
    {
      provide: FIRESTORE_REFERENCES.TIGER_FIRESTORE,
      deps: [PLATFORM_ID, NgZone, ConfigService, TIGER_FIRESTORE],
      useFactory: AngularFirestoreFactory
    },
    {
      provide: FIRESTORE_REFERENCES.TIGER_FIREAUTH,
      deps: [PLATFORM_ID, NgZone, ConfigService, TIGER_FIRESTORE],
      useFactory: AngularFireAuthFactory
    },
    {
      provide: FIRESTORE_REFERENCES.IB_FIRESTORE,
      deps: [PLATFORM_ID, NgZone, ConfigService, IB_FIRESTORE],
      useFactory: AngularFirestoreFactory
    },
    {
      provide: FIRESTORE_REFERENCES.IB_FIREAUTH,
      deps: [PLATFORM_ID, NgZone, ConfigService, IB_FIRESTORE],
      useFactory: AngularFireAuthFactory
    },
  ],
  imports: [
    CommonModule
  ]
})
export class FirebaseModule { }