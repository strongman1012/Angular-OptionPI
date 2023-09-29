import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorHandler, HandleError } from 'src/app/common/http-error-handler.service';

import { ConfigService } from 'src/app/common/config.service';
import { Login } from 'src/app/interface/login';
import { RefreshToken } from 'src/app/interface/refresh-token';
import { ApiToken } from 'src/app/interface/api-token';
import { FirebaseToken } from 'src/app/interface/firebase-token';
import { UserProfile } from 'src/app/interface/user-profile';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl: string;
  private serverApiKey: string;
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
    private configService: ConfigService) {
      this.baseUrl = '';
      this.serverApiKey = '';
      let config = this.configService.readConfig();
      if (config) {
        this.baseUrl = config.apiUrl;
        this.serverApiKey = config.serverApiKey;
      }

      this.handleError = httpErrorHandler.createHandleError('LoginService');
  }

  /** POST: reset password */
  resetPassword(email: string): Observable<{}> {
    return this.http.post<{}>(this.baseUrl + "/autoinvestapi/v1/Connection/ResetPassword", {
      Email: email
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ApiKey': this.serverApiKey
      })
    })
      .pipe(
        catchError(this.handleError<{}>('reset password'))
      );
  }

  /** POST: login account */
  login(account: Login): Observable<ApiToken> {
    const formData = new URLSearchParams();
    formData.set('username', account.username );
    formData.set('password', account.password );
    formData.set('grant_type', account.grant_type );
    formData.set('scope', account.scope );
    formData.set('client_id', account.client_id );
    formData.set('client_secret', account.client_secret );

    return this.http.post<ApiToken>(this.baseUrl + "/identity/connect/token ", formData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    })
  }

  refreshToken(refreshToken: RefreshToken): Observable<ApiToken> {
    const formData = new URLSearchParams();
    formData.set('client_id', refreshToken.client_id );
    formData.set('client_secret', refreshToken.client_secret );
    formData.set('grant_type', refreshToken.grant_type );
    formData.set('refresh_token', refreshToken.refresh_token );

    return this.http.post<ApiToken>(this.baseUrl + "/identity/connect/token ", formData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    })
  }

  getUserProfile(accessToken: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.baseUrl + "/userinfoapi/v1/UserInfo/UserInfo", {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'ApiKey': this.serverApiKey,
        'Authorization': 'Bearer ' + accessToken
      })
    })
    .pipe(
      catchError(this.handleError<UserProfile>('GetUserProfile'))
    );
  }

  /** POST: get custom firebase token from server */
  getTigerFirebaseToken(accessToken: string): Observable<FirebaseToken> {
    return this.http.post<FirebaseToken>(this.baseUrl + "/optionapi/v1/Authentication/CreateTigerOptionPiToken", {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'ApiKey': this.serverApiKey,
        'Authorization': 'Bearer ' + accessToken
      })
    })
      .pipe(
        catchError(this.handleError<FirebaseToken>('tiger login account'))
      );
  }

  /** POST: get custom firebase token from server */
  getFutuFirebaseToken(accessToken: string): Observable<FirebaseToken> {
    return this.http.post<FirebaseToken>(this.baseUrl + "/optionapi/v1/Authentication/CreateFutuOptionPiToken", {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'ApiKey': this.serverApiKey,
        'Authorization': 'Bearer ' + accessToken
      })
    })
      .pipe(
        catchError(this.handleError<FirebaseToken>('futu login account'))
      );
  }

  /** POST: get custom firebase token from server */
  getIbFirebaseToken(accessToken: string): Observable<FirebaseToken> {
    return this.http.post<FirebaseToken>(this.baseUrl + "/optionapi/v1/Authentication/CreateIbOptionPiToken", {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'ApiKey': this.serverApiKey,
        'Authorization': 'Bearer ' + accessToken
      })
    })
      .pipe(
        catchError(this.handleError<FirebaseToken>('ib login account'))
      );
  }
}
