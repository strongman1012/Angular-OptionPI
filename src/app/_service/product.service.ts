import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { Product } from 'src/app/interface/product';
import { ProductSearchRequest } from 'src/app/interface/product-search-request';
import { ProductApiResult } from 'src/app/interface/product-api-result';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
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
            this.baseUrl = config.productApiUrl;
            this.serverApiKey = config.serverApiKey;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.access_token;
        }

        this.handleError = httpErrorHandler.createHandleError('ProductService');
    }

    /** GET: Get Expiry Dates */
    getProductFromSymbol(symbol: string): Observable<ProductApiResult> {
        return this.http.get<ProductApiResult>(this.baseUrl + "/productapi/v1/Product/GetProductBySymbol?symbol=" + symbol + "&venue=UnitedStates", {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<ProductApiResult>('GetProductBySymbol'))
            );
    }

    /** POST: Search products by market */
    searchProduct(requestObj: ProductSearchRequest): Observable<Product[]> {
        return this.http.post<Product[]>(this.baseUrl + "/productapi/v1/Product/SearchProductByMarket", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        })
            .pipe(
                catchError(this.handleError<Product[]>('SearchProductByMarket'))
            );
    }
}
