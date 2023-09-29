import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { ToastrModule } from 'ngx-toastr';
import { ClipboardModule } from 'ngx-clipboard';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

//import { TooltipModule } from 'ng2-tooltip-directive';

import { InitModule } from './init.module';

import { FirebaseModule } from './core/firebase.module';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpErrorHandler } from './common/http-error-handler.service';
import { MessageService } from './common/message.service';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent, MainComponent, AccountComponent, AnalyticsComponent } from './components/dashboard';
import { LoadingComponent } from './components/loading/loading.component';
import { HeaderComponent } from './components/header/header.component';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';
import { SideBarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScreenerComponent, AiSignalsComponent, TradeComponent, BackOfficeComponent, WatchListComponent } from './components/dashboard/main';
import { HeatMapComponent, PayoffPredictionComponent, PayoffVisualizerComponent, PathDiagramComponent } from './components/dashboard/analytics';
import { AccountSummaryComponent, ActivePositionsComponent, ActiveOrdersComponent, HistoricalTransactionsComponent } from './components/dashboard/main/trade';
import { HistoricalPositionComponent, HistoricalOrderComponent } from './components/dashboard/main/trade/historical-transactions';
import { OptionExpiryPipe } from './common/option-expiry.pipe';
import { CommonModule } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

import { MultiSelectDropdownComponent } from './components/multi-select-dropdown/multi-select-dropdown.component';
import { CustomDropdownComponent } from './custom-dropdown/custom-dropdown.component';
import { CustomEyeHoverComponent } from './components/custom-eye-hover/custom-eye-hover.component';
import { AnalysisFilterComponent } from './components/dashboard/main/analysis-filter/analysis-filter.component';
import { CustomAnalysisFilterMobileModalComponent } from './components/dashboard/main/custom-analysisFilter-mobileModal/custom-analysisFilter-mobileModal.component';
// initialize default firebase app with config
const angularFireImport = AngularFireModule.initializeApp(environment.firebaseConfig['DEFAULT'], 'DEFAULT');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoadingComponent,
    HeaderComponent,
    MobileMenuComponent,
    SideBarComponent,
    FooterComponent,
    DashboardComponent,
    MainComponent,
    ScreenerComponent,
    AiSignalsComponent,
    TradeComponent,
    WatchListComponent,
    BackOfficeComponent,
    AccountComponent,
    AnalyticsComponent,
    HeatMapComponent,
    PayoffPredictionComponent,
    PayoffVisualizerComponent,
    PathDiagramComponent,
    AccountSummaryComponent,
    ActivePositionsComponent,
    ActiveOrdersComponent,
    HistoricalTransactionsComponent,
    HistoricalPositionComponent,
    HistoricalOrderComponent,
    OptionExpiryPipe,
    MultiSelectDropdownComponent,
    CustomEyeHoverComponent,
    CustomDropdownComponent,
    AnalysisFilterComponent,
    CustomAnalysisFilterMobileModalComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    HighchartsChartModule,
    NgxSliderModule,
    NgSelectModule,
    ToastrModule.forRoot(),
    BrowserModule,
    CommonModule,
    //TooltipModule,
    ClipboardModule,
    InitModule,
    AppRoutingModule,
    NgbModule,
    RoundProgressModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    angularFireImport,
    FirebaseModule,
    MatButtonModule,
    MatMenuModule,
  ],
  providers: [
    HttpErrorHandler,
    MessageService
  ],
  bootstrap: [AppComponent],
  exports: [
    MultiSelectDropdownComponent,
  ]
})
export class AppModule { }