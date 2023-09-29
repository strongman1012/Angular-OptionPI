import { Injectable } from '@angular/core'
import * as signalR from "@microsoft/signalr"
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { Product } from 'src/app/interface/product';
import { ProductSearchRequest } from 'src/app/interface/product-search-request';
import { ProductApiResult } from 'src/app/interface/product-api-result';

@Injectable({
    providedIn: 'root'
})
export class signalRService {
    private baseUrl: string;
    private serverApiKey: string;
    private accessToken: string;
    private handleError: HandleError;
    private hubConnection?: signalR.HubConnection;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.baseUrl = '';
        this.serverApiKey = '';
        this.accessToken = '';

        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.priceServerApiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }
        this.handleError = httpErrorHandler.createHandleError('SignalR');
    }

    // TODO: Authorize by access token
    public startConnection = () => {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.baseUrl + "/dataserver", { accessTokenFactory: () => this.accessToken })
            .withAutomaticReconnect()
            .build();
        this.hubConnection
            .start()
            .then(() => console.log('Connection started'))
            .catch((err: any) => console.log('Error while starting connection: ' + err))
    }

    registerChannel(channels: Array<string>): Observable<any> {
        // let config = this.configService.readConfig();
        // if (config) {
        //     this.baseUrl = config.productApiUrl;
        //     this.serverApiKey = config.serverApiKey;
        // }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }
        return this.http.post<any>(this.baseUrl + "/optionpsapi/v1/RedisDataServer/Subscribe", {
            Symbols: channels
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<any>('registerChanel'))
            );
    }

    registerChannel2(channels: Array<string>): Observable<any> {
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }

        const apiEndpoint = this.baseUrl + "/optionapi/v1/signal/SubscribeAISignals"; // Replace with the second API endpoint
    
        return this.http.post<any>(apiEndpoint, {
          Symbols: channels
        }, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.accessToken
          })
        })
        .pipe(
          catchError(this.handleError<any>('registerChannel2'))
        );
      }

    public registerDataListener(channel: string): Observable<string> {
        let result = new Subject<string>();
        if (this.hubConnection) {
            this.hubConnection.on(channel, (data: any) => {
                result.next(data);
            });    
        }

        return result.asObservable();
    }
}
