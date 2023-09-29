// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    'DEFAULT': {
      apiKey: "AIzaSyB88SxHmnaPHAOUUrwXwmOXx7H2XmSmyjQ",
      authDomain: "tigeropenapidemo.firebaseapp.com",
      databaseURL: "https://tigeropenapidemo.firebaseapp.com",
      projectId: "tigeropenapidemo",
      storageBucket: "tigeropenapidemo.appspot.com",
      messagingSenderId: "988169432067",
      appId: "1:988169432067:web:08f31ae594e4023dda3236",
      measurementId: "G-PBB183WR3J"
    },
    'FUTU_FIRESTORE': {
      apiKey: "AIzaSyCEaLpLZdbMkRL-Uv4VlDGXvqFTbY1BzF8",
      authDomain: "futu-optionpi.firebaseapp.com",
      databaseURL: "https://futu-optionpi.firebaseapp.com",
      projectId: "futu-optionpi",
      storageBucket: "futu-optionpi.appspot.com",
      messagingSenderId: "409765519865",
      appId: "1:409765519865:web:62d3bfee4051bacd58dd28",
      measurementId: "G-N0CMEXE03M"
    },
    'IB_FIRESTORE': {
      apiKey: "AIzaSyBdFn4a6fg-HC04rjQFaLdFI5x34iF3iQs",
      authDomain: "ib-optionpi.firebaseapp.com",
      databaseURL: "https://ib-optionpi.firebaseapp.com",
      projectId: "ib-optionpi",
      storageBucket: "ib-optionpi.appspot.com",
      messagingSenderId: "268758119020",
      appId: "1:268758119020:web:01bd25b6ae688d1f5cde49",
      measurementId: "G-6C6S2X1PRG"
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
