import { Component, OnInit, Input, HostListener, ViewEncapsulation, ElementRef, ViewChild, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, AbstractControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, delay, switchMap, tap, catchError, map, share, take, filter, distinctUntilChanged } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { OptionsStrategy } from 'src/app/interface/options-strategy';
import { IvPrediction } from 'src/app/interface/iv-prediction';
import { StockPricePrediction } from 'src/app/interface/stock-price-prediction';
import { ScreenerResult } from 'src/app/interface/options-screener-result';
import { OrderType } from 'src/app/interface/order-type';
import { UnitType } from 'src/app/interface/unit-type';
import { OptionSnapshot } from 'src/app/interface/option-snapshot';
import { PredefinedScreenerRequest } from 'src/app/interface/predefined-screener-request';
import { ExpiryDatesSelection } from 'src/app/interface/expiry-dates-selection';
import { ScreenerService } from './screener.service';
import { TradeService } from 'src/app/_service/trade.service';
import { CalculatorService } from 'src/app/_service/calculator.service';
import { OptionsService } from 'src/app/_service/options.service';
import { ConfigService } from 'src/app/common/config.service'
import * as moment from 'moment';
import { Observable, Subject, EMPTY, concat, of } from 'rxjs';
import { MarketData } from 'src/app/interface/market-data';
import { ProductService } from 'src/app/_service/product.service';
import { UtilityService } from 'src/app/_service/utility.service';
import { OptionsParameter } from 'src/app/interface/options-parameter';
import { Product } from 'src/app/interface/product';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';
import { StrategyExpiryParameter } from 'src/app/interface/strategy-expiry-parameter';
import { Options } from '@angular-slider/ngx-slider';
import { Howl, Howler } from 'howler';
import { ContractOptionLeg } from 'src/app/interface/contract-option-leg';
import { TradeIdeaScreenerResult } from 'src/app/interface/tradeidea-screener-result';
import { ExpiryDate } from 'src/app/interface/expiry-date';
import { StockUniverseType } from 'src/app/interface/stock-universeType';
import { stockUniverse } from 'src/app/interface/stockUniverse';
import { GetScreenerDataRequest } from '../../../../interface/screener-table-data'
import { GetScreenerDataResult } from 'src/app/interface/options-screener-result';

import { AnalysisFilterComponent } from '../analysis-filter/analysis-filter.component';
import { AnalysisFilter } from 'src/app/interface/analysis-filter';
//import AnalysisFilter Components

declare var $: any;

