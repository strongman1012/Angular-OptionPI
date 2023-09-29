import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { HistoricalOrderResult } from 'src/app/interface/historical-order-result';
import { HistoricalOrderSearchRequest } from 'src/app/interface/historical-order-search-request';

@Injectable({
    providedIn: 'root'
})
export class HistoricalOrderService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private handleError: HandleError;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('HistoricalOrderService');
    }

    /** POST: Get Historical Orders Result */
    getHistoricalOrders(brokerType: string, requestObj: HistoricalOrderSearchRequest, accountID: number): Observable<HistoricalOrderResult> {
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }
        if (config && config.useSimulatedTrade) {
            return this.http.post<HistoricalOrderResult>(this.baseUrl + "/optionapi/v1/Historical/GetHistoricalOrders?accountID=" + accountID, requestObj, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    //'ApiKey': this.serverApiKey,
                    'Authorization': 'Bearer ' + this.accessToken
                })
            })
                .pipe(
                    catchError(this.handleError<HistoricalOrderResult>('Historical/GetHistoricalOrders'))
                );
        } else {
            switch (brokerType) {
                case 'Tiger':
                    return this.http.post<HistoricalOrderResult>(this.baseUrl + "/optionapi/v1/TigerOmsHistorical/GetHistoricalOrders", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    })
                    .pipe(
                        catchError(this.handleError<HistoricalOrderResult>('TigerOmsHistorical/GetHistoricalOrders'))
                    );
                case 'Interactive Brokers':
                    var baseUrl = this.baseUrl;
                    return this.http.post<HistoricalOrderResult>(baseUrl + "/optionapi/v1/IbOmsHistorical/GetHistoricalOrders", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    })
                    .pipe(
                        catchError(this.handleError<HistoricalOrderResult>('IbOmsHistorical/GetHistoricalOrders'))
                    );
                case 'FUTU':
                    return this.http.post<HistoricalOrderResult>(this.baseUrl + "/optionapi/v1/FutuOmsHistorical/GetHistoricalOrders", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    })
                    .pipe(
                        catchError(this.handleError<HistoricalOrderResult>('FutuOmsHistorical/GetHistoricalOrders'))
                    );
                default:
                    return EMPTY;
            }
        }
        
    }
}
