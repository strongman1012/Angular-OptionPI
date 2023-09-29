import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { HistoricalPositionResult } from 'src/app/interface/historical-position-result';
import { HistoricalPositionSearchRequest } from 'src/app/interface/historical-position-search-request';

@Injectable({
    providedIn: 'root'
})
export class HistoricalPositionService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private handleError: HandleError;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('HistoricalPositionService');
    }

    /** POST: Get Historical Positions Result */
    getHistoricalPositions(brokerType: string, requestObj: HistoricalPositionSearchRequest, accountID: number): Observable<HistoricalPositionResult> {
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
            return this.http.post<HistoricalPositionResult>(this.baseUrl + "/optionapi/v1/Historical/GetHistoricalPositions?accountID=" + accountID, requestObj, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    //'ApiKey': this.serverApiKey,
                    'Authorization': 'Bearer ' + this.accessToken
                })
            }).pipe(
                catchError(this.handleError<HistoricalPositionResult>('Historical/GetHistoricalPositions'))
            );   
        } else {
            switch (brokerType) {
                case 'Tiger':
                    return this.http.post<HistoricalPositionResult>(this.baseUrl + "/optionapi/v1/TigerOmsHistorical/GetHistoricalPositions", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    })
                    .pipe(
                        catchError(this.handleError<HistoricalPositionResult>('TigerOmsHistorical/GetHistoricalPositions'))
                    );
                case 'Interactive Brokers':
                    var baseUrl = this.baseUrl;
                    return this.http.post<HistoricalPositionResult>(baseUrl + "/optionapi/v1/IbOmsHistorical/GetHistoricalPositions", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    })
                    .pipe(
                        catchError(this.handleError<HistoricalPositionResult>('IbOmsHistorical/GetHistoricalPositions'))
                    );
                case 'FUTU':
                    return this.http.post<HistoricalPositionResult>(this.baseUrl + "/optionapi/v1/FutuOmsHistorical/GetHistoricalPositions", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    })
                    .pipe(
                        catchError(this.handleError<HistoricalPositionResult>('FutuOmsHistorical/GetHistoricalPositions'))
                    );
                default:
                    return EMPTY;
            }
        }            
    }
}
