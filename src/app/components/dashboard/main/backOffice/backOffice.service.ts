import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { AddPositionGroupRequest } from 'src/app/interface/add-position-group-request';
import { AddOrderGroupRequest } from 'src/app/interface/add-order-group-request';
import { ActivePositionLegEntry } from 'src/app/interface/active-position-leg-entry';
import { ActiveOrderLegEntry } from 'src/app/interface/active-order-leg-entry';

@Injectable({
    providedIn: 'root'
})
export class BackOfficeService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private handleError: HandleError;

    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('ScreenerService');
    }

    addActiveOrder(model: ActiveOrderLegEntry, userId: string, accountNumber: string) {
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
        this.http.post(this.baseUrl + "/optionapi/v1/OptionSimulator/AddActiveOrder?userId="
            + userId + "&accountNumber=" + accountNumber, model, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/AddActiveOrder'))
        ).subscribe();
    }
    addOpenPosition(model: ActivePositionLegEntry, userId: string, accountNumber: string) {
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
        this.http.post(this.baseUrl + "/optionapi/v1/OptionSimulator/AddOpenPosition?userId="
            + userId + "&accountNumber=" + accountNumber, model, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/AddActiveOrder'))
        ).subscribe();
    }
    addOrderGroup(request: AddOrderGroupRequest) {
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
        this.http.post(this.baseUrl + "/optionapi/v1/OptionSimulator/AddOrderGroup", request, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/AddOpenPosition'))
        ).subscribe();
    }
    addPositionGroup(request: AddPositionGroupRequest) {
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
        this.http.post(this.baseUrl + "/optionapi/v1/OptionSimulator/AddPositionGroup", request, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/AddOpenPosition'))
        ).subscribe();
    }
    DeleteActiveOrder(userId: string, accountNumber: string, orderId: string) :void {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeleteActiveOrder?userId="
            + userId + "&accountNumber=" + accountNumber + "&orderId=" + orderId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeleteActiveOrder'))
        ).subscribe();
    }
    deleteOpenPosition(userId: string, accountNumber: string, orderId: string) :void{
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeleteOpenPosition?userId="
            + userId + "&accountNumber=" + accountNumber + "&orderId=" + orderId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeleteActiveOrder'))
        ).subscribe();
    }
    deleteRevPositionMap(userId: string, accountNumber: string) {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeleteRevPositionMap?userId="
            + userId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeleteRevPositionMap'))
        ).subscribe();
    }
    deleteRevPositionMapById(userId: string, accountNumber: string, orderId: string) {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeleteRevPositionMapById?userId="
            + userId + "&accountNumber=" + accountNumber + "&orderId" + orderId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeleteActiveOrder'))
        ).subscribe();
    }
    deleteOrderGroup(userId: string,accountNumber: string) {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeleteOrderGroup?userId="
            + userId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeleteOrderGroup'))
        ).subscribe();
    }
    deleteOrderGroupById(userId: string, accountNumber: string, orderId: string) {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeleteOrderGroupById?userId="
            + userId + "&accountNumber=" + accountNumber + "&orderId=" + orderId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeleteOrderGroupById'))
        ).subscribe();
    }
    deletePositionGroup(userId: string,accountNumber: string) {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeletePositionGroup?userId="
            + userId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeletePositionGroup'))
        ).subscribe();
    }
    deletePositionGroupById(userId: string, accountNumber: string, orderId: string) {
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
        this.http.get(this.baseUrl + "/optionapi/v1/OptionSimulator/DeletePositionGroupById?userId="
            + userId + "&accountNumber=" + accountNumber + "&orderId=" + orderId, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError('OptionSimulator/DeletePositionGroupById'))
        ).subscribe();
    }
}