@Component({
  selector: 'ow-main-screener-tab',
  templateUrl: './screener.component.html',
  styleUrls: ['./screener.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ScreenerComponent implements OnInit, AfterViewChecked {

  @Input() currentTab: string = '';
  @Input() currentTradeTab: string = 'by-product';
  @Input() currentProductListTab: string = 'product-list-option';

  @Output() redirectToSubTab = new EventEmitter<{ tabName: string, subTabName: string }>();

  ButterflyLegOptions: Options = {
    floor: -100,
    ceil: 100,
    step: 1,
    minLimit: -100,
    maxLimit: 100,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  };

  disableButton: boolean = false;
  moreFilterClicked: boolean = false;
  SelectedAnalysisFilterList: AnalysisFilter[];

  ////////////////////////////////////////////////

  // Get ScreenerData Variables Start
  GetScreenerDataResult: GetScreenerDataResult;
  ScreenerResult: ScreenerResult;
  TradeIdeaResult: TradeIdeaScreenerResult;
  
  SelectedStrategy: OptionsStrategy;
  SelectedIVPrediction: IvPrediction;
  SelectedStockUniverseType: StockUniverseType;
  SelectedStockPricePrediction: StockPricePrediction;
  SelectedExpiryDate: ExpiryDate;
  
  StockUniverseTypeList: StockUniverseType[];
  StrategyList: OptionsStrategy[];
  IVPredictionList: IvPrediction[];
  StockPredictionList: StockPricePrediction[];
  
  ExpiryDateList: ExpiryDate[];

  selectedColumnList:any[];

  hoveredData: any;

  CurrentPage: number;
  TotalPage: number;
  ItemPerPage: number;
  IsFirstPage: boolean;
  IsLastPage: boolean;
  Pages: number[];

  // Order pop-up
  OptionExpiryDates$: Observable<ExpiryDatesSelection>;
  SelectedOptionExpiryDate: string;

  StockOrderForm: FormGroup;
  ConfirmedStockOrder: any;
  OptionOrderForm: FormGroup;
  stockDataFilterForm: FormGroup;
  ConfirmedOptionOrder: any;
  StockOrderTypeList: OrderType[];
  StockUnitTypeList: UnitType[];
  StockData$: Observable<MarketData>;
  OptionSnapshot$: Observable<OptionSnapshot[]>;

  SelectedProduct?: Product;
  Products$: Observable<Product[]>;
  ProductInput$: Subject<string>;
  ProductSearchLoading: boolean;

  SelectedOptionContract: string;
  OptionContracts$: Observable<Product[]>;
  OptionContractInput$: Subject<string>;
  OptionContractSearchLoading: boolean;
  selectedType: any = 'All';
  OptionSnapshotData: any = [];
  OptionSnapshotDataClone: any = [];

  @ViewChild('table4ScrollElement') private table4Scroll: ElementRef;
  @ViewChild('table1ScrollElement') private table1Scroll: ElementRef;
  @ViewChild('table2ScrollElement') private table2Scroll: ElementRef;
  @ViewChild('table3ScrollElement') private table3Scroll: ElementRef;
  dynamicStyleTable4: any = { "margin-top": "0" };
  dynamicStyleTable1: any = { "margin-top": "0" };
  dynamicStyleTable2: any = { "margin-top": "0" };
  dynamicStyleTable3: any = { "margin-top": "0" };
  OptionTable4Classes: any = 'outer-side OptionTable4 d-none';
  OptionTable1Classes: any = 'outer-body OptionTable1 width1 width2';
  OptionTable2Classes: any = 'outer-side OptionTable2';
  OptionTable3Classes: any = 'outer-body OptionTable3 width1 width2';

  // By strategy pop-up
  PlaceOrderStrategyList: OptionsStrategy[];
  ByStrategyForm: FormGroup;
  OptionParameterList: OptionsParameter[];
  ExpiryParameterList: StrategyExpiryParameter[];
  CalendarSpreadExpiryParameterList: StrategyExpiryParameter[];
  ConfirmedStrategyOrder: any;

  isLoading: Boolean = false;
  isLoadingScreenerResult: Boolean = false;
  isLoadingTradeIdeaResult: Boolean = false;
  isLoadingStrategyContractResult: Boolean = false;
  screenerOptions: any = 'Optimal_Strategy';

  // Post Order Confirmation Pop-Up
  OrderSuccessParameter: any;
  OrderRejectedParameter: any;
  StrategyOrderSuccessParameter: any;
  StrategyOrderRejectedParameter: any;

  //calculator
  MaxProfitLoss$: Observable<any>;
  CalculatorFormGroup: FormGroup;
  ProfitLossResult : number;

  AvailableBrokerAccounts = [] as any;

  currentSortedColumn = {
    name: 'Symbol',
    type: 'Asc'
  }

  callTableColumns: any = [];
  callTableColumnsDefault: any = [];
  callTableColumnsReverse: any = [];
  putTableColumns: any = [];

  placeOrderColumns: any;

  placeOrderLastTradedPrice: any = 0;


  //Custom filter tab vars
  stockUniverseList: stockUniverse[];
  selectedStockUniverseList: stockUniverse[];
  selectedStockUniverse: stockUniverse;

  meanIVList: any = [];
  columnList: any = [];

  selectedMeanIV: any = '';
  meanIVShareFilterCheckedArrayList: any = [];

  columnShareFilterCheckedArrayList: any = [];

  breakEvenDistanceList: any = [];
  otmDistanceList: any = [];
  
  selectedbreakEvenDistance: any = '';
  selectedotmDistance: any = '';

  PutCallRatioList: any = [];
  selectedPutCallRatio: any = '';

  optionInterestList: any = [];
  selectedOptionInterest: any = '';

  customTabAppliedFilterCount: any = 0;

  unusualSurgeofOptionVolume: boolean = false;

  selectedNumbers:any;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AngularFireAuth,
    private screenerService: ScreenerService,
    private tradeService: TradeService,
    private calculatorService: CalculatorService,
    private optionsService: OptionsService,
    private productService: ProductService,
    private utilityService: UtilityService,
    private configService: ConfigService
    ) {
   
    this.placeOrderColumns = [];

    this.callTableColumns = [
      { key: 'BidVolume', label: 'Bid Vol.' },
      { key: 'Bid', label: 'Bid' },
      { key: 'Ask', label: 'Ask' },
      { key: 'AskVolume', label: 'Ask Vol.' },
      { key: 'Last', label: 'Last' },
      { key: 'PctChange', label: 'Change %' },
      { key: 'BreakEvenPct', label: 'Break Even %' },
      { key: 'DailyVol', label: 'Daily Vol.' },
      { key: 'OpenInt', label: 'OpenInt' },
      { key: 'OtmProbabilityPct', label: 'Otm Pro.' },
      { key: 'IVol', label: 'IVol' },
      { key: 'Delta', label: 'Delta' },
      { key: 'Gamma', label: 'Gamma' },
      { key: 'Vega', label: 'Vega' },
      { key: 'Theta', label: 'Theta' }
    ];

    this.putTableColumns = [
      { key: 'BidVolume', label: 'Bid Vol.' },
      { key: 'Bid', label: 'Bid' },
      { key: 'Ask', label: 'Ask' },
      { key: 'AskVolume', label: 'Ask Vol.' },
      { key: 'Last', label: 'Last' },
      { key: 'PctChange', label: 'Change %' },
      { key: 'BreakEvenPct', label: 'Break Even %' },
      { key: 'DailyVol', label: 'Daily Vol.' },
      { key: 'OpenInt', label: 'OpenInt' },
      { key: 'OtmProbabilityPct', label: 'Otm Pro.' },
      { key: 'IVol', label: 'IVol' },
      { key: 'Delta', label: 'Delta' },
      { key: 'Gamma', label: 'Gamma' },
      { key: 'Vega', label: 'Vega' },
      { key: 'Theta', label: 'Theta' }
    ];

    let callColumnsArr = this.callTableColumns;
    this.callTableColumnsDefault = [... this.callTableColumns];
    this.callTableColumnsReverse = callColumnsArr.reverse();   

    this.table4Scroll = <any>'';
    this.table1Scroll = <any>'';
    this.table2Scroll = <any>'';
    this.table3Scroll = <any>'';

    this.SelectedProduct = undefined;
    this.ProductInput$ = new Subject<string>();
    this.ProductSearchLoading = false;
    this.Products$ = this.ProductInput$.pipe(
      filter(res => {
        return res !== null && res.length >= 1
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => this.ProductSearchLoading = true),
      switchMap(term => {
        return this.productService.searchProduct({
          Markets: ["US"],
          Keyword: term
        }).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.ProductSearchLoading = false)
        )
      }),
      share()
    );

    this.selectedNumbers = 0;
    this.SelectedOptionContract = "";
    this.OptionContractInput$ = new Subject<string>();
    this.OptionContractSearchLoading = false;
    this.OptionContracts$ = this.OptionContractInput$.pipe(
      filter(res => {
        return res !== null && res.length >= 1
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => this.OptionContractSearchLoading = true),
      switchMap(term => {
        return this.productService.searchProduct({
          Markets: ["US"],
          Keyword: term
        }).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.OptionContractSearchLoading = false)
        )
      })
    );

    this.SelectedAnalysisFilterList = []

    var stgList = utilityService.getStrategySelections();
    this.StrategyList = stgList;

    this.ExpiryDateList = this.getExpiryDate();

    this.IVPredictionList = utilityService.getIVPredictionSelections();
    
    this.StockPredictionList = utilityService.getStockPredictionSelections();

    this.StockUniverseTypeList = utilityService.getStockUniverseTypeList();

    this.SelectedStockUniverseType = this.StockUniverseTypeList[0]

    this.selectedColumnList = [];

    this.SelectedExpiryDate = this.ExpiryDateList[0];
    this.SelectedStrategy = this.StrategyList[0];
    this.SelectedIVPrediction = this.IVPredictionList[0];
    this.SelectedStockPricePrediction = this.StockPredictionList[0];

    this.GetScreenerDataResult = { Data:[], TotalData:0, TotalDataFiltered:0 }

    this.ScreenerResult = { Data: [], TotalData: 0, TotalDataFiltered: 0 };
    this.TradeIdeaResult = { Data: [], TotalData: 0, TotalDataFiltered: 0 };
    this.CurrentPage = 1;
    this.TotalPage = 1;
    this.ItemPerPage = 10;
    this.IsFirstPage = true;
    this.IsLastPage = true;
    this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
    this.StockOrderTypeList = this.utilityService.getOrderTypeSelections();
    this.StockUnitTypeList = this.utilityService.getUnitTypeSelections();
    this.StockOrderForm = this.formBuilder.group(
      {
        SelectedAccount: this.AvailableBrokerAccounts[0],
        SelectedStockAction: ["Buy"],
        StockQuantity: [1, [Validators.required]],
        SelectedStockOrderType: [this.StockOrderTypeList[0]],
        SelectedStockUnitType: [this.StockUnitTypeList[0]],
        StockLimitPrice: [100],
        StockStopPrice: [100],
        SelectedStockValidity: ["Day"]
      }
    );
    this.ConfirmedStockOrder = {
      product: {}
    };
    this.ConfirmedOptionOrder = {};

    this.OptionOrderForm = this.formBuilder.group(
      {
        SelectedAccount: this.AvailableBrokerAccounts[0],
        SelectedOptionAction: ["Buy"],
        OptionQuantity: [1, [Validators.required]],
        OptionLimitPrice: [1],
        OptionProduct: [""],
      }
    );

    this.OptionExpiryDates$ = EMPTY;
    this.SelectedOptionExpiryDate = "";
    this.StockData$ = EMPTY;
    this.OptionSnapshot$ = EMPTY;

    this.PlaceOrderStrategyList = stgList;
    this.OptionParameterList = this.utilityService.getOptionParameters(this.SelectedStrategy.Name);
    this.ExpiryParameterList = this.utilityService.getStrategyExpiryParameters();
    this.CalendarSpreadExpiryParameterList = this.utilityService.getCalendarSpreadExpiryParameters();
    this.ByStrategyForm = this.formBuilder.group(
      {
        SelectedAccount: this.AvailableBrokerAccounts[0],
        SelectedStrategy: [this.PlaceOrderStrategyList[0]],
        SelectedStock: [{}],
        SelectedExpiry: [this.ExpiryParameterList[0]],
        SelectedParameter: [this.OptionParameterList[0]],
        SelectedCalendarSpreadExpiry: [this.CalendarSpreadExpiryParameterList[0]],
        MaxLoss: [100],
        MaxGain: [300],
        Probability: [10],
        Amount: [2000],
        Legs: this.formBuilder.array(
          [this.formBuilder.group(
            { Action: "", OrderType: "", Direction: "", Rights: "", Quantity: "", StrikePrice: 0, Expiry: "", LimitPrice: 0, FairValue: 0 })]
        ),
        Action: 'Buy',
        Direction: 'Long',
        Quantity: 1,
        LimitPrice: 280
      }
    );
    this.CalculatorFormGroup = this.formBuilder.group({
      Strategy: [this.PlaceOrderStrategyList[0]],
      Symbol: new FormControl(""),
      Stock: { Direction: "", Quantity: 0 },
      NextState: this.formBuilder.group({
        Legs: this.formBuilder.array([
          this.formBuilder.group({
            LegId: 0,
            IV: 0
          })
        ]),
        StockPrice: 0,
        Period: 0,
        ATMMeanIV: 0
      }),
      CurrentState: this.formBuilder.group({
        Legs: this.formBuilder.array([
          this.formBuilder.group({
            LegId: 0,
            IV: 0
          })
        ]),
        StockPrice: 0,
        Period: 0,
        ATMMeanIV: 0,
        DividendYield: 0,
        InterestRate: 0,
        MeanSkew: 0,
        DaysToExpiry: 0
      })
    });
    this.ConfirmedStrategyOrder = {
      product: {},
      legs: []
    };
    this.ProfitLossResult = 0;
    this.MaxProfitLoss$ = EMPTY;

    // Post Order Confirmation Pop-Up
    this.OrderSuccessParameter = {
      Action: "",
      Quantity: 0,
      Symbol: "",
      OrderType: ""
    };
    this.OrderRejectedParameter = {
      Action: "",
      Quantity: 0,
      Symbol: "",
      OrderType: "",
      RejectReason: ""
    };
    this.StrategyOrderSuccessParameter = {
      Strategy: "",
      Underlying: ""
    };
    this.StrategyOrderRejectedParameter = {
      Strategy: "",
      Underlying: "",
      RejectReason: ""
    };

    this.stockDataFilterForm = this.formBuilder.group(
      {
        volume_grater_then: [""],
        volume_less_then: [""],
        delta_grater_then: [""],
        delta_less_then: [""],
        open_interest_grater_then: [""],
        open_interest_less_then: [""]
      }
    );


    //Custom filter tab vars
    this.stockUniverseList = utilityService.getStockUniverseList();
    this.selectedStockUniverseList = [{id:1,name:'US', value:'US'}];
    this.selectedStockUniverse = this.selectedStockUniverseList[0];

    this.meanIVList = this.getMeanIVData();

    // debugger
    this.columnList = [
      // {name: 'Select Columns', id:0},
      {name:'Underlying', checked:false, },
      {name:'Name', checked:false, },
      {name:'Option Contracts', checked:false, },
      {name:'Breakeven Price 1', checked:false,  },
      {name:'Breakeven Price 2', checked:false,  },
      {name:'Max Loss', checked:false,  },
      {name:'Max Profit', checked:false,  },
      {name:'Max Profit To Loss', checked:false,  },
      {name:'NetPremium', checked:false,  },
      {name:'NetPremium To Max Loss', checked:false,  },
      {name:'Risk Neutral WinProbability', checked:false, },
      {name:'Delta', checked:false, },
      {name:'Gamma', checked:false, },
      {name:'HV', checked:false, },
      {name:'IV', checked:false, },
      {name:'IV Change', checked:false, },
      {name:'Underlying Price', checked:false, },
      {name:'HV Prediction', checked:false,  },
      {name:'IV Prediction', checked:false,  },
      {name:'Behavior Prediction', checked:false,  },
      {name:'Sentiment Prediction', checked:false,  },
    ];

    this.breakEvenDistanceList = this.getBreakEvenDistance();
    this.otmDistanceList = this.getOtmDistance();


    this.selectedbreakEvenDistance = this.breakEvenDistanceList[0];
    this.selectedotmDistance = this.otmDistanceList[0];
    
    this.PutCallRatioList= this.getPutCallRatioData();
    this.selectedbreakEvenDistance = this.breakEvenDistanceList[0];

    this.optionInterestList = this.getOptionInterestData();
    this.selectedOptionInterest = this.optionInterestList[0];

    //Analysis Filter -> Fundamental -> Categorisation
    // this.getSectorSelections();
    // this.getIndustrySelections();

  }

  @HostListener('window:scroll', ['$event']) scrollTable4Handler($event: any) {
    let table4ScrollTop = this.table4Scroll.nativeElement.scrollTop;
    //let table1ScrollTop = this.table1Scroll.nativeElement.scrollTop;
    //let table2ScrollTop = this.table2Scroll.nativeElement.scrollTop;
    //let table3ScrollTop = this.table3Scroll.nativeElement.scrollTop;

    //this.dynamicStyleTable4 = {'margin-top': '-'+table4ScrollTop+'px'};
    ////this.dynamicStyleTable1 = {'margin-top': '-'+table4ScrollTop+'px'};
    //this.dynamicStyleTable2 = {'margin-top': '-'+table4ScrollTop+'px'};
    //this.dynamicStyleTable3 = {'margin-top': '-'+table4ScrollTop+'px'};

    //this.table4Scroll.nativeElement.scrollTop = table3ScrollTop;
    this.table1Scroll.nativeElement.scrollTop = table4ScrollTop;
    //this.table2Scroll.nativeElement.scrollTop = table3ScrollTop;
    //this.table3Scroll.nativeElement.scrollTop = table3ScrollTop;
  }

  @HostListener('window:scroll', ['$event']) scrollTable1Handler($event: any) {
    //let table4ScrollTop = this.table4Scroll.nativeElement.scrollTop;
    let table1ScrollTop = this.table1Scroll.nativeElement.scrollTop;
    //let table2ScrollTop = this.table2Scroll.nativeElement.scrollTop;
    //let table3ScrollTop = this.table3Scroll.nativeElement.scrollTop;

    ////this.dynamicStyleTable4 = {'margin-top': '-'+table1ScrollTop+'px'};
    //this.dynamicStyleTable1 = {'margin-top': '-'+table1ScrollTop+'px'};
    ////this.dynamicStyleTable2 = {'margin-top': '-'+table1ScrollTop+'px'};
    ////this.dynamicStyleTable3 = {'margin-top': '-'+table1ScrollTop+'px'};

    if (this.selectedType == 'Call') {
      this.table4Scroll.nativeElement.scrollTop = table1ScrollTop;
    }
    //this.table1Scroll.nativeElement.scrollTop = table1ScrollTop;
    this.table2Scroll.nativeElement.scrollTop = table1ScrollTop;
    this.table3Scroll.nativeElement.scrollTop = table1ScrollTop;
  }
  @HostListener('window:scroll', ['$event']) scrollTable2Handler($event: any) {
    //let table4ScrollTop = this.table4Scroll.nativeElement.scrollTop;
    //let table1ScrollTop = this.table1Scroll.nativeElement.scrollTop;
    let table2ScrollTop = this.table2Scroll.nativeElement.scrollTop;
    //let table3ScrollTop = this.table3Scroll.nativeElement.scrollTop;

    //this.dynamicStyleTable4 = {'margin-top': '-'+table2ScrollTop+'px'};
    ////this.dynamicStyleTable1 = {'margin-top': '-'+table2ScrollTop+'px'};
    //this.dynamicStyleTable2 = {'margin-top': '-'+table2ScrollTop+'px'};
    ////this.dynamicStyleTable3 = {'margin-top': '-'+table2ScrollTop+'px'};

    //this.table4Scroll.nativeElement.scrollTop = table2ScrollTop;
    this.table1Scroll.nativeElement.scrollTop = table2ScrollTop;
    //this.table2Scroll.nativeElement.scrollTop = table2ScrollTop;
    this.table3Scroll.nativeElement.scrollTop = table2ScrollTop;
  }
  @HostListener('window:scroll', ['$event']) scrollTable3Handler($event: any) {
    //let table4ScrollTop = this.table4Scroll.nativeElement.scrollTop;
    //let table1ScrollTop = this.table1Scroll.nativeElement.scrollTop;
    //let table2ScrollTop = this.table2Scroll.nativeElement.scrollTop;
    let table3ScrollTop = this.table3Scroll.nativeElement.scrollTop;

    //this.dynamicStyleTable4 = {'margin-top': '-'+table3ScrollTop+'px'};
    ////this.dynamicStyleTable1 = {'margin-top': '-'+table3ScrollTop+'px'};
    ////this.dynamicStyleTable2 = {'margin-top': '-'+table3ScrollTop+'px'};
    //this.dynamicStyleTable3 = {'margin-top': '-'+table3ScrollTop+'px'};

    //this.table4Scroll.nativeElement.scrollTop = table3ScrollTop;
    this.table1Scroll.nativeElement.scrollTop = table3ScrollTop;
    this.table2Scroll.nativeElement.scrollTop = table3ScrollTop;
    //this.table3Scroll.nativeElement.scrollTop = table3ScrollTop;
  }

  // getSectorSelections(){
  //   this.screenerService.getSectorSelections().subscribe(result => {
  //     if (result && result.Data) {
  //       this.analysisFilterFundamental.categorisation.sector.value = result.Data.map(({SectorId, SectorName: name})=>({SectorId, name, checked: false}));
  //     }
  //   });
  // }
  // getIndustrySelections(){
  //   this.screenerService.getIndustrySelections().subscribe(result => {
  //     if (result && result.Data) {
  //       this.analysisFilterFundamental.categorisation.industry.value = result.Data.map(({IndustryId, IndustryName: name})=>({IndustryId, name, checked: false}));
  //     }
  //   });
  // }

  playSound(audio: any){
    var sound = new Howl({
      src: [audio],
      html5: true
    });
    sound.play();
  }

  seeMyOrders(){
    $('#OrderCreated').modal('hide');
    $('#OrderSuccess').modal('hide');
    this.redirectToSubTab.emit({tabName: "trade", subTabName: "active-orders"});
  }

  // setScreenerOptionType(optionType: string): void {
  //   this.currentSortedColumn = {
  //     name: 'Symbol',
  //     type: 'Asc'
  //   };
  //   this.screenerOptions = optionType;
  //   if (this.screenerOptions === 'Optimal_Strategy') {
  //     this.generateScreenerResult();        
  //   } else if (this.screenerOptions === 'Prediction') {
  //     this.generateScreenerResult();
  //   } else if (this.screenerOptions === 'All') {
  //     this.generateTradeIdeaResult();  
  //   }
  // }

  reloadOptionData() {
    if (this.SelectedProduct) {
      this.OptionSnapshotData = [];
      this.isLoading = true;
      var symbol = this.SelectedProduct.Symbol;

      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.StockData$.pipe(take(1)).subscribe(value => {
        // Last Traded Price required here to determine center point of option chain table
        this.placeOrderLastTradedPrice = value.LastTradedPrice;
        this.OptionSnapshot$ = this.optionsService.getOptionChain(symbol, this.SelectedOptionExpiryDate).pipe(share());
        this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
          this.OptionOrderForm.patchValue({ OptionProduct: symbol+ this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice) });
          this.isLoading = false;
          this.OptionSnapshotData = value;
          this.OptionSnapshotDataClone = value;

          this.setTableColumnStatus(value);

          this.tableScrollByType(this.selectedType);

        });
      });
    }
  }

  reloadStrategyData() {
    if (this.SelectedProduct) {
      var symbol = this.SelectedProduct.Symbol;

      // Get data to show Underlying Price     
      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.isLoadingStrategyContractResult = true;
      this.StockData$.pipe(take(1)).subscribe(value => {
        var strategy = this.ByStrategyForm.get('SelectedStrategy')?.value;
        var amount = this.ByStrategyForm.get('Amount')?.value;

        if (strategy) {
          if (strategy.Name === 'DeltaNeutral') {
            this.ByStrategyForm.patchValue({ LimitPrice: value.LastTradedPrice });        
          }

          this.OptionParameterList = this.utilityService.getOptionParameters(strategy.Name);
          var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
          legs.clear();

          // if (this.screenerOptions === "Optimal_Strategy") {
          //  var data = this.screenerService.getAiContracts({
          //    Strategy: strategy.Name, 
          //    Symbol: symbol,
          //    Amount: amount
          //  });
          //  data.subscribe(value => {
          //    legs.clear();
          //    var group = value.Legs.map(x => this.formBuilder.group(
          //      {
          //        Action: x.Action,
          //        OrderType: x.OrderType,
          //        Direction: x.Direction,
          //        Rights: x.Rights,
          //        Quantity: x.Quantity,
          //        StrikePrice: x.StrikePrice,
          //        Expiry: x.Expiry,
          //        LimitPrice: x.LimitPrice,
          //        FairValue: x.FairValue
          //      }
          //    ));
          //    group.forEach(Leg => legs.push(Leg));
          //    this.isLoadingStrategyContractResult = false;
          //  });
          // }
          // else
          {
            var data2 = this.utilityService.getSampleContract(strategy.Name, symbol, value.LastTradedPrice);
            data2.subscribe(value => {
              legs.clear();
              var group = value.map(x => this.formBuilder.group(
                {
                  Action: x.Action,
                  OrderType: x.OrderType,
                  Direction: x.Direction,
                  Rights: x.Rights,
                  Quantity: x.Quantity,
                  StrikePrice: x.StrikePrice,
                  Expiry: x.Expiry,
                  LimitPrice: x.LimitPrice,
                  FairValue: x.FairValue
                }
              ));
              group.forEach(Leg => legs.push(Leg));
              this.isLoadingStrategyContractResult = false;
            });
          }
        }
      });
    }
  }

  ngAfterViewChecked() {
  }

  filterStockData(){

    this.OptionSnapshotData = this.OptionSnapshotDataClone;

    var volume_grater_then = this.stockDataFilterForm.get('volume_grater_then')?.value;
    var volume_less_then = this.stockDataFilterForm.get('volume_less_then')?.value;
    var delta_grater_then = this.stockDataFilterForm.get('delta_grater_then')?.value;
    var delta_less_then = this.stockDataFilterForm.get('delta_less_then')?.value;
    var open_interest_grater_then = this.stockDataFilterForm.get('open_interest_grater_then')?.value;
    var open_interest_less_then = this.stockDataFilterForm.get('open_interest_less_then')?.value;

    let OptionSnapshotDataVolume = [];
    let OptionSnapshotDataDelta = [];
    let OptionSnapshotDataOpenInt = [];
    if(volume_grater_then || volume_less_then){
      OptionSnapshotDataVolume = this.OptionSnapshotData.filter((item: any) => {
        if(volume_grater_then && !volume_less_then){
          return item.Call.BidVolume !== null && item.Call.BidVolume > parseInt(volume_grater_then);
        }
        if(!volume_grater_then && volume_less_then){
          return item.Call.BidVolume !== null && item.Call.BidVolume < parseInt(volume_less_then);
        }
        if(volume_grater_then && volume_less_then){
          return item.Call.BidVolume !== null && (item.Call.BidVolume > parseInt(volume_grater_then) && item.Call.BidVolume  < parseInt(volume_less_then));
        }
        return item;
      });
    }

    if(delta_grater_then || delta_less_then){
      OptionSnapshotDataDelta = this.OptionSnapshotData.filter((item: any) => {
        if(delta_grater_then && !delta_less_then){
          return item.Call.Delta !== null && item.Call.Delta > parseFloat(delta_grater_then);
        }
        if(!delta_grater_then && delta_less_then){
          return item.Call.Delta !== null && item.Call.Delta < parseFloat(delta_less_then);
        }
        if(delta_grater_then && delta_less_then){
          return item.Call.Delta !== null && (item.Call.Delta > parseFloat(delta_grater_then) && item.Call.Delta < parseFloat(delta_less_then));
        }
        return item;
      });
    }

    if(open_interest_grater_then || open_interest_less_then){
      OptionSnapshotDataOpenInt = this.OptionSnapshotData.filter((item: any) => {
        if(open_interest_grater_then && !open_interest_less_then){
          return item.Call.OpenInt !== null && item.Call.OpenInt > parseFloat(open_interest_grater_then);
        }
        if(!open_interest_grater_then && open_interest_less_then){
          return item.Call.OpenInt !== null && item.Call.OpenInt < parseFloat(open_interest_less_then);
        }
        if(open_interest_grater_then && open_interest_less_then){
          return item.Call.OpenInt !== null && (item.Call.OpenInt > parseFloat(open_interest_grater_then) && item.Call.OpenInt < parseFloat(open_interest_less_then));
        }
        return item;
      });
    }

    this.OptionSnapshotData = [].concat(OptionSnapshotDataVolume, OptionSnapshotDataDelta, OptionSnapshotDataOpenInt);
    if(!OptionSnapshotDataVolume.length && !OptionSnapshotDataDelta.length && !OptionSnapshotDataOpenInt.length){
      this.OptionSnapshotData = this.OptionSnapshotDataClone;
    }

    this.tableScrollByType(this.selectedType);
  }

  tableScrollByType(value: String){
    if (value == 'All') {
      this.callTableColumns = this.callTableColumnsReverse;
      setTimeout(() => {
        this.table1Scroll.nativeElement.scrollLeft += 9999999999*2;
        var callTableLength = $("#myTable1").find('tr.callBG').length;
        var putTableLength = $("#myTable3").find('tr.putBG').length;
        if(callTableLength > 5 && putTableLength > 0){
          var scrollTopVal = ($('#myTable1 tr.callBG').eq(callTableLength - 1).offset().top) - 588;
          this.table1Scroll.nativeElement.scrollTop += scrollTopVal;
          this.table2Scroll.nativeElement.scrollTop += scrollTopVal;
          this.table3Scroll.nativeElement.scrollTop += scrollTopVal;
        }
      }, 700);
    }

    if (value == 'Call') {
      this.callTableColumns = this.callTableColumnsDefault;
      setTimeout(() => {
        var callTableLength = $("#myTable1").find('tr.callBG').length;
        if(callTableLength > 5){
          var scrollTopVal = ($('#myTable1 tr.callBG').eq(callTableLength - 1).offset().top) - 588;
          this.table4Scroll.nativeElement.scrollTop += scrollTopVal;
          this.table1Scroll.nativeElement.scrollTop += scrollTopVal;
        }
      }, 700);
    }

    if (value == 'Put') {
      this.callTableColumns = this.callTableColumnsDefault;
      setTimeout(() => {
        var putTableLength = $("#myTable3").find('tr.putBG').length;
        if(putTableLength > 5){
          var scrollTopVal = ($('#myTable3 tr.putBG').eq(putTableLength - 1).offset().top) - 1730;
          this.table2Scroll.nativeElement.scrollTop += scrollTopVal;
          this.table3Scroll.nativeElement.scrollTop += scrollTopVal;
        }
      }, 700);
    }
  }

  setTableColumnStatus(value: any){
    var excludedColumns = ['Ticker'];
    this.callTableColumnsDefault.map((itemObj: any, key: number) =>{
      if(!excludedColumns.includes(itemObj.key)){
        let columnJSON = {
          "name": itemObj.label,
          "key": itemObj.key,
          "checked": false
        }
        if(itemObj.key == 'BidVolume' || itemObj.key == 'Bid' || itemObj.key == 'Ask' || itemObj.key == 'AskVolume' || itemObj.key == 'BreakEvenPct' || itemObj.key == 'PctChange'){
          columnJSON.checked = true;
        }
        this.placeOrderColumns.push(columnJSON);
      }
    })
  }

  getStatusByColumn(columnName: string){
    if(this.placeOrderColumns.length > 0){
      let filtered = this.placeOrderColumns.filter((row: any) => row.key == columnName);
      if(filtered.length > 0){
        return filtered[0].checked;
      }
      return false;
    }
  }

  checkValueByKey(snapshootOBJ: any, callTableColumn: any) {
    if (snapshootOBJ[callTableColumn.key] !== undefined && snapshootOBJ[callTableColumn.key] !== null && snapshootOBJ[callTableColumn.key] !== '') {
      switch (callTableColumn.key) {
        case "BreakEvenPct":
        case "IVol":
        case "PctChange":
        case "OtmProbabilityPct":
          return (parseFloat(snapshootOBJ[callTableColumn.key]) * 100).toFixed(2) + "%";
        case "Bid":
        case "Ask":
        case "Last":
          return parseFloat(snapshootOBJ[callTableColumn.key]).toFixed(2);
        case "Vega":
        case "Theta":
        case "Gamma":
        case "Delta":
          return parseFloat(snapshootOBJ[callTableColumn.key]).toFixed(3);
        default:
          return snapshootOBJ[callTableColumn.key];
      }
    }
    else {
      return "-";
    }
    return;
  }

  onTypeChanged(value: String) {
    this.selectedType = value;
    if (value === 'All') {
      this.OptionTable4Classes = 'outer-side OptionTable4 d-none';
      this.OptionTable1Classes = 'outer-body OptionTable1 width1 width2';
      this.OptionTable2Classes = 'outer-side OptionTable2';
      this.OptionTable3Classes = 'outer-body OptionTable3 width1 width2';
    }
    if (value === 'Call') {
      this.OptionTable4Classes = 'outer-side OptionTable4';
      this.OptionTable1Classes = 'outer-body OptionTable1 width1';
      this.OptionTable2Classes = 'outer-side OptionTable2 d-none';
      this.OptionTable3Classes = 'outer-body OptionTable3 width1 width2 d-none';
    }
    if (value === 'Put') {
      this.OptionTable4Classes = 'outer-side OptionTable4 d-none';
      this.OptionTable1Classes = 'outer-body OptionTable1 width1 width2 d-none';
      this.OptionTable2Classes = 'outer-side OptionTable2';
      this.OptionTable3Classes = 'outer-body OptionTable3 width1';
    }

    this.tableScrollByType(value);

  }

  ngAfterViewInit() {

  }

  searchProductTrackByFn(item: Product) {
    return item.ProductId;
  }

  searchOptionContractTrackByFn(item: Product) {
    return item.ProductId;
  }

  onProductSelected(item: Product) {
    this.isLoading = true;
    console.log("item.Symbol: ", item.Symbol);
    console.log("this.SelectedProduct: ", this.SelectedProduct);

    this.StockData$ = this.tradeService.getMarketData(item.ProductId).pipe(share());
    this.StockData$.pipe(take(1)).subscribe(value => {
      this.placeOrderLastTradedPrice = value.LastTradedPrice;
      console.log(JSON.stringify(value));
      this.StockOrderForm.patchValue({ StockLimitPrice: value.AskPrice });
      this.StockOrderForm.patchValue({ StockStopPrice: value.AskPrice });
    });

    if (this.currentProductListTab === 'product-list-option') {
      this.OptionSnapshotData = [];
      this.OptionExpiryDates$ = this.optionsService.getExpiryDates(item.Symbol).pipe(share());
      this.OptionExpiryDates$.pipe(take(1)).subscribe((value) => {
        // Last Traded Price required here to determine center point of option chain table
        this.SelectedOptionExpiryDate = value.DefaultExpiryDate;
        this.OptionSnapshot$ = this.optionsService.getOptionChain(item.Symbol, this.SelectedOptionExpiryDate).pipe(share());

        this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
          this.OptionOrderForm.patchValue({ OptionProduct: item.Symbol + this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice) });
          this.isLoading = false;
          this.OptionSnapshotData = value;
          this.OptionSnapshotDataClone = value;

          this.setTableColumnStatus(value);

          this.tableScrollByType(this.selectedType);
        });
      });
    }
  }

  onStrategyProductSelected(item: Product) {
    var strategy = this.ByStrategyForm.get('SelectedStrategy')?.value;

    this.ByStrategyForm.patchValue({ SelectedStock: this.SelectedProduct });
    this.StockData$ = this.tradeService.getMarketData(item.ProductId).pipe(share());
    this.isLoadingStrategyContractResult = true;
    this.StockData$.pipe(take(1)).subscribe(value => {
      if (strategy) {
        if (strategy.Name === 'DeltaNeutral') {
          this.ByStrategyForm.patchValue({ LimitPrice: value.LastTradedPrice });        
        }

        this.OptionParameterList = this.utilityService.getOptionParameters(strategy.Name);
        var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
        legs.clear()
        var data = this.utilityService.getSampleContract(strategy.Name, item.Symbol, value.LastTradedPrice);
        data.subscribe(value => {
          legs.clear();
          var group = value.map(x => this.formBuilder.group(
            {
              Action: x.Action,
              OrderType: x.OrderType,
              Direction: x.Direction,
              Rights: x.Rights,
              Quantity: x.Quantity,
              StrikePrice: x.StrikePrice,
              Expiry: x.Expiry,
              LimitPrice: x.LimitPrice,
              FairValue: x.FairValue
            }
          ));
          group.forEach(Leg => legs.push(Leg));
          this.isLoadingStrategyContractResult = false;
        });
      }
    });
  }

  onOptionContractSelected(item: Product) {
    console.log(item.Symbol);
    console.log(this.SelectedProduct);
  }

  extractContract(screenerData: any): string {
    const dataFromAPI = screenerData.OptionContracts;
    const contractParts  = dataFromAPI.split(' ');
    const contractIndex = contractParts.findIndex((part:any) => /^\d{4}-\d{2}-\d{2}$/.test(part));

    if (contractIndex !== -1) {
      const randomString = contractParts.slice(0, contractIndex).join(' ');
      return randomString;
    }

    return '';
  }

  extractDateAndValues(screenerData: any): string {
    const dataFromAPI = screenerData.OptionContracts;
    const dateAndValues = dataFromAPI.split(' ').slice(2).join(' ');
    return dateAndValues;
  }

  generateScreenerResult() {
    this.isLoadingScreenerResult = true;
    this.disableButton = true;
    setTimeout(() => {
      this.disableButton = false;
    }, 5000); 

    var requestObj: GetScreenerDataRequest = {
      SelectBy: this.SelectedStockUniverseType.value,
      DefaultUniverse: this.selectedStockUniverse.value,
      TimeToExpiry: this.SelectedExpiryDate.value,
      BreakevenDistance: this.selectedbreakEvenDistance.value,
      Strategy: this.SelectedStrategy.Display,
      OtmDistance: this.selectedotmDistance.value,
      Sort: this.currentSortedColumn.name,
      Order: this.currentSortedColumn.type,
      Offset: (this.CurrentPage - 1) * 10,
      Limit: 10
    }

    console.log("Generating screen result...", JSON.stringify(requestObj));
    this.screenerService.getScreenerData(requestObj).subscribe(result => {
      if (result && result.Data) {
        this.GetScreenerDataResult = result;
        console.log(this.GetScreenerDataResult)
        this.TotalPage = Math.floor(this.GetScreenerDataResult.TotalData / this.ItemPerPage) + 1;
        console.log(this.TotalPage)
        this.IsFirstPage = this.CurrentPage === 1;
        this.IsLastPage = this.CurrentPage === this.TotalPage;
        this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
      }
      this.isLoadingScreenerResult = false;
    });
  }

  generateTradeIdeaResult() {
    console.log("Generating trade idea result...");
    this.isLoadingTradeIdeaResult = true;
    var requestObj: PredefinedScreenerRequest = {
      search: "",
      sort: this.currentSortedColumn.name,
      order: this.currentSortedColumn.type,
      offset: (this.CurrentPage - 1) * 10,
      limit: 10
    }
    requestObj.prediction = {
      IVPrediction: this.SelectedIVPrediction.Name,
      StockPricePrediction: this.SelectedStockPricePrediction.Name
    };
    this.screenerService.getTradeIdeas(requestObj).subscribe(result => {
      console.log(result);
      if (result && result.Data) {
        this.TradeIdeaResult = result;

        this.TotalPage = Math.floor(this.TradeIdeaResult.TotalData / this.ItemPerPage);
        this.IsFirstPage = this.CurrentPage === 1;
        this.IsLastPage = this.CurrentPage === this.TotalPage;
        this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
      }
      this.isLoadingTradeIdeaResult = false;
    });
  }

  previousPage() {
    this.CurrentPage--;
    this.isLoadingScreenerResult = true;
    var requestObj: PredefinedScreenerRequest = {
      search: "",
      sort: this.currentSortedColumn.name,
      order: this.currentSortedColumn.type,
      offset: (this.CurrentPage - 1) * 10,
      limit: 10
    }
    if (this.screenerOptions === 'Optimal_Strategy') {
      requestObj.strategy = this.SelectedStrategy.Name;
    } else if (this.screenerOptions === 'Prediction') {
      requestObj.prediction = {
        IVPrediction: this.SelectedIVPrediction.Name,
        StockPricePrediction: this.SelectedStockPricePrediction.Name
      };
    }
    console.log("Scanning previous page...", JSON.stringify(requestObj));
    this.screenerService.getPredefinedScreening(requestObj).subscribe(result => {
      if (result && result.Data) {
        this.ScreenerResult = result;
        this.TotalPage = Math.floor(this.ScreenerResult.TotalData / this.ItemPerPage) + 1;
        this.IsFirstPage = this.CurrentPage === 1;
        this.IsLastPage = this.CurrentPage === this.TotalPage;
        this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
        this.isLoadingScreenerResult = false;
      }
    });

    console.log(this.TotalPage)
  }

  nextPage() {
    this.isLoadingScreenerResult = true;
    this.CurrentPage++;
    var requestObj: PredefinedScreenerRequest = {
      search: "",
      sort: this.currentSortedColumn.name,
      order: this.currentSortedColumn.type,
      offset: (this.CurrentPage - 1) * 10,
      limit: 10
    }
    if (this.screenerOptions === 'Optimal_Strategy') {
      requestObj.strategy = this.SelectedStrategy.Name;
    } else if (this.screenerOptions === 'Prediction') {
      requestObj.prediction = {
        IVPrediction: this.SelectedIVPrediction.Name,
        StockPricePrediction: this.SelectedStockPricePrediction.Name
      };
    }
    console.log("Scanning next page...", JSON.stringify(requestObj));
    this.screenerService.getPredefinedScreening(requestObj).subscribe(result => {
      if (result && result.Data) {
        this.ScreenerResult = result;
        this.TotalPage = Math.floor(this.ScreenerResult.TotalData / this.ItemPerPage) + 1;
        this.IsFirstPage = this.CurrentPage === 1;
        this.IsLastPage = this.CurrentPage === this.TotalPage;
        this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
        this.isLoadingScreenerResult = false;
      }
    });

    console.log(this.TotalPage)
  }

  goToPage(pageNum: number) {
    this.isLoadingScreenerResult = true;
    this.CurrentPage = pageNum;
    var requestObj: PredefinedScreenerRequest = {
      search: "",
      sort: this.currentSortedColumn.name,
      order: this.currentSortedColumn.type,
      offset: (this.CurrentPage - 1) * 10,
      limit: 10
    }
    if (this.screenerOptions === 'Optimal_Strategy') {
      requestObj.strategy = this.SelectedStrategy.Name;
    } else if (this.screenerOptions === 'Prediction') {
      requestObj.prediction = {
        IVPrediction: this.SelectedIVPrediction.Name,
        StockPricePrediction: this.SelectedStockPricePrediction.Name
      };
    }
    console.log("Scanning next page...", JSON.stringify(requestObj));
    this.screenerService.getPredefinedScreening(requestObj).subscribe(result => {
      if (result && result.Data) {
        this.ScreenerResult = result;
        this.TotalPage = Math.floor(this.ScreenerResult.TotalData / this.ItemPerPage) + 1;
        this.IsFirstPage = this.CurrentPage === 1;
        this.IsLastPage = this.CurrentPage === this.TotalPage;
        this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
        this.isLoadingScreenerResult = false;
      }
    });
    console.log(this.TotalPage)
  }

  submitOptionOrder(): void {
    var account = this.OptionOrderForm.get('SelectedAccount')?.value;
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;
    //var product = this.OptionOrderForm.get('OptionProduct')?.value;
    var quantity = this.OptionOrderForm.get('OptionQuantity')?.value;
    var limitPrice = this.OptionOrderForm.get('OptionLimitPrice')?.value;

    var requestObj = {
      account: account.id,
      action: action,
      symbol: this.SelectedOptionContract,
      quantity: quantity * 100,
      limitPrice: limitPrice,
      validity: "Day"
    }

    console.log("Submitting option order...", JSON.stringify(requestObj));
    this.ConfirmedOptionOrder = {
      account: account.id,
      broker: account.brokerType,
      action: requestObj.action,
      orderType: "Limit",
      quantity: quantity,
      limitPrice: requestObj.limitPrice,
      validity: "Day",
      unitType: "Lot",
      product: requestObj.symbol
    }
  }

  submitStockOrder(): void {
    var account = this.StockOrderForm.get('SelectedAccount')?.value;
    var action = this.StockOrderForm.get('SelectedStockAction')?.value;
    var orderType = this.StockOrderForm.get('SelectedStockOrderType')?.value;
    var quantity = this.StockOrderForm.get('StockQuantity')?.value;
    var unitType = this.StockOrderForm.get('SelectedStockUnitType')?.value;
    var validity = this.StockOrderForm.get('SelectedStockValidity')?.value;
    var limitPrice = this.StockOrderForm.get('StockLimitPrice')?.value;
    var stopPrice = this.StockOrderForm.get('StockStopPrice')?.value;

    var requestObj = {
      account: account.id,
      action: action,
      orderType: orderType.Name,
      quantity: quantity,
      limitPrice: 0,
      stopPrice: 0,
      validity: validity
    };
    if (orderType.Name === 'Limit') {
      requestObj.limitPrice = limitPrice;
    } else if (orderType.Name === 'Stop') {
      requestObj.stopPrice = stopPrice;
    }
    if (unitType.Name === 'Lot') {
      requestObj.quantity *= 100;
    } else if (unitType.Name === 'KLot') {
      requestObj.quantity *= 1000;
    }

    console.log("Submitting stock order...", JSON.stringify(requestObj));
    this.ConfirmedStockOrder = {
      account: account.id,
      broker: account.brokerType,
      action: requestObj.action,
      orderType: requestObj.orderType,
      quantity: quantity,
      limitPrice: requestObj.limitPrice,
      stopPrice: requestObj.stopPrice,
      validity: requestObj.validity,
      unitType: unitType.Name,
      product: this.SelectedProduct
    }
  }

  submitStrategyOrder(): void {
    var account = this.ByStrategyForm.get('SelectedAccount')?.value;
    var strategy = this.ByStrategyForm.get('SelectedStrategy')?.value;
    var action = this.ByStrategyForm.get('Action')?.value;
    var quantity = this.ByStrategyForm.get('Quantity')?.value;
    var limitPrice = this.ByStrategyForm.get('LimitPrice')?.value;
    var legs = this.ByStrategyForm.get('Legs')?.value;

    var requestObj = {
      account : account.id,
      strategy: strategy,
      action: action,
      direction: action === "Buy" ? "Long" : "Short",
      quantity: quantity,
      limitPrice: limitPrice,
      legs: legs
    };
    console.log("Submitting strategy order...", JSON.stringify(requestObj));
    this.ConfirmedStrategyOrder = {
      account: account.id,
      broker: account.brokerType,
      strategy: requestObj.strategy.Name,
      action: requestObj.action,
      direction: requestObj.direction,
      quantity: requestObj.quantity,
      limitPrice: requestObj.limitPrice,
      symbol: this.SelectedProduct?.Symbol,
      legs: legs
    };
  }

  confirmSendOptionOrder(): void {
    var account = this.OptionOrderForm.get('SelectedAccount')?.value;
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;
    //var product = this.OptionOrderForm.get('OptionProduct')?.value;
    var quantity = this.OptionOrderForm.get('OptionQuantity')?.value;
    var limitPrice = this.OptionOrderForm.get('OptionLimitPrice')?.value;

    var requestObj = {
      AccountId: account?.id,
      Broker: account?.brokerType,
      Action: action,
      Symbol: this.SelectedOptionContract,
      Quantity: quantity,
      LimitPrice: parseFloat(limitPrice),
      Validity: "Day",
      OrderType: "Limit",
      Underlying: this.SelectedProduct?.Symbol
    };

    console.log("Confirm send option order...", JSON.stringify(requestObj));
    this.tradeService.placeOptionOrder(requestObj).subscribe((result) => {
      console.log(JSON.stringify(result));
      if (result.status !== "REJECTED") {
        this.OrderSuccessParameter = {
          Action: action,
          Quantity: quantity,
          Symbol: this.SelectedOptionContract,
          OrderType: "Limit",
          LimitPrice: limitPrice
        };
        this.playSound("https://am708403.blob.core.windows.net/sounds/trading/feed.mp3");
        $('#OrderCreated').modal('show');
      } else {
        this.OrderRejectedParameter = {
          Action: action,
          Quantity: quantity,
          Symbol: this.SelectedOptionContract,
          OrderType: "Limit",
          LimitPrice: limitPrice,
          RejectReason: result.reason
        };
        $('#OrderRejected').modal('show');
      }
    });
  }

  confirmSendStockOrder(): void {
    var account = this.StockOrderForm.get('SelectedAccount')?.value;
    var action = this.StockOrderForm.get('SelectedStockAction')?.value;
    var orderType = this.StockOrderForm.get('SelectedStockOrderType')?.value;
    var quantity = this.StockOrderForm.get('StockQuantity')?.value;
    var unitType = this.StockOrderForm.get('SelectedStockUnitType')?.value;
    var validity = this.StockOrderForm.get('SelectedStockValidity')?.value;
    var limitPrice = this.StockOrderForm.get('StockLimitPrice')?.value;
    var stopPrice = this.StockOrderForm.get('StockStopPrice')?.value;

    var requestObj = {
      AccountId: account?.id,
      Broker: account?.brokerType,
      Action: action,
      Symbol: this.SelectedProduct?.Symbol,
      Quantity: quantity,
      Validity: validity,
      OrderType: orderType.Name,
      StopPrice: 0,
      LimitPrice: 0
    };
    if (orderType.Name === 'Limit') {
      requestObj.LimitPrice = parseFloat(limitPrice);
    } else if (orderType.Name === 'Stop') {
      requestObj.StopPrice = parseFloat(stopPrice);
    }
    if (unitType.Name === 'Lot') {
      requestObj.Quantity *= 100;
    } else if (unitType.Name === 'KLot') {
      requestObj.Quantity *= 1000;
    }

    console.log("Confirm send stock order...", JSON.stringify(requestObj));
    this.tradeService.placeStockOrder(requestObj).subscribe((result) => {
      console.log(JSON.stringify(result));
      if (result.status !== "REJECTED") {
        this.OrderSuccessParameter = {
          Action: action,
          Quantity: quantity,
          Symbol: this.SelectedProduct?.Symbol,
          OrderType: orderType.Name
        };
        if (orderType.Name === 'Limit') {
          this.OrderSuccessParameter.LimitPrice = limitPrice;
        } else if (orderType.Name === 'Stop') {
          this.OrderSuccessParameter.StopPrice = stopPrice;
        }
        this.playSound("https://am708403.blob.core.windows.net/sounds/trading/feed.mp3");
        $('#OrderCreated').modal('show');
      } else {
        this.OrderRejectedParameter = {
          Action: action,
          Quantity: quantity,
          Symbol: this.SelectedProduct?.Symbol,
          OrderType: orderType.Name,
          RejectReason: result.reason
        };
        if (orderType.Name === 'Limit') {
          this.OrderRejectedParameter.LimitPrice = limitPrice;
        } else if (orderType.Name === 'Stop') {
          this.OrderRejectedParameter.StopPrice = stopPrice;
        }
        $('#OrderRejected').modal('show');
      }
    });
  }

  confirmSendStrategyOrder(): void {
    var account = this.ByStrategyForm.get('SelectedAccount')?.value;
    var strategy = this.ByStrategyForm.get('SelectedStrategy')?.value;
    var action = this.ByStrategyForm.get('Action')?.value;
    var quantity = this.ByStrategyForm.get('Quantity')?.value;
    var limitPrice = this.ByStrategyForm.get('LimitPrice')?.value;
    var legs = this.ByStrategyForm.get('Legs')?.value;

    let requestObj = {
      AccountId: account.id,
      Broker: account?.brokerType,
      Strategy: strategy.Name,
      Action: action,
      Symbol: this.SelectedProduct?.Symbol,
      Quantity: quantity,
      LimitPrice: parseFloat(limitPrice),
      Validity: "Day",
      OrderType: "Limit",
      Legs: legs
    };

    console.log("Confirm send strategy order...", JSON.stringify(requestObj));
    this.tradeService.placeStrategyOrder(requestObj).subscribe((result : any) => {
      console.log(JSON.stringify(result));
      if (result.status !== "REJECTED") {
        this.StrategyOrderSuccessParameter = {
          Strategy: strategy.Name,
          Underlying: this.SelectedProduct?.Symbol
        };
        this.playSound("https://am708403.blob.core.windows.net/sounds/trading/feed.mp3");
        $('#OrderSuccess').modal('show');
      } else {
        this.StrategyOrderRejectedParameter = {
          Strategy: strategy.Name,
          Underlying: this.SelectedProduct?.Symbol,
          RejectReason: "Unknown"
        };
        $('#StrategyOrderRejected').modal('show');
      }
    });

    // if (strategy.Name == 'DeltaNeutral') {
    //   let requestObj = {
    //     strategy: strategy.Name,
    //     action: action,
    //     direction: action === "Buy" ? "Long" : "Short",
    //     quantity: quantity * 100,
    //     limitPrice: limitPrice,
    //     contract: this.ConfirmedStrategyOrder.symbol,
    //     symbol: this.ConfirmedStrategyOrder.symbol,
    //     type: "Limit",
    //     strikePrice: legs[0].StrikePrice,
    //     GUID: ""
    //   };

    //   console.log("Confirm send strategy order...", JSON.stringify(requestObj));
    //   this.tradeService.placeStockOrder(requestObj).subscribe();
    // }
    // for (let leg of legs) {
    //   let stringSP = leg.StrikePrice.toString().split('.');
    //   let strikePriceContract = stringSP[0].padStart(5, "0");

    //   if (stringSP[1])
    //     strikePriceContract = strikePriceContract.concat(stringSP[1].padEnd(3, "0"));
    //   else
    //     strikePriceContract = strikePriceContract.concat("000");

    //   let contract = this.ConfirmedStrategyOrder.symbol +
    //     new Date().toJSON().slice(0, 10).replace(/-/g, '') +
    //     'C' + strikePriceContract;
    //   let requestObj = {
    //     strategy: strategy.Name,
    //     action: action,
    //     direction: action === "Buy" ? "Long" : "Short",
    //     quantity: leg.Quantity * 100,
    //     limitPrice: leg.LimitPrice,
    //     contract: contract,
    //     symbol: this.ConfirmedStrategyOrder.symbol,
    //     type: "Limit",
    //     strikePrice: leg.StrikePrice,
    //     GUID: ""
    //   };

    //   console.log("Confirm send strategy order...", JSON.stringify(requestObj));
    //   this.tradeService.placeStockOrder(requestObj).subscribe();
    // }
  }

  increaseOptionLimitPrice(): void {
    var price = this.OptionOrderForm.get('OptionLimitPrice');
    var tickIncrement = this.utilityService.getOptionTickSize(price?.value, true);
    var newPrice = parseFloat((parseFloat(price?.value) + tickIncrement).toFixed(4));
    this.OptionOrderForm.patchValue({ OptionLimitPrice: newPrice });
  }

  decreaseOptionLimitPrice(): void {
    var price = this.OptionOrderForm.get('OptionLimitPrice');
    var tickIncrement = this.utilityService.getOptionTickSize(price?.value, false);
    var newPrice = parseFloat((parseFloat(price?.value) - tickIncrement).toFixed(4));
    this.OptionOrderForm.patchValue({ OptionLimitPrice: newPrice });
  }

  increaseStockLimitPrice(): void {
    var price = this.StockOrderForm.get('StockLimitPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, true);
    var newPrice = parseFloat((parseFloat(price?.value) + tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({ StockLimitPrice: newPrice });
  }

  decreaseStockLimitPrice(): void {
    var price = this.StockOrderForm.get('StockLimitPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, false);
    var newPrice = parseFloat((parseFloat(price?.value) - tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({ StockLimitPrice: newPrice });
  }

  increaseStockStopPrice(): void {
    var price = this.StockOrderForm.get('StockStopPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, true);
    var newPrice = parseFloat((parseFloat(price?.value) + tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({ StockStopPrice: newPrice });
  }

  decreaseStockStopPrice(): void {
    var price = this.StockOrderForm.get('StockStopPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, false);
    var newPrice = parseFloat((parseFloat(price?.value) - tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({ StockStopPrice: newPrice });
  }

  switchToOptionTab(): void {
    console.log("Switch to option tab");
    this.currentProductListTab = 'product-list-option';
    if (this.SelectedProduct) {
      this.OptionSnapshotData = [];
      this.isLoading = true;
      var symbol = this.SelectedProduct.Symbol;

      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.StockData$.pipe(take(1)).subscribe(value => {
        // Last Traded Price required here to determine center point of option chain table
        this.placeOrderLastTradedPrice = value.LastTradedPrice;
        this.OptionExpiryDates$ = this.optionsService.getExpiryDates(symbol).pipe(share());
        this.OptionExpiryDates$.pipe(take(1)).subscribe((value) => {
          this.SelectedOptionExpiryDate = value.DefaultExpiryDate;
          this.OptionSnapshot$ = this.optionsService.getOptionChain(symbol, this.SelectedOptionExpiryDate).pipe(share());

          this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
            this.OptionOrderForm.patchValue({ OptionProduct: symbol+ this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice) });
            this.isLoading = false;
            this.OptionSnapshotData = value;
            this.OptionSnapshotDataClone = value;

            this.setTableColumnStatus(value);

            this.tableScrollByType(this.selectedType);

          });
        });
      });
    }
  }

  filterColumns(index: number){
    this.placeOrderColumns[index].checked = !this.placeOrderColumns[index].checked;
    setTimeout(() => this.table1Scroll.nativeElement.scrollLeft += 9999999999*2, 1000);
    setTimeout(() => this.table3Scroll.nativeElement.scrollLeft += 0, 1000);
  }

  switchToStockTab(): void {
    console.log("Switch to stock tab");
    this.currentProductListTab = 'product-list-stock';
    if (this.SelectedProduct) {
      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.StockData$.pipe(take(1)).subscribe(value => {
        this.StockOrderForm.patchValue({ StockLimitPrice: value.AskPrice });
        this.StockOrderForm.patchValue({ StockStopPrice: value.AskPrice });
      });
    }
  }

  switchToProductListTab(): void {
    console.log("Switch to product list tab");
    this.currentTradeTab = 'by-product';
    this.switchToOptionTab();
  }

  switchToStrategyTab(): void {
    console.log("Switch to strategy tab");
    this.currentTradeTab = 'by-strategy';
    if (this.SelectedProduct) {
      var symbol = this.SelectedProduct.Symbol;

      // Get data to show Underlying Price
      this.isLoadingStrategyContractResult = true;
      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.StockData$.pipe(take(1)).subscribe(value => {
        var strategy = this.ByStrategyForm.get('SelectedStrategy')?.value;
        var amount = this.ByStrategyForm.get('Amount')?.value;

        if (strategy) {
          if (strategy.Name === 'DeltaNeutral') {
            this.ByStrategyForm.patchValue({ LimitPrice: value.LastTradedPrice });        
          }
          
          this.OptionParameterList = this.utilityService.getOptionParameters(strategy.Name);
          var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
          legs.clear();

          // if (this.screenerOptions === "Optimal_Strategy") {
          //   var data = this.screenerService.getAiContracts({
          //     Strategy: strategy.Name, 
          //     Symbol: symbol,
          //     Amount: amount
          //   });
          //   data.subscribe(value => {
          //     legs.clear();
          //     var group = value.Legs.map(x => this.formBuilder.group(
          //       {
          //         Action: x.Action,
          //         OrderType: x.OrderType,
          //         Direction: x.Direction,
          //         Rights: x.Rights,
          //         Quantity: x.Quantity,
          //         StrikePrice: x.StrikePrice,
          //         Expiry: x.Expiry,
          //         LimitPrice: x.LimitPrice,
          //         FairValue: x.FairValue
          //       }
          //     ));
          //     group.forEach(Leg => legs.push(Leg));
          //     this.isLoadingStrategyContractResult = false;
          //   });
          // }
          // else 
          {
            var data2 = this.utilityService.getSampleContract(strategy.Name, symbol, value.LastTradedPrice);
            data2.subscribe(value => {
              legs.clear();
              var group = value.map(x => this.formBuilder.group(
                {
                  Action: x.Action,
                  OrderType: x.OrderType,
                  Direction: x.Direction,
                  Rights: x.Rights,
                  Quantity: x.Quantity,
                  StrikePrice: x.StrikePrice,
                  Expiry: x.Expiry,
                  LimitPrice: x.LimitPrice,
                  FairValue: x.FairValue
                }
              ));
              group.forEach(Leg => legs.push(Leg));
              this.isLoadingStrategyContractResult = false;
            });
          }
        }
      });
    }
  }

  // loadOptionModal(productId: number, symbol: string): void {
  //   console.log("Place order button clicked from screener entry");
  //   this.productService.getProductFromSymbol(symbol).pipe(take(1)).subscribe(result => {
  //     this.SelectedProduct = result.Data;
  //     if (this.screenerOptions === "Optimal_Strategy") {
  //       this.ByStrategyForm.patchValue({ SelectedStrategy: this.SelectedStrategy });
  //       this.ByStrategyForm.patchValue({ SelectedStock: this.SelectedProduct });
  //     } else {
  //       this.ByStrategyForm.patchValue({ SelectedStrategy: undefined });
  //     }
  //     this.switchToStrategyTab();
  //   });
  // }

  loadOptionModal(symbol: string, strategy: string): void {
    
    console.log("Place order button clicked from screener entry");
    this.ByStrategyForm.value.SelectedStrategy = ''
    // get strategy array
    const strategySelections = this.utilityService.getStrategySelections();
    // find matching strategy and store to tempStrategy
    let tempStrategy = strategySelections.find(s => s.Display === strategy);

    this.productService.getProductFromSymbol(symbol).pipe(take(1)).subscribe(result => {
      this.SelectedProduct = result.Data;
      if (this.screenerOptions === "Optimal_Strategy") {
        this.ByStrategyForm.patchValue({ SelectedStrategy: tempStrategy });
        this.ByStrategyForm.patchValue({ SelectedStock: this.SelectedProduct });
      } else {
        this.ByStrategyForm.patchValue({ SelectedStrategy: undefined });
      }
      this.switchToStrategyTab();
    });
  }

  onStockActionChanged(action: string) {
    if (action === "Buy") {
      this.StockData$.pipe(take(1)).subscribe(value => {
        //console.log(JSON.stringify(value));
        this.StockOrderForm.patchValue({ StockLimitPrice: value.AskPrice });
        this.StockOrderForm.patchValue({ StockStopPrice: value.AskPrice });
      });
    } else if (action === "Sell") {
      this.StockData$.pipe(take(1)).subscribe(value => {
        //console.log(JSON.stringify(value));
        this.StockOrderForm.patchValue({ StockLimitPrice: value.BidPrice });
        this.StockOrderForm.patchValue({ StockStopPrice: value.BidPrice });
      });
    }
  }

  onExpiryDateChanged(selectedDate: string) {
    this.isLoading = true;
    console.log("Selected date: " + selectedDate);
    this.SelectedOptionExpiryDate = selectedDate;
    if (this.SelectedProduct) {
      var symbol = this.SelectedProduct.Symbol;
      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.StockData$.pipe(take(1)).subscribe(value => {
        // Last Traded Price required here to determine center point of option chain table
        this.placeOrderLastTradedPrice = value.LastTradedPrice;
        this.OptionSnapshot$ = this.optionsService.getOptionChain(symbol, this.SelectedOptionExpiryDate).pipe(share());
        this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
          if (this.SelectedProduct) {
            this.OptionOrderForm.patchValue({ OptionProduct: symbol + this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice) });
          }
          this.OptionSnapshotData = value;
          this.OptionSnapshotDataClone = value;
          this.isLoading = false;

          this.setTableColumnStatus(value);

          this.tableScrollByType(this.selectedType);

        })
      });
    }
  }

  onPlaceOrderStrategyChanged(selectedStrategy: OptionsStrategy) {
    if (selectedStrategy) {
      this.OptionParameterList = this.utilityService.getOptionParameters(selectedStrategy.Name);
      this.ByStrategyForm.patchValue({ SelectedParameter: this.OptionParameterList[0] });
      if (selectedStrategy.Name === 'DeltaNeutral') {
        this.ByStrategyForm.patchValue({ Quantity: 100 });        
      }
      else {
        this.ByStrategyForm.patchValue({ Quantity: 1 });
      }
      this.isLoadingStrategyContractResult = true;
      this.StockData$.pipe(take(1)).subscribe(value => {
        if (this.SelectedProduct) {
          if (selectedStrategy.Name === 'DeltaNeutral') {
            this.ByStrategyForm.patchValue({ LimitPrice: value.LastTradedPrice });        
          }

          var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
          legs.clear()
          var data = this.utilityService.getSampleContract(selectedStrategy.Name, this.SelectedProduct?.Symbol, value.LastTradedPrice);
          data.subscribe(value => {
            legs.clear();
            var group = value.map(x => this.formBuilder.group(
              {
                Action: x.Action,
                OrderType: x.OrderType,
                Direction: x.Direction,
                Rights: x.Rights,
                Quantity: x.Quantity,
                StrikePrice: x.StrikePrice,
                Expiry: x.Expiry,
                LimitPrice: x.LimitPrice,
                FairValue: x.FairValue
              }
            ));
            group.forEach(Leg => legs.push(Leg));
            this.isLoadingStrategyContractResult = false;
          });
          //this.ByStrategyForm.patchValue({Legs: this.utilityService.getSampleContract(selectedStrategy.Name, this.SelectedProduct?.Symbol, value.LastTradedPrice)});
        }
      });
    } else {
      this.OptionParameterList = this.utilityService.getOptionParameters("");
      this.ByStrategyForm.patchValue({ SelectedParameter: this.OptionParameterList[0] });
      this.ByStrategyForm.patchValue({ Legs: [] });
    }
  }

  resetCallTableIfIsRowSelected() {
    this.OptionSnapshotData.map((snapshoot: any) => {
      if (snapshoot.Call.isSelected !== undefined) {
        delete snapshoot.Call.isSelected;
      }
      return snapshoot;
    });
  }

  resetPutTableIfRowIsSelected() {
    this.OptionSnapshotData.map((snapshoot: any) => {
      if (snapshoot.Put.isSelected !== undefined) {
        delete snapshoot.Put.isSelected;
      }
      return snapshoot;
    });
  }

  setSelectedPlaceOrderRowCall(snapshootObj: OptionSnapshot): void {
    this.resetCallTableIfIsRowSelected();
    this.resetPutTableIfRowIsSelected();
    snapshootObj.Call.isSelected = true;
    console.log("snapshootObj.Call: ", snapshootObj.Call);
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;

    this.SelectedOptionContract = snapshootObj.Call.Ticker;
    if (action === "Buy") {
      this.OptionOrderForm.patchValue({ OptionLimitPrice: snapshootObj.Call.Ask });
    } else if (action === "Sell") {
      this.OptionOrderForm.patchValue({ OptionLimitPrice: snapshootObj.Call.Bid });
    }
  }

  setSelectedPlaceOrderRowPut(snapshootObj: OptionSnapshot): void {
    this.resetCallTableIfIsRowSelected();
    this.resetPutTableIfRowIsSelected();
    snapshootObj.Put.isSelected = true;
    console.log("snapshootObj.Put: ", snapshootObj.Put);
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;

    this.SelectedOptionContract = snapshootObj.Put.Ticker;
    if (action === "Buy") {
      this.OptionOrderForm.patchValue({ OptionLimitPrice: snapshootObj.Put.Ask });
    } else if (action === "Sell") {
      this.OptionOrderForm.patchValue({ OptionLimitPrice: snapshootObj.Put.Bid });
    }
  }

  loadCalculatorModal() {
    this.ProfitLossResult = 0;
    var currentState = this.CalculatorFormGroup.get('CurrentState.Legs') as FormArray;
    var nextState = this.CalculatorFormGroup.get('NextState.Legs') as FormArray;
    nextState.clear()
    currentState.clear()
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;
    var quantity = this.OptionOrderForm.get('OptionQuantity')?.value;
    var limitPrice = this.OptionOrderForm.get('OptionLimitPrice')?.value;
    var direction = action === "Buy" ? "Long" : "Short";
    var symbol = this.SelectedProduct?.Symbol;
    this.CalculatorFormGroup.patchValue({ Symbol: symbol });
    var optionSymbol = this.SelectedOptionContract;

    if (optionSymbol) {
      var optionContract = this.utilityService.parseOption(optionSymbol);

      this.CalculatorFormGroup.patchValue({ Strategy: direction + " " + optionContract.Right });
      var obj = {
        Strategy: direction + " " + optionContract.Right,
        Symbol: symbol,
        Stock: {
          Direction: direction,
          Quantity: this.OptionOrderForm.get('Quantity')?.value
        },
        Options: [{
          LegId: 1,
          Action: action,
          OrderType: "Limit",
          Direction: direction,
          Rights: optionContract.Right,
          Quantity: quantity,
          StrikePrice: optionContract.StrikePrice,
          Expiry: optionContract.Expiry,
          LimitPrice: limitPrice,
          FairValue: limitPrice
        }]
      }
      this.MaxProfitLoss$ = this.calculatorService.getMaxProfitLoss(obj);
      this.calculatorService.getCurrentState(obj).subscribe(result => {
        var group = result.Legs.map(x => this.formBuilder.group(
          {
            LegId: x.LegId,
            IV: x.IV,
          }
        ));
        var nextGroup = result.Legs.map(x => this.formBuilder.group(
          {
            LegId: x.LegId,
            IV: x.IV * 100,
          }
        ));
        this.CalculatorFormGroup.get('CurrentState')?.patchValue({ StockPrice: result.StockPrice });
        this.CalculatorFormGroup.get('NextState')?.patchValue({ StockPrice: result.StockPrice });
        group.forEach(Leg => currentState.push(Leg));
        nextGroup.forEach(Leg => nextState.push(Leg));
      })
    }
  }

  loadStrategyCalculatorModal() {
    this.ProfitLossResult = 0;
    var currentState = this.CalculatorFormGroup.get('CurrentState.Legs') as FormArray;
    var nextState = this.CalculatorFormGroup.get('NextState.Legs') as FormArray;
    nextState.clear()
    currentState.clear()
    this.CalculatorFormGroup.patchValue({ Symbol: this.SelectedProduct?.Symbol });
    this.CalculatorFormGroup.patchValue({ Strategy: this.ByStrategyForm.get("SelectedStrategy")?.value.Display });
    var obj = {
      Strategy: this.ByStrategyForm.get("SelectedStrategy")?.value.Name,
      Symbol: this.SelectedProduct?.Symbol,
      Stock: {
        Direction: this.ByStrategyForm.get('Action')?.value === "Buy" ? "Long" : "Short",
        Quantity: this.ByStrategyForm.get('Quantity')?.value
      },
      Options:this.ByStrategyForm.get('Legs')?.value
    }
    this.MaxProfitLoss$ = this.calculatorService.getMaxProfitLoss(obj);
    this.calculatorService.getCurrentState(obj).subscribe(result => {
      var group = result.Legs.map(x => this.formBuilder.group(
        {
          LegId: x.LegId,
          IV: x.IV,
        }
      ));
      var nextGroup = result.Legs.map(x => this.formBuilder.group(
        {
          LegId: x.LegId,
          IV: x.IV * 100,
        }
      ));
      this.CalculatorFormGroup.get('CurrentState')?.patchValue({ StockPrice: result.StockPrice });
      this.CalculatorFormGroup.get('NextState')?.patchValue({ StockPrice: result.StockPrice });
      group.forEach(Leg => currentState.push(Leg));
      nextGroup.forEach(Leg => nextState.push(Leg));

    })
  }

  computeProfitLoss() {
    var obj = this.CalculatorFormGroup.value;

    this.calculatorService.calculateProfit(obj).subscribe(result => {
      this.ProfitLossResult = result;
    });
  }

  sortColumns(columnName: string, orderType: string){

    this.currentSortedColumn = {
      name: columnName,
      type: orderType
    }

    this.isLoadingScreenerResult = true;
    if (this.screenerOptions === 'Optimal_Strategy') {
      this.generateScreenerResult();        
    } else if (this.screenerOptions === 'Prediction') {
      this.generateScreenerResult();
    } else if (this.screenerOptions === 'All') {
      this.generateTradeIdeaResult();  
    }
  }

  ngOnInit(): void {
    this.updateGenerateButtonState();
    this.initBrokerAccounts();
    // this.setScreenerOptionType(this.screenerOptions);
  }

  async initBrokerAccounts(){       
    var allBrokerAccounts = [];
    if (localStorage.getItem('accountSelections') !== null) {
      allBrokerAccounts = JSON.parse(localStorage.getItem('accountSelections') || '[]');
    }
    this.AvailableBrokerAccounts = allBrokerAccounts.filter(function (x: any) {
      return true;
      // return x.brokerType === 'Tiger';
    })
    this.StockOrderForm.patchValue({ SelectedAccount: this.AvailableBrokerAccounts[0] });
    this.OptionOrderForm.patchValue({ SelectedAccount: this.AvailableBrokerAccounts[0] });
    this.ByStrategyForm.patchValue({ SelectedAccount: this.AvailableBrokerAccounts[0] });
  }

  ngOnDestroy() {
  }

  //Custom filter tab functions
  moreStockCriteria(){

  }

  //Column Btn click 
  columnBtnClick() {
    console.log("column btn clicked!!!!")
  }

  //Analysis Functions
  openMobileAnalysis() {
    $('#customModal').modal('show'); 
  }
  closeMobileAnalysis() {
    $('#customModal').modal('hide'); 
    this.moreFilterClicked = false;
  }

  showScreenerColumn() {
    $("#ColumnList").modal('show');
    $(".modal-backdrop").css("display", "block");
  }

  moreFilterClick() {
    this.moreFilterClicked = true;
    console.log(this.moreFilterClicked)
  }

  onBackButtonClick(){
    this.moreFilterClicked = false;
    $('#AnalysisFilter').modal('hide');
  }

  setOption(event:any, which: string) {
    if(this.SelectedStockUniverseType && this.SelectedStockUniverseType.value === "Market"){
      const tempStockUniverseList = this.stockUniverseList.filter(item => item.value === "US")
      this.selectedStockUniverseList = tempStockUniverseList;
      if(which == 'parent') {
        this.selectedStockUniverse = tempStockUniverseList[0]
      }
      console.log(this.SelectedStockUniverseType)
      console.log(this.selectedStockUniverse)
    }else if(this.SelectedStockUniverseType && this.SelectedStockUniverseType.value === "Index"){
      const tempStockUniverseList = this.stockUniverseList.filter(item => item.value !== "US")
      this.selectedStockUniverseList = tempStockUniverseList;
      if(which == 'parent') {
        this.selectedStockUniverse = tempStockUniverseList[0]
      }
    }
  }

  getBreakEvenDistance() {
    let dynamicArr = [];

    for(let i = 0; i < 20; i ++){
      dynamicArr.push({id:i, name: i + 1 +'%', value: i + 1})
    }
    return dynamicArr;
  }

  getOtmDistance() {
    let dynamicArr = [];

    for(let i = 0; i < 20; i ++){
      dynamicArr.push({id:i, name: i + 1 +'%', value: i + 1})
    }
    return dynamicArr;
  }
  
  getExpiryDate() {
    let dynamicArr = [];

    for(let i = 0; i < 30 ; i ++){
      dynamicArr.push({id:i, name:i + 1 + ' Days', value:i + 1})
    }

    return dynamicArr;
  }
  getMeanIVData(){
    let n_left = 5;
    let n_right = 10;
    let dynamicArr = [];
    dynamicArr.push({name: "Select Mean IV"});
    dynamicArr.push({name: "<5%", checked: false});
    for (let i = 1; i <= 18; i++) {
      dynamicArr.push({name: n_left + "%" + " to " + n_right + "%", checked: false});
      n_left =+ n_left+5;
      n_right =+ n_right+5;
      if(i === 18){
        dynamicArr.push({name: ">95%", checked: false});
        return dynamicArr;
      }
    }
    return dynamicArr;
  }

  getPutCallRatioData(){
    let n_left = 5;
    let n_right = 10;
    let dynamicArr = [];
    dynamicArr.push({name: "Select Put/Call Ratio", checked: false});
    dynamicArr.push({name: "<5th percentile ", checked: false});
    for (let i = 0; i < 20; i++) {
      dynamicArr.push({name: n_left +"%", checked: false});
      n_left =+ n_left+5;
      n_right =+ n_right+5;
      if(i === 18){
        dynamicArr.push({name: ">95th percentile", checked: false});
        return dynamicArr;
      }
    }
    return dynamicArr;
  }

  getOptionInterestData(){
    let n_left = 5;
    let n_right = 10;
    let dynamicArr = [];
    dynamicArr.push({name: "Select Option Interest", checked: false});
    dynamicArr.push({name: "<5th percentile ", checked: false});
    for (let i = 1; i <= 18; i++) {
      dynamicArr.push({name: n_left +"th percentile" + " to " + n_right +"th percentile", checked: false});
      n_left =+ n_left+5;
      n_right =+ n_right+5;
      if(i === 18){
        dynamicArr.push({name: ">95th percentile", checked: false});
        return dynamicArr;
      }
    }
    return dynamicArr;
  }

  //Analysis Filter Functions
  onSelectedAnalysisFilterListChange(updatedList: any[]) {
    this.SelectedAnalysisFilterList = updatedList;
  }

  hideRules(selectedAnalysisFilter:AnalysisFilter){
    console.log(selectedAnalysisFilter.value)
    const tempArray = this.SelectedAnalysisFilterList.filter(item => item.value != selectedAnalysisFilter.value)
    this.SelectedAnalysisFilterList = tempArray;
  }

  changePeriod(){

  }

  ////////////////////////////////////////////////////////////////////////////////

  meanIVShareCheckedList(item:any[]){
    this.meanIVShareFilterCheckedArrayList = item;
    this.setCustomTabApliedFilterCount();
  }
  meanIVShareIndividualCheckedList(item:{}){
    //console.log("meanIVShareIndividualCheckedList: ", item);
  }

  updateGenerateButtonState(): void{
    this.disableButton = this.selectedColumnList.length === 0;
  }
 columnListShareCheckedList(item:any[]){
    this.columnShareFilterCheckedArrayList = item;
    this.setCustomColumn(this.columnShareFilterCheckedArrayList);
    this.disableButton = this.selectedColumnList.length === 0;
  }
  
  columnListShareIndividualCheckedList(item:{}){
     //console.log("meanIVShareIndividualCheckedList: ", item);
   }

  setCustomColumn(list:any[]) {
    let tempArray = []
    
    for(let i = 0; i < list.length; i ++){
      tempArray.push(list[i].name)
    }
    this.selectedColumnList = tempArray; 
  }


  removeStockUniverseFilter(){
    this.selectedStockUniverse = this.stockUniverseList[0];
    this.setCustomTabApliedFilterCount();
  }

  removeMeanIVFilter(meanIVFilterListIndex: number, meanIVListIndex: number){
    if(this.meanIVShareFilterCheckedArrayList.length){
      this.meanIVShareFilterCheckedArrayList.splice(meanIVFilterListIndex, 1);
    }
    if(this.meanIVList.length){
      if(this.meanIVList[meanIVListIndex] !== undefined){
        this.meanIVList[meanIVListIndex].checked = false;
      }
    }
    this.setCustomTabApliedFilterCount();
  }

  removePutCallRatioFilter(){
    this.selectedPutCallRatio = this.PutCallRatioList[0];
    this.setCustomTabApliedFilterCount();
  }

  removeOptionInterestFilter(){
    this.selectedOptionInterest = this.optionInterestList[0];
    this.setCustomTabApliedFilterCount();
  }

  removeUnusualSurgeofOptionVolumeFilter(){
    this.unusualSurgeofOptionVolume = false;
    this.setCustomTabApliedFilterCount();
  }

  setCustomTabApliedFilterCount(): void{
    let count = 0;
    let countMeanIVFilter = 0;

    if(this.SelectedStockUniverseType !== null){
      count += 1;
    }
    if(this.selectedPutCallRatio.name !== 'Select Put/Call Ratio'){
      count += 1;
    }
    if(this.selectedOptionInterest.name !== 'Select Option Interest'){
      count += 1;
    }
    if(this.unusualSurgeofOptionVolume){
      count += 1;
    }
    if(this.meanIVShareFilterCheckedArrayList.length){
      countMeanIVFilter = this.meanIVShareFilterCheckedArrayList.length;
      count += countMeanIVFilter;
    }
    this.customTabAppliedFilterCount = count;
  }


  //Analysis Filter
  resetAnalysisFilterOptions(){
    this.SelectedAnalysisFilterList = [];
  }

  submitFilters(){
    console.log(this.SelectedAnalysisFilterList)
  }

  generateCalendarSelectionYears(count: any, startYear: any){
    const yearList = [];
    const year = startYear || new Date().getFullYear();
    for(let i = 0; i < count; i+=1 ){
        yearList.push(Number(year)-i)
    }
    return yearList.sort((a,b)=>a-b)
  }
  getAnalysisFilterPercentageMultiDropdownValueData(){
    let n_left = 5;
    //let n_right = 10;
    let dynamicArr = [];
    dynamicArr.push({name: "Select Value"});
    dynamicArr.push({name: "0% Percentile", checked: false});
    for (let i = 1; i <= 19; i++) {
      dynamicArr.push({name: n_left + "th% Percentile", checked: false});
      n_left =+ n_left+5;
      //n_right =+ n_right+5;
      if(i === 19){
        dynamicArr.push({name: "100th% Percentile", checked: false});
        return dynamicArr;
      }
    }
    return dynamicArr;
  }
  getAnalysisFilterMultiWithoutPercentageSignDropdownValueData(){
    let n_left = 5;
    //let n_right = 10;
    let dynamicArr = [];
    dynamicArr.push({name: "Select Value"});
    dynamicArr.push({name: "0 Percentile", checked: false});
    for (let i = 1; i <= 19; i++) {
      dynamicArr.push({name: n_left + "th Percentile", checked: false});
      n_left =+ n_left+5;
      //n_right =+ n_right+5;
      if(i === 19){
        dynamicArr.push({name: "100th Percentile", checked: false});
        return dynamicArr;
      }
    }
    return dynamicArr;
  }
  getAnalysisFilterMultiDropdownValueData(){
    let n_left = 5;
    //let n_right = 10;
    let dynamicArr = [];
    dynamicArr.push({name: "Select Value"});
    dynamicArr.push({name: "0", checked: false});
    for (let i = 1; i <= 19; i++) {
      dynamicArr.push({name: n_left + "th", checked: false});
      n_left =+ n_left+5;
      //n_right =+ n_right+5;
      if(i === 19){
        dynamicArr.push({name: "100th", checked: false});
        return dynamicArr;
      }
    }
    return dynamicArr;
  }

  //View Filter Options
  viewModalOptions(filterName:string, filterValue:string, filterGroup:string) {
    if(!this.SelectedAnalysisFilterList.find((item:AnalysisFilter) => item.name === filterName)){
      this.SelectedAnalysisFilterList.unshift({name:filterName, value: filterValue, group:filterGroup})
    }
  }
  ////////////////////////////////////////////////////////////////////////////////
  getIronCondorBundlePrice(): number {
    var legs = this.ByStrategyForm.get('Legs')?.value;
    if (legs.length === 4) {
      var totalPrice = legs.filter((x: ContractOptionLeg) => { return x.Action === 'Buy';}).map((x: ContractOptionLeg) => { return x.LimitPrice;}).reduce((total: number, item: number) => {return total + item;})
        - legs.filter((x: ContractOptionLeg) => { return x.Action === 'Sell';}).map((x: ContractOptionLeg) => { return x.LimitPrice;}).reduce((total: number, item: number) => {return total + item;}); 
      return Math.round( totalPrice * 100 + Number.EPSILON ) / 100;
    }
    return 0;
  }
}