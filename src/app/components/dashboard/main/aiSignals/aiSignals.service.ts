import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { ScreenerResult } from 'src/app/interface/options-screener-result';
import { SectorResult } from 'src/app/interface/sector-result';
import { PredefinedScreenerRequest } from 'src/app/interface/predefined-screener-request';
import { TradeIdeaScreenerResult } from 'src/app/interface/tradeidea-screener-result';
import { AiContractRequestDto } from 'src/app/interface/ai-contract-request';
import { TradeableContractSet } from 'src/app/interface/tradeable-contract.set';
import { IndustryResult } from 'src/app/interface/industry-result';
import * as moment from 'moment';
import { CustomFilterRequest } from 'src/app/interface/custom-filter-request';
import { AiSignalResult } from 'src/app/interface/aiSignal';

@Injectable({
    providedIn: 'root'
})
export class AiSignalsService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private handleError: HandleError;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('AiSignalsService');
    }

    /** POST: Get Predefined Screener Result */
    getPredefinedScreening(requestObj: PredefinedScreenerRequest): Observable<ScreenerResult> {
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
        return this.http.post<ScreenerResult>(this.baseUrl + "/optionapi/v1/Screener/GetPredefinedScreening", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<ScreenerResult>('Screener/GetPredefinedScreening'))
            );
    }

    /** POST: Get Predefined Screener Result */
    getPredefinedScreeningNew(requestObj: PredefinedScreenerRequest): Observable<ScreenerResult> {
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
        return this.http.post<ScreenerResult>(this.baseUrl + "/optionapi/v1/Screener/GetPredefinedScreeningNew", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<ScreenerResult>('Screener/GetPredefinedScreeningNew'))
            );
    }

    /** POST: Get Predefined Screener Result */
    getAiContracts(requestObj: AiContractRequestDto): Observable<TradeableContractSet> {
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
        return this.http.post<TradeableContractSet>(this.baseUrl + "/optionapi/v1/Screener/GetAiContracts", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<TradeableContractSet>('Screener/GetAiContracts'))
            );
    }

    getTradeIdeas(requestObj: PredefinedScreenerRequest): Observable<TradeIdeaScreenerResult> {
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
        return this.http.post<TradeIdeaScreenerResult>(this.baseUrl + "/optionapi/v1/Screener/GetDataForTradeIdeas", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<TradeIdeaScreenerResult>('Screener/GetPredefinedScreening'))
            );
    }

    /** POST: Get Custom Screener Result */
    getCustomScreening(requestObj: CustomFilterRequest): Observable<ScreenerResult> {
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
        return this.http.post<ScreenerResult>(this.baseUrl + "/optionapi/v1/Screener/GetCustomFilterScreening", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<ScreenerResult>('Screener/GetCustomFilterScreening'))
            );
    }

    /** GET: Get Sector/Industry Result */
    getSectorSelections(): Observable<SectorResult> {
        var baseUrl;
        let config = this.configService.readConfig();
        if (config) {
            baseUrl = config.productApiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }
        return this.http.get<SectorResult>(baseUrl + "/productapi/v1/Product/GetSectorSelections?_="+moment()+"&venue=US", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }

    /** GET: Get Sector/Industry Result */
    getIndustrySelections(): Observable<IndustryResult> {
        var baseUrl;
        let config = this.configService.readConfig();
        if (config) {
            baseUrl = config.productApiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }
        return this.http.get<IndustryResult>(baseUrl + "/productapi/v1/Product/GetIndustrySelections?_="+moment()+"&venue=US", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }

    /** Get: GetAiSignals Result */
    getAiSignals(): Observable<AiSignalResult[]> {
        var baseUrl;
        let config = this.configService.readConfig();
        if (config) {
            baseUrl = config.productApiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }

        return this.http.get<AiSignalResult[]>(baseUrl + "/optionapi/v1/Signal/GetAiSignals", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
    }
}