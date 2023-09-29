import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { AskMarketData } from 'src/app/interface/ask-market-data'; 
import { BidMarketData } from 'src/app/interface/bid-market-data'; 
import { MarketData } from 'src/app/interface/market-data'; 
import { PlaceStockOrderRequest } from '../interface/place-stock-order-request';
import { PlaceStrategyOrderRequest } from '../interface/place-strategy-order-request';

@Injectable({
    providedIn: 'root'
})
export class TradeService {
    private baseUrl: string;
    private baseDataApiUrl: string;
    private serverApiKey: string;
    private accessToken: string;
    private useSimulatedTrade: boolean;
    private handleError: HandleError;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {     
        this.baseUrl = '';
        this.baseDataApiUrl = '';
        this.serverApiKey = '';
        this.accessToken = '';
        this.useSimulatedTrade = false;
        let config = this.configService.readConfig();
        if (config) {
            this.baseUrl = config.apiUrl;
            this.baseDataApiUrl = config.dataApiUrl;
            this.serverApiKey = config.serverApiKey;
            this.useSimulatedTrade = config.useSimulatedTrade;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }
            
        this.handleError = httpErrorHandler.createHandleError('TradeService');
    }

    /** POST: Place Stock Order */
    placeStockOrder(requestObj: PlaceStockOrderRequest): Observable<any> {
        if (this.useSimulatedTrade) {
            return this.http.post<any>(this.baseUrl + "/optionapi/v1/Trade/PlaceOrder", requestObj, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    //'ApiKey': this.serverApiKey,
                    'Authorization': 'Bearer ' + this.accessToken
                })
            }).pipe(
                catchError(this.handleError<any>('/Trade/PlaceOrder'))
            );
        } else {
            switch (requestObj.Broker) {
                case 'Tiger':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/TigerOms/PlaceStockOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError<any>('/Oms/PlaceStockOrder'))
                    );
                case 'Interactive Brokers':
                    var baseUrl = this.baseUrl;
                    return this.http.post<any>(baseUrl + "/optionapi/v1/IbOms/PlaceStockOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError<any>('/IbOms/PlaceStockOrder'))
                    );

                    // return this.http.post<any>(this.baseUrl + "/optionapi/v1/IbOms/PlaceStockOrder", requestObj, {
                    //     headers: new HttpHeaders({
                    //         'Content-Type': 'application/json',
                    //         //'ApiKey': this.serverApiKey,
                    //         'Authorization': 'Bearer ' + this.accessToken
                    //     })
                    // }).pipe(
                    //     catchError(this.handleError<any>('/IbOms/PlaceStockOrder'))
                    // );
                case 'FUTU':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/FutuOms/PlaceStockOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError<any>('/FutuOms/PlaceStockOrder'))
                    );
                default:
                    return EMPTY;
            }            
        }
    }

    /** POST: Place Stock Order */
    placeOptionOrder(requestObj: PlaceStockOrderRequest): Observable<any>  {
        if (this.useSimulatedTrade) {
            return this.http.post<any>(this.baseUrl + "/optionapi/v1/Trade/PlaceOrder", requestObj, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    //'ApiKey': this.serverApiKey,
                    'Authorization': 'Bearer ' + this.accessToken
                })
            }).pipe(
                catchError(this.handleError('/Trade/PlaceOrder'))
            );
        } else {
            switch (requestObj.Broker) {
                case 'Tiger':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/TigerOms/PlaceOptionOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/Oms/PlaceOptionOrder'))
                    );
                case 'Interactive Brokers':
                    var baseUrl = this.baseUrl;
                    return this.http.post<any>(baseUrl + "/optionapi/v1/IbOms/PlaceOptionOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/IbOms/PlaceOptionOrder'))
                    );
                    // return this.http.post<any>(this.baseUrl + "/optionapi/v1/IbOms/PlaceOptionOrder", requestObj, {
                    //     headers: new HttpHeaders({
                    //         'Content-Type': 'application/json',
                    //         //'ApiKey': this.serverApiKey,
                    //         'Authorization': 'Bearer ' + this.accessToken
                    //     })
                    // }).pipe(
                    //     catchError(this.handleError('/IbOms/PlaceOptionOrder'))
                    // );
                case 'FUTU':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/FutuOms/PlaceOptionOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/FutuOms/PlaceOptionOrder'))
                    );
                default:
                    return EMPTY;
            }
        }        
    }

    /** POST: Place Strategy Order */
    placeStrategyOrder(requestObj: PlaceStrategyOrderRequest): any {
        if (this.useSimulatedTrade) {
            return this.http.post<any>(this.baseUrl + "/optionapi/v1/Trade/PlaceStrategyOrder", requestObj, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    //'ApiKey': this.serverApiKey,
                    'Authorization': 'Bearer ' + this.accessToken
                })
            }).pipe(
                catchError(this.handleError('/Trade/PlaceStrategyOrder'))
            );
        } else {
            switch (requestObj.Broker) {
                case 'Tiger':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/TigerOms/PlaceStrategyOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/Oms/PlaceStrategyOrder'))
                    );
                case 'Interactive Brokers':          
                    var baseUrl = this.baseUrl;
                    return this.http.post<any>(baseUrl + "/optionapi/v1/IbOms/PlaceStrategyOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/IbOms/PlaceStrategyOrder'))
                    );
                    // return this.http.post<any>(this.baseUrl + "/optionapi/v1/IbOms/PlaceStrategyOrder", requestObj, {
                    //     headers: new HttpHeaders({
                    //         'Content-Type': 'application/json',
                    //         //'ApiKey': this.serverApiKey,
                    //         'Authorization': 'Bearer ' + this.accessToken
                    //     })
                    // }).pipe(
                    //     catchError(this.handleError('/IbOms/PlaceStrategyOrder'))
                    // );
                case 'FUTU':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/FutuOms/PlaceStrategyOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/FutuOms/PlaceStrategyOrder'))
                    );
                default:
                            return EMPTY;
            }
        }
    }

    /** POST: Place Strategy Order */
    cancelStrategyOrder(requestObj: any): any {
        if (this.useSimulatedTrade) {
            return this.http.post<any>(this.baseUrl + "/optionapi/v1/Trade/CancelStrategyOrder", requestObj, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    //'ApiKey': this.serverApiKey,
                    'Authorization': 'Bearer ' + this.accessToken
                })
            }).pipe(
                catchError(this.handleError('/Trade/CancelStrategyOrder'))
            );
        } else {
            switch (requestObj.Broker) {
                case 'Tiger':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/TigerOms/CancelStrategyOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/Oms/CancelStrategyOrder'))
                    );
                case 'Interactive Brokers':
                    var baseUrl = this.baseUrl;
                    return this.http.post<any>(baseUrl + "/optionapi/v1/IbOms/CancelStrategyOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/IbOms/CancelStrategyOrder'))
                    );
                    // return this.http.post<any>(this.baseUrl + "/optionapi/v1/IbOms/CancelStrategyOrder", requestObj, {
                    //     headers: new HttpHeaders({
                    //         'Content-Type': 'application/json',
                    //         //'ApiKey': this.serverApiKey,
                    //         'Authorization': 'Bearer ' + this.accessToken
                    //     })
                    // }).pipe(
                    //     catchError(this.handleError('/IbOms/CancelStrategyOrder'))
                    // );
                case 'FUTU':
                    return this.http.post<any>(this.baseUrl + "/optionapi/v1/FutuOms/CancelStrategyOrder", requestObj, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            //'ApiKey': this.serverApiKey,
                            'Authorization': 'Bearer ' + this.accessToken
                        })
                    }).pipe(
                        catchError(this.handleError('/FutuOms/CancelStrategyOrder'))
                    );
                default:
                    return;
            }
        }
    }

    getMarketData(productId: number): Observable<MarketData> {
        return this.http.get<MarketData>(this.baseDataApiUrl + "/marketdataapi/v1/MarketData/GetAllMarketData?productId=" + productId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
        .pipe(
            catchError(this.handleError<MarketData>('getExpiryDates'))
        );
    }

    getAskData(productId: number): Observable<AskMarketData> {
        return this.http.get<AskMarketData>(this.baseDataApiUrl + "/marketdataapi/v1/MarketData/GetAskData?productId=" + productId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
        .pipe(
            catchError(this.handleError<AskMarketData>('getAskData'))
        );
    }

    /** GET: Get option snapshots */
    getBidData(productId: number): Observable<BidMarketData> {
        return this.http.get<BidMarketData>(this.baseDataApiUrl + "/marketdataapi/v1/MarketData/GetBidData?productId=" + productId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
        .pipe(
            catchError(this.handleError<BidMarketData>('getBidData'))
        );
    }
}
