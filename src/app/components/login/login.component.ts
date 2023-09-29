import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthGuard } from 'src/app/_service/auth-guard.service';
import { LoginService } from './login.service';
import { Login } from 'src/app/interface/login';
import { RefreshToken } from 'src/app/interface/refresh-token';
import { AccountSelection } from 'src/app/interface/account-selection';

import { FIRESTORE_REFERENCES } from 'src/app/core/firebase.module';
import { ConfigService } from 'src/app/common/config.service';

@Component({
  selector: 'ow-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isCollapsed = true;
  form: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });
  submitted = false;
  isLoading = false;
  uid = '' as any;
  secret = "";

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private auth: AngularFireAuth,
    private _authGuard: AuthGuard,
    private toast: ToastrService,
    private configService: ConfigService,
    @Inject(FIRESTORE_REFERENCES.TIGER_FIREAUTH) private readonly tigerFireAuth: AngularFireAuth,
    @Inject(FIRESTORE_REFERENCES.FUTU_FIREAUTH) private readonly futuFireAuth: AngularFireAuth,
    @Inject(FIRESTORE_REFERENCES.IB_FIREAUTH) private readonly ibFireAuth: AngularFireAuth,
    private defaultFireStore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.TIGER_FIRESTORE) private readonly tigerFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.FUTU_FIRESTORE) private readonly futuFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.IB_FIRESTORE) private readonly ibFirestore: AngularFirestore,
  ) {
    let config = this.configService.readConfig();
        if (config) {
            this.secret = config.secret;
        }
    if (this._authGuard.loggedIn) {
      this.router.navigate(['dashboard']);
    }
   }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email] ],
        password: ['', [Validators.required] ]
      }
    );
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.login();
    //console.log(JSON.stringify(this.form.value, null, 2));
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  resolveAccType(accType : string) : string {
    switch (accType) {
      case 'futu':
        return "FUTU";
      case 'ib':
        return "Interactive Brokers";
      case 'tiger':
        return "Tiger";
      default:
        return "";
    }
  }

  login() {
    //console.log("Log in...");
    this.isLoading = true;
    let account: Login = {
      username: this.form.value.email,
      password: this.form.value.password,
      'grant_type': 'password',
      'scope': 'openid profile roles offline_access read write',
      'client_id': 'am_webclient',
      'client_secret': this.secret,
    }

    this.loginService.login(account).subscribe((result) => {
      if (result.access_token) {
        // console.group("login Token API success");
        // console.log( "result:", result );
        // console.groupEnd();

        //localStorage.setItem('access_token', result.access_token);
        this.loginService.getUserProfile(result.access_token).subscribe(async profile => {
          localStorage.setItem('uid', profile.UserId);
          localStorage.setItem('displayname', profile.RealName);
          let result_access_token = result.access_token;

          var accountList: AccountSelection[] = [];

          var p1 = new Promise<void>((resolve, reject) => {
            this.loginService.getTigerFirebaseToken(result_access_token).subscribe(resultToken => {
              if (resultToken.Token) {
                // console.group("getFirebaseToken API success");
                // console.log( "resultToken: ", resultToken );
                // console.groupEnd();
                this.tigerFireAuth.signInWithCustomToken(resultToken.Token).then((userCredential) => {
                  if (userCredential && userCredential.user) {
                    // console.group("signInWithCustomToken API success");
                    // console.log( "userCredential: ", userCredential );
                    // console.groupEnd();
                    const uid = userCredential.user.uid;
                    localStorage.setItem('tiger-uid', uid);
                    localStorage.setItem('tiger_access_token', resultToken.Token);

                    this.tigerFirestore.collection('users').doc(uid).collection('accounts').ref.get().then(pp1 => {
                      pp1.docs.map(doc => {
                        var acc = doc.data() as any;
                        accountList.push({
                          id: acc.accountCode,
                          brokerType: this.resolveAccType(acc.type),
                        })
                      });
                      this.isLoading = false;
                      resolve();
                    });
                  } else {
                    this.isLoading = false;
                    this.toast.error('Tiger firestore failed to get profile', 'Error')
                    reject();
                  }
                }).catch((error) => {
                  this.isLoading = false;
                  this.toast.error('Tiger firestore sign in failed', 'Error')
                  reject();
                });
              } else {
                this.isLoading = false;
                this.toast.error('Tiger firestore get token failed', 'Error')
                reject();
              }
            });
          });

          var p2 = new Promise<void>((resolve, reject) => {
            this.loginService.getFutuFirebaseToken(result_access_token).subscribe(resultToken => {
              if (resultToken.Token) {
                // console.group("getFirebaseToken API success");
                // console.log( "resultToken: ", resultToken );
                // console.groupEnd();
                this.futuFireAuth.signInWithCustomToken(resultToken.Token).then((userCredential) => {
                  if (userCredential && userCredential.user) {
                    // console.group("signInWithCustomToken API success");
                    // console.log( "userCredential: ", userCredential );
                    // console.groupEnd();
                    const uid = userCredential.user.uid;
                    localStorage.setItem('futu-uid', uid);
                    localStorage.setItem('futu_access_token', resultToken.Token);

                    this.futuFirestore.collection('users').doc(uid).collection('accounts').ref.get().then(pp1 => {
                      pp1.docs.map(doc => {
                        var acc = doc.data() as any;
                        accountList.push({
                          id: acc.accountCode,
                          brokerType: this.resolveAccType(acc.type),
                        })
                      });
                      this.isLoading = false;
                      resolve();
                    });
                  } else {
                    this.isLoading = false;
                    this.toast.error('Futu firestore failed to get profile', 'Error')
                    reject();
                  }
                }).catch((error) => {
                  this.isLoading = false;
                  this.toast.error('Futu firestore sign in failed', 'Error')
                  reject();
                });
              } else {
                this.isLoading = false;
                this.toast.error('Futu firestore get token failed', 'Error')
                reject();
              }
            });
          });

          var p3 = new Promise<void>((resolve, reject) => {
            this.loginService.getIbFirebaseToken(result_access_token).subscribe(resultToken => {
              if (resultToken.Token) {
                // console.group("getFirebaseToken API success");
                // console.log( "resultToken: ", resultToken );
                // console.groupEnd();
                this.ibFireAuth.signInWithCustomToken(resultToken.Token).then((userCredential) => {
                  if (userCredential && userCredential.user) {
                    // console.group("signInWithCustomToken API success");
                    // console.log( "userCredential: ", userCredential );
                    // console.groupEnd();
                    const uid = userCredential.user.uid;
                    localStorage.setItem('ib-uid', uid);
                    localStorage.setItem('ib_access_token', resultToken.Token);

                    this.ibFirestore.collection('users').doc(uid).collection('accounts').ref.get().then(pp1 => {
                      pp1.docs.map(doc => {
                        var acc = doc.data() as any;
                        accountList.push({
                          id: acc.accountCode,
                          brokerType: this.resolveAccType(acc.type),
                        })
                      });
                      this.isLoading = false;
                      resolve();
                    });
                  } else {
                    this.isLoading = false;
                    this.toast.error('IB firestore failed to get profile', 'Error')
                    reject();
                  }
                }).catch((error) => {
                  this.isLoading = false;
                  this.toast.error('IB firestore sign in failed', 'Error')
                  reject();
                });
              } else {
                this.isLoading = false;
                this.toast.error('IB firestore get token failed', 'Error')
                reject();
              }
            });
          });

          await Promise.all([p1, p2, p3]);

          localStorage.setItem('accountSelections', JSON.stringify(accountList));

          const jsonData = JSON.stringify(result)
          localStorage.setItem('user-credential', jsonData);
          this.router.navigate(['dashboard']);
        });

      } else {
        this.isLoading = false;
        this.toast.error('Failed to get user profile', 'Error')
      }
    }, error => {
      this.toast.error('Login failed, please check your account or password and try again', 'Error')
      this.isLoading = false;
    });

    //return;

    // login with email & password
    // this.loginService.login(account).pipe(
    //   catchError(this.handleError)
    // ).subscribe(result => {
    //   if (result && result.access_token) {
    //     const jsonData = JSON.stringify(result)
    //     //localStorage.setItem('user-credential', jsonData);
    //     //localStorage.setItem('user-account', this.email.value);
    //     // get firebase custom token from server
    //     this.loginService.getFirebaseToken(result.access_token).subscribe(result => {
    //       if (result.Token) {
    //         // sign in firebase
    //         this.auth.signInWithCustomToken(result.Token).then((userCredential) => {
    //           if (userCredential && userCredential.user) {
    //             const uid = userCredential.user.uid;
    //             localStorage.setItem('firebase-uid', uid);

    //             console.log("Log in success");
    //             this.router.navigate(['dashboard']);
    //           }
    //         });
    //       }
    //     });
    //   }
    // });
  }

  async refreshToken(){

    let refreshTokenFutu: RefreshToken = {
      'client_id': 'am_webclient',
      'client_secret': this.secret,
      'grant_type': 'refresh_token',
      'refresh_token': localStorage.getItem('futu_access_token') as string,
    }
    let futu = new Promise<void>((resolve, reject) => {
      this.loginService.refreshToken(refreshTokenFutu).subscribe((result) => {
        if (result.access_token) {
          let result_access_token = result.access_token;

          this.loginService.getFutuFirebaseToken(result_access_token).subscribe(resultToken => {
            if (resultToken.Token) {
              this.futuFireAuth.signInWithCustomToken(resultToken.Token).then((userCredential) => {
                if (userCredential && userCredential.user) {
                  const uid = userCredential.user.uid;
                  localStorage.setItem('futu-uid', uid);
                  localStorage.setItem('futu_access_token', resultToken.Token);
                }
              });
            }
          });

        }
      });
    });

    let refreshTokenTiger: RefreshToken = {
      'client_id': 'am_webclient',
      'client_secret': this.secret,
      'grant_type': 'refresh_token',
      'refresh_token': localStorage.getItem('tiger_access_token') as string,
    }
    let tiger = new Promise<void>((resolve, reject) => {
      this.loginService.refreshToken(refreshTokenTiger).subscribe((result) => {
        if (result.access_token) {
          let result_access_token = result.access_token;

          this.loginService.getTigerFirebaseToken(result_access_token).subscribe(resultToken => {
            if (resultToken.Token) {
              this.tigerFireAuth.signInWithCustomToken(resultToken.Token).then((userCredential) => {
                if (userCredential && userCredential.user) {
                  const uid = userCredential.user.uid;
                  localStorage.setItem('tiger-uid', uid);
                  localStorage.setItem('tiger_access_token', resultToken.Token);
                }
              });
            }
          });

        }
      });
    });

    let refreshTokenIB: RefreshToken = {
      'client_id': 'am_webclient',
      'client_secret': this.secret,
      'grant_type': 'refresh_token',
      'refresh_token': localStorage.getItem('ib_access_token') as string,
    }
    let ib = new Promise<void>((resolve, reject) => {
      this.loginService.refreshToken(refreshTokenIB).subscribe((result) => {
        if (result.access_token) {
          let result_access_token = result.access_token;

          this.loginService.getIbFirebaseToken(result_access_token).subscribe(resultToken => {
            if (resultToken.Token) {
              this.ibFireAuth.signInWithCustomToken(resultToken.Token).then((userCredential) => {
                if (userCredential && userCredential.user) {
                  const uid = userCredential.user.uid;
                  localStorage.setItem('ib-uid', uid);
                  localStorage.setItem('ib_access_token', resultToken.Token);
                }
              });
            }
          });

        }
      });
    });

    await Promise.all([futu, tiger, ib]);
    console.log("Token refresh successfully!");

  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 500) {
      // A client-side or network error occurred. Handle it accordingly.
      alert('Login failed, please check your account or password and try again');
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      alert('Login failed, please check your account or password and try again');
    }
    // Return an observable with a user-facing error message.
    return throwError('Login failed, please check your account or password and try again.');
  }
}
