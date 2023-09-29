import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/app/common/config.service'
import { catchError, map } from 'rxjs/operators';
import { HandleError, HttpErrorHandler } from 'src/app/common/http-error-handler.service';
import { PayoffWithIVolRequest } from 'src/app/interface/payoff-with-ivol-request';
import { PayoffWithTimeRequest } from 'src/app/interface/payoff-with-time-request';
import { PayoffProbabilityChartRequest } from 'src/app/interface/payoff-probability-chart-request';
import { PayoffProbabilityRequest } from 'src/app/interface/payoff-probability-request';
import { AnalysisEntry } from 'src/app/interface/analysis-entry';
import { HeatmapEntry } from 'src/app/interface/heatmap-entry';
import { PayoffTableEntry } from 'src/app/interface/payoff-table-entry';
import { PayoffVisualizerChartEntry } from 'src/app/interface/payoff-visualizer-chart';
import { AnalyzeModelValuation } from 'src/app/interface/AnalyzeModelValuation';
import { ComputeHeatmap } from 'src/app/interface/ComputeHeatmap';
import { ProbabilityPrediction } from 'src/app/interface/ProbabilityPrediction';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private baseUrl = '';
    private serverApiKey = '';
    private accessToken = '';
    private handleError: HandleError;
    constructor(private http: HttpClient, private configService: ConfigService,
        httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('AnalyticsService');
    }

    /** POST: getHeatmap */
    getHeatmap(requestObj: AnalysisEntry): Observable<HeatmapEntry[]> {
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
        return this.http.post<HeatmapEntry[]>(this.baseUrl + "/optionapi/v1/Analytics/GetHeatmap", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<HeatmapEntry[]>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }
    GetMetricsForAnalyzeModelValuation(requestObj: AnalysisEntry): Observable<AnalyzeModelValuation> {
        // console.log(requestObj,"analytic.services");
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
        return this.http.post<AnalyzeModelValuation>(this.baseUrl + "/optionapi/v1/Calculator/GetMetricsForAnalyzeModelValuation", requestObj, {
            headers: new HttpHeaders({  
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<AnalyzeModelValuation>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }
    ComputeHeatmap(requestObj: AnalysisEntry): Observable<ComputeHeatmap[]> {
        console.log(requestObj,"analytic.services12311111");
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
        return this.http.post<ComputeHeatmap[]>(this.baseUrl + "/optionapi/v1/Analytics/ComputeHeatmap", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',   
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<ComputeHeatmap[]>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }
    ComputeProbabilitySimulation(requestObj: AnalysisEntry): Observable<ProbabilityPrediction> {
        // console.log(requestObj,"prediction.services12311111");
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
        return this.http.post<ProbabilityPrediction>(this.baseUrl + "/optionapi/v1/Analytics/ComputeProbabilitySimulation", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',   
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<ProbabilityPrediction>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }
    GeneratePathDiagramChart(requestObj: AnalysisEntry): Observable<ProbabilityPrediction> {
        // console.log(requestObj,"path-diagram.services12311111");
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
        return this.http.post<ProbabilityPrediction>(this.baseUrl + "/optionapi/v1/Analytics/GeneratePathDiagramChart", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',   
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<ProbabilityPrediction>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }

    /** POST: getPayoffProbability */
    getPayoffProbability(requestObj: PayoffProbabilityRequest): Observable<PayoffTableEntry[]> {
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
        return this.http.post<PayoffTableEntry[]>(this.baseUrl + "/optionapi/v1/Analytics/GetPayoffProbability", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<PayoffTableEntry[]>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }

    /** GET: getOptionSnapshot */
    getPayoffProbabilityChart(requestObj: PayoffProbabilityChartRequest): void {
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
        this.http.post(this.baseUrl + "/optionapi/v1/Analytics/GetPayoffProbabilityChart", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }

    /** GET: getPayoffWithTime */
    getPayoffWithTime(requestObj: PayoffWithTimeRequest): void {
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
        this.http.post(this.baseUrl + "/optionapi/v1/Analytics/GetPayoffWithTime", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }

    /** GET: getPayoffWithIV */
    getPayoffWithIV(requestObj: PayoffWithIVolRequest): void {
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
        this.http.post(this.baseUrl + "/optionapi/v1/Analytics/GetPayoffWithIV", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        });
    }


  /** GET: Generate Payoff VisualizerChart */
      generatePayoffVisualizerChart(requestObj: AnalysisEntry): Observable<PayoffVisualizerChartEntry[]> {
        // console.log(requestObj,"analytic.services123455555");
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
        return this.http.post<PayoffVisualizerChartEntry[]>(this.baseUrl + "/optionapi/v1/Analytics/GeneratePayoffVisualizerChart", requestObj, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                //'ApiKey': this.serverApiKey,
                'Authorization': 'Bearer ' + this.accessToken
            })
        }).pipe(
            catchError(this.handleError<PayoffVisualizerChartEntry[]>('FutuOmsHistorical/GetHistoricalPositions'))
        );
    }

}
