import {InjectionToken} from '@angular/core';

export const ENV_CONFIG: InjectionToken<ENV> = new InjectionToken<ENV>('env-file');

export interface ENV {
  production: boolean,
  firebaseConfig: {
    [projectKey: string]: {
      apiKey: string;
      authDomain: string;
      databaseURL: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
      measurementId?: string;
    }
  }
}
