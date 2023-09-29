import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import { ConfigService } from './config.service';


export interface MarketDataHub {
    type: string;
    payload: any;
}


@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private apiUrl = '';
    private accessToken = '';
    private allHubs: { [id: string]: signalR.HubConnection } = {};
    private markets = ["US", "SG", "HK", "CHN"];
    subscribedCallbacks: any[] = [];

    constructor(private configService: ConfigService) { }

    startConnection = () => {
        let config = this.configService.readConfig();
        if (config) {
            this.apiUrl = config.apiUrl;
        }
        let userCredentialString = localStorage.getItem('user-credential');
        if (userCredentialString) {
            var userCredential = JSON.parse(userCredentialString);
            this.accessToken = userCredential.AccessToken;
        }

        var realTimeHub = new signalR.HubConnectionBuilder()
            .withUrl(this.apiUrl + "/qbabasignalr", { accessTokenFactory: () => this.accessToken })
            .withAutomaticReconnect()
            .build();

        for (const market of this.markets) {
            this.allHubs[market] = realTimeHub;
        }

        realTimeHub.start()
            .then(() => console.log('SignalR Connection Started'))
            .catch(err => console.log('Error while starting signalR connection: ' + err))
    }

    stopConnection = () => {
        for (const market of this.markets) {
            const hub = this.allHubs[market];
            hub.stop();
        }

        this.subscribedCallbacks = [];
        this.allHubs = {};
    }

    subscribeToMarketData = (productIds: number[], market: string, onMarketDataUpdated: any) => {
        const hubProxy = this.allHubs[market];

        if (onMarketDataUpdated !== null) {
            this._registerCallbackToHub(hubProxy, onMarketDataUpdated);
        }

        hubProxy.invoke('SubscribeMarketDataMultiple', productIds);
        console.log('Invoke SubscribeMarketDataMultiple');
    }

    unsubscribeMarketData = (productIds: number[], market: string) => {
        const hubProxy = this.allHubs[market];
        hubProxy.invoke('UnsubscribeMarketDataMultiple', productIds);
        console.log('Invoke UnsubscribeMarketDataMultiple');
    }

    private _registerCallbackToHub(hub: signalR.HubConnection, callback: any) {
        const index = this.subscribedCallbacks.findIndex(a => a === callback);
        if (index === -1) {
            hub.on('QuoteUpdated', callback);
            hub.on('LastMarketDataUpdated', callback);
            this.subscribedCallbacks.push(callback);
        }
    }
}