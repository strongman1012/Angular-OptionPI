import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { OptionSnapshot } from 'src/app/interface/option-snapshot';
import { SingleOptionSnapshot } from 'src/app/interface/single-option-snapshot';
import { ExpiryDatesSelection } from 'src/app/interface/expiry-dates-selection';
import { SearchContractByStrategyRequest } from 'src/app/interface/search-contract-by-strategy-request';
import { CalculateAmountRequest } from '../interface/calculate-amount-request';
import { ContractTemplateResult } from '../interface/contract-template-result';

@Injectable({
    providedIn: 'root'
})
export class OptionsService {
    private baseUrl: string;
    private serverApiKey: string;
    private accessToken: string;
    private handleError: HandleError;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.baseUrl = '';
        this.serverApiKey = '';
        this.accessToken = '';
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

        this.handleError = httpErrorHandler.createHandleError('OptionsService');
    }

    /** GET: Get Expiry Dates */
    getExpiryDates(symbol: string): Observable<ExpiryDatesSelection> {
        return this.http.get<ExpiryDatesSelection>(this.baseUrl + "/optionapi/v1/Trade/GetExpiryDatesOfContract?symbol=" + symbol, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<ExpiryDatesSelection>('getExpiryDates'))
            );
    }

    /** GET: Get Option Chain */
    getOptionChain(symbol: string, expiryDate: string): Observable<OptionSnapshot[]> {
        return this.http.get<OptionSnapshot[]>(this.baseUrl + "/optionapi/v1/Trade/GetOptionSnapshot?symbol=" + symbol + "&expiryDate=" + expiryDate, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<OptionSnapshot[]>('getOptionChain'))
            );
    }

    /** GET: Get Option Chain */
    getSingleOptionSnapshot(contract: string): Observable<SingleOptionSnapshot> {
        return this.http.get<SingleOptionSnapshot>(this.baseUrl + "/optionapi/v1/Trade/GetSingleOptionSnapshot?contract=" + contract, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<SingleOptionSnapshot>('getOptionChain'))
            );
    }

    /** GET: Strategy parameters */
    getParametersOfStrategy(requestObj: any): void {
        this.http.post(this.baseUrl + "/optionapi/v1/OptionChain/GetParametersOfStrategy", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }

    /** POST: Search Contract By Strategy */
    searchContractByStrategy(requestObj: SearchContractByStrategyRequest): Observable<ContractTemplateResult> {
        return this.http.post<ContractTemplateResult>(this.baseUrl + "/optionapi/v1/OptionChain/SearchContractByStrategy", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<ContractTemplateResult>('/OptionChain/SearchContractByStrategy'))
        );
    }

    /** POST: Calculate Amount */
    calculateAmount(requestObj: CalculateAmountRequest): void {
        this.http.post(this.baseUrl + "/optionapi/v1/OptionChain/CalculateAmount", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }
}
