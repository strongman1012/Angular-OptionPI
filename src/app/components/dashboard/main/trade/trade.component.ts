import { Component, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpiryDatesSelection } from 'src/app/interface/expiry-dates-selection';
import { FormControl, Validators, FormGroup, FormBuilder, AbstractControl, FormArray } from '@angular/forms';
import { debounceTime, delay, switchMap, tap, catchError, map, share, take, filter, distinctUntilChanged } from 'rxjs/operators';
import { OrderType } from 'src/app/interface/order-type';
import { UnitType } from 'src/app/interface/unit-type';
import { OptionSnapshot } from 'src/app/interface/option-snapshot';
import { Observable, Subject, EMPTY, concat, of } from 'rxjs';
import { MarketData } from 'src/app/interface/market-data';
import { TradeService } from 'src/app/_service/trade.service';
import { CalculatorService } from 'src/app/_service/calculator.service';
import { OptionsService } from 'src/app/_service/options.service';
import { ProductService } from 'src/app/_service/product.service';
import { UtilityService } from 'src/app/_service/utility.service';
import { ConfigService } from 'src/app/common/config.service'
import { OptionsParameter } from 'src/app/interface/options-parameter';
import { OptionsStrategy } from 'src/app/interface/options-strategy';
import { ContractOptionLeg } from 'src/app/interface/contract-option-leg';
import { Product } from 'src/app/interface/product';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CollectionReference, collectionGroup } from '@angular/fire/firestore';
import { StrategyExpiryParameter } from 'src/app/interface/strategy-expiry-parameter';
import { Options } from '@angular-slider/ngx-slider';
import { FIRESTORE_REFERENCES } from 'src/app/core/firebase.module';

declare var $: any;

@Component({
  selector: 'ow-main-trade-tab',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css']
})
export class TradeComponent implements OnInit {

  @Input() currentTab: string = 'account-summary';
  @Input() currentTradeTab: string = 'by-product';
  @Input() currentProductListTab: string = 'product-list-option';

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

  SelectedFirestoreInstance: AngularFirestore;
  SelectedBroker: any;
  SelectedBrokerAccount: any;
  brokerTypes = [] as any;
  allBrokerAccounts = [] as any;
  brokerAccounts = [] as any;

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
  dynamicStyleTable4: any = {"margin-top": "0"};
  dynamicStyleTable1: any = {"margin-top": "0"};
  dynamicStyleTable2: any = {"margin-top": "0"};
  dynamicStyleTable3: any = {"margin-top": "0"};
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
  isLoadingStrategyContractResult: Boolean = false;

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

  callTableColumns: any = [];
  callTableColumnsDefault: any = [];
  callTableColumnsReverse: any = [];
  putTableColumns: any = [];

  placeOrderColumns: any;

  placeOrderLastTradedPrice: any = 0;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AngularFireAuth,
    private tradeService: TradeService,
    private calculatorService: CalculatorService,
    private optionsService: OptionsService,
    private productService: ProductService,
    private utilityService: UtilityService,
    private firestore: AngularFirestore,
    private configService: ConfigService,
    @Inject(FIRESTORE_REFERENCES.TIGER_FIRESTORE) private readonly tigerFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.FUTU_FIRESTORE) private readonly futuFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.IB_FIRESTORE) private readonly ibFirestore: AngularFirestore,
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

    this.table4Scroll = <any> '';
    this.table1Scroll = <any> '';
    this.table2Scroll = <any> '';
    this.table3Scroll = <any> '';

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

    var stgList = utilityService.getStrategySelections();
    this.StockOrderTypeList = this.utilityService.getOrderTypeSelections();
    this.StockUnitTypeList = this.StockUnitTypeList = this.utilityService.getUnitTypeSelections();
    this.StockOrderForm = this.formBuilder.group(
      {
        SelectedAccount: this.AvailableBrokerAccounts[0],
        SelectedStockAction: ["Buy"],
        StockQuantity: [1, [Validators.required] ],
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
        OptionQuantity: [1, [Validators.required] ],
        OptionLimitPrice: [1],
        OptionProduct: [""]
      }
    );

    this.OptionExpiryDates$ = EMPTY;
    this.SelectedOptionExpiryDate = "";
    this.StockData$ = EMPTY;
    this.OptionSnapshot$ = EMPTY;

    this.PlaceOrderStrategyList = stgList;
    this.OptionParameterList = this.utilityService.getOptionParameters("");
    this.ExpiryParameterList = this.utilityService.getStrategyExpiryParameters();
    this.CalendarSpreadExpiryParameterList = this.utilityService.getCalendarSpreadExpiryParameters();
    this.ByStrategyForm = this.formBuilder.group(
      {
        SelectedAccount: this.AvailableBrokerAccounts[0],
        SelectedStrategy: [undefined],
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
    this.ByStrategyForm.patchValue({ SelectedStrategy: undefined });
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

    this.SelectedFirestoreInstance = this.firestore;
  }

  ngOnInit(): void {
    this.initBrokerAccounts();
  }

  seeMyOrders(){
    $('#OrderCreated').modal('hide');
    $('#OrderSuccess').modal('hide');
    this.currentTab = "active-orders";
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
      // Last Traded Price required here to determine center point of option chain table
      this.placeOrderLastTradedPrice = value.LastTradedPrice;
      console.log(JSON.stringify(value));
      this.StockOrderForm.patchValue({StockLimitPrice: value.AskPrice});
      this.StockOrderForm.patchValue({StockStopPrice: value.AskPrice});
    });  

    if (this.currentProductListTab === 'product-list-option') {
      this.OptionSnapshotData = [];
      this.OptionExpiryDates$ = this.optionsService.getExpiryDates(item.Symbol).pipe(share());

      this.OptionExpiryDates$.pipe(take(1)).subscribe(value => {
        this.SelectedOptionExpiryDate = value.DefaultExpiryDate;
        this.OptionSnapshot$ = this.optionsService.getOptionChain(item.Symbol, this.SelectedOptionExpiryDate).pipe(share());
  
        this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
          this.OptionOrderForm.patchValue({OptionProduct: item.Symbol + this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice)});
          this.isLoading = false;
          this.OptionSnapshotData = value;
          this.OptionSnapshotDataClone = value;
  
          this.setTableColumnStatus(value);
  
          this.tableScrollByType(this.selectedType);
        })
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
        var data = this.utilityService.getSampleContract(strategy.Name, item.Symbol, value.LastTradedPrice).pipe(share());
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

  submitOptionOrder() : void {
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

  submitStockOrder() : void {
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

  submitStrategyOrder() : void {
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
    }
  }

  confirmSendOptionOrder() : void {
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

  confirmSendStockOrder() : void {
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

  confirmSendStrategyOrder() : void {
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
        $('#OrderSuccess').modal('show');
        this.currentTab = "active-orders";
      } else {
        this.StrategyOrderRejectedParameter = {
          Strategy: strategy.Name,
          Underlying: this.SelectedProduct?.Symbol,
          RejectReason: "Unknown"
        };
        $('#StrategyOrderRejected').modal('show');
      }
    });
  }

  increaseOptionLimitPrice() : void {
    var price = this.OptionOrderForm.get('OptionLimitPrice');
    var tickIncrement = this.utilityService.getOptionTickSize(price?.value, true);
    var newPrice = parseFloat((parseFloat(price?.value) + tickIncrement).toFixed(4));
    this.OptionOrderForm.patchValue({OptionLimitPrice: newPrice});
  }

  decreaseOptionLimitPrice() : void {
    var price = this.OptionOrderForm.get('OptionLimitPrice');
    var tickIncrement = this.utilityService.getOptionTickSize(price?.value, false);
    var newPrice = parseFloat((parseFloat(price?.value) - tickIncrement).toFixed(4));
    this.OptionOrderForm.patchValue({OptionLimitPrice: newPrice});
  }

  increaseStockLimitPrice() : void {
    var price = this.StockOrderForm.get('StockLimitPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, true);
    var newPrice = parseFloat((parseFloat(price?.value) + tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({StockLimitPrice: newPrice});
  }

  decreaseStockLimitPrice() : void {
    var price = this.StockOrderForm.get('StockLimitPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, false);
    var newPrice = parseFloat((parseFloat(price?.value) - tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({StockLimitPrice: newPrice});
  }

  increaseStockStopPrice() : void {
    var price = this.StockOrderForm.get('StockStopPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, true);
    var newPrice = parseFloat((parseFloat(price?.value) + tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({StockStopPrice: newPrice});
  }

  decreaseStockStopPrice() : void {
    var price = this.StockOrderForm.get('StockStopPrice');
    var tickIncrement = this.utilityService.getStockTickSize(price?.value, false);
    var newPrice = parseFloat((parseFloat(price?.value) - tickIncrement).toFixed(4));
    this.StockOrderForm.patchValue({StockStopPrice: newPrice});
  }

  onAccountChanged(accountId: string) {

  }

  onBrokerTypeChanged(broker: any) {
    this.brokerAccounts = this.allBrokerAccounts.filter(function (x: any) {
      return x.brokerType === broker.name;
    })
    this.SelectedBrokerAccount = this.brokerAccounts[0];
    // switch (this.SelectedBrokerAccount.brokerType) {
    //   case 'Tiger':
    //     this.SelectedFirestoreInstance = this.SelectedBrokerAccount.brokerType;
    //     break;
    //   case 'FUTU':
    //     this.SelectedFirestoreInstance = this.futuFirestore;
    //     break;
    // }
  }

  onStockActionChanged(action: string) {
    if (action === "Buy") {
      this.StockData$.pipe(take(1)).subscribe(value => {
        console.log(JSON.stringify(value));
        this.StockOrderForm.patchValue({StockLimitPrice: value.AskPrice});
        this.StockOrderForm.patchValue({StockStopPrice: value.AskPrice});
      });
    } else if (action === "Sell") {
      this.StockData$.pipe(take(1)).subscribe(value => {
        console.log(JSON.stringify(value));
        this.StockOrderForm.patchValue({StockLimitPrice: value.BidPrice});
        this.StockOrderForm.patchValue({StockStopPrice: value.BidPrice});
      });
    }
  }

  onExpiryDateChanged(selectedDate: string) {
    this.isLoading = true;
    console.log("Selected date: " + selectedDate);
    this.SelectedOptionExpiryDate = selectedDate;
    if (this.SelectedProduct) {
      this.OptionSnapshot$ = this.optionsService.getOptionChain(this.SelectedProduct.Symbol, this.SelectedOptionExpiryDate).pipe(share());
    }

    this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
      if (this.SelectedProduct) {
        this.OptionOrderForm.patchValue({ OptionProduct: this.SelectedProduct.Symbol + this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice) });
      }
      this.OptionSnapshotData = value;
      this.OptionSnapshotDataClone = value;

      this.setTableColumnStatus(value);

      this.tableScrollByType(this.selectedType);
      console.log(value);
      this.isLoading = false;
    })
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

  async initBrokerAccounts(){
    this.brokerTypes = [
      {
        id: 1,
        name: 'Interactive Brokers',
        image: '//am708403.blob.core.windows.net/images/optionpi/img/Interactive.png',
        link: '',
      },
      {
        id: 2,
        name: 'Tiger',
        image: '//am708403.blob.core.windows.net/images/optionpi/img/tiger.png',
        link: 'https://www.tigersecurities.com/login?invite=QUANT&ne=https://quant.itigerup.com/developer#developer',
      },
      // {
      //   id: 3,
      //   name: 'FUTU',
      //   image: '//am708403.blob.core.windows.net/images/optionpi/img/futu.png',
      //   link: '',
      // },
      
    ]
    
    this.SelectedBroker = this.brokerTypes[0];
    this.allBrokerAccounts = [];
    if (localStorage.getItem('accountSelections') !== null) {
      this.allBrokerAccounts = JSON.parse(localStorage.getItem('accountSelections') || '[]');
    }
    this.brokerAccounts = this.allBrokerAccounts.filter(function (x: any) {
      return x.brokerType === 'Interactive Brokers';
    })
    console.log( this.allBrokerAccounts)
    this.AvailableBrokerAccounts = this.allBrokerAccounts.filter(function (x: any) {
      
      return x.brokerType != "FUTU" ;
      // return x.brokerType === 'Tiger';
    })

    this.SelectedBrokerAccount = this.brokerAccounts[0];
  }

  setTab(tabName: string){
    this.currentTab = tabName;
  }

  @HostListener('window:scroll', ['$event']) scrollTable4Handler($event: any){
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

  @HostListener('window:scroll', ['$event']) scrollTable1Handler($event: any){
    //let table4ScrollTop = this.table4Scroll.nativeElement.scrollTop;
    let table1ScrollTop = this.table1Scroll.nativeElement.scrollTop;
    //let table2ScrollTop = this.table2Scroll.nativeElement.scrollTop;
    //let table3ScrollTop = this.table3Scroll.nativeElement.scrollTop;

    ////this.dynamicStyleTable4 = {'margin-top': '-'+table1ScrollTop+'px'};
    //this.dynamicStyleTable1 = {'margin-top': '-'+table1ScrollTop+'px'};
    ////this.dynamicStyleTable2 = {'margin-top': '-'+table1ScrollTop+'px'};
    ////this.dynamicStyleTable3 = {'margin-top': '-'+table1ScrollTop+'px'};

    if(this.selectedType == 'Call'){
      this.table4Scroll.nativeElement.scrollTop = table1ScrollTop;
    }
    //this.table1Scroll.nativeElement.scrollTop = table1ScrollTop;
    this.table2Scroll.nativeElement.scrollTop = table1ScrollTop;
    this.table3Scroll.nativeElement.scrollTop = table1ScrollTop;
  }
  @HostListener('window:scroll', ['$event']) scrollTable2Handler($event: any){
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
  @HostListener('window:scroll', ['$event']) scrollTable3Handler($event: any){
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

  reloadOptionData() {
    if (this.SelectedProduct) {
      this.OptionSnapshotData = [];
      this.isLoading = true;
      var symbol = this.SelectedProduct.Symbol;

      this.OptionSnapshot$ = this.optionsService.getOptionChain(symbol, this.SelectedOptionExpiryDate).pipe(share());
      this.OptionSnapshot$.pipe(take(1)).subscribe(value => {
        this.OptionOrderForm.patchValue({ OptionProduct: symbol+ this.SelectedOptionExpiryDate.split("-").join("").slice(2) + "C" + this.utilityService.parseStrikePrice(value[0].StrikePrice) });
        this.isLoading = false;
        this.OptionSnapshotData = value;
        this.OptionSnapshotDataClone = value;

        this.setTableColumnStatus(value);

        this.tableScrollByType(this.selectedType);
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

        if (strategy) {
          if (strategy.Name === 'DeltaNeutral') {
            this.ByStrategyForm.patchValue({ LimitPrice: value.LastTradedPrice });        
          }

          this.OptionParameterList = this.utilityService.getOptionParameters(strategy.Name);
          var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
          legs.clear()
          var data = this.utilityService.getSampleContract(strategy.Name, symbol, value.LastTradedPrice);
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

  onTypeChanged(value: String){
    this.selectedType = value;
    if(value === 'All'){
      this.OptionTable4Classes = 'outer-side OptionTable4 d-none';
      this.OptionTable1Classes = 'outer-body OptionTable1 width1 width2';
      this.OptionTable2Classes = 'outer-side OptionTable2';
      this.OptionTable3Classes = 'outer-body OptionTable3 width1 width2';
    }
    if(value === 'Call'){
      this.OptionTable4Classes = 'outer-side OptionTable4';
      this.OptionTable1Classes = 'outer-body OptionTable1 width1';
      this.OptionTable2Classes = 'outer-side OptionTable2 d-none';
      this.OptionTable3Classes = 'outer-body OptionTable3 width1 width2 d-none';
    }
    if(value === 'Put'){
      this.OptionTable4Classes = 'outer-side OptionTable4 d-none';
      this.OptionTable1Classes = 'outer-body OptionTable1 width1 width2 d-none';
      this.OptionTable2Classes = 'outer-side OptionTable2';
      this.OptionTable3Classes = 'outer-body OptionTable3 width1';
    }
  }

  resetCallTableIfIsRowSelected(){
    this.OptionSnapshotData.map((snapshoot: any) =>{
      if(snapshoot.Call.isSelected !== undefined){
        delete snapshoot.Call.isSelected;
      }
      return snapshoot;
    });
  }

  resetPutTableIfRowIsSelected(){
    this.OptionSnapshotData.map((snapshoot: any) =>{
      if(snapshoot.Put.isSelected !== undefined){
        delete snapshoot.Put.isSelected;
      }
      return snapshoot;
    });
  }

  setSelectedPlaceOrderRowCall(snapshootObj: OptionSnapshot): void{
    this.resetCallTableIfIsRowSelected();
    this.resetPutTableIfRowIsSelected();
    snapshootObj.Call.isSelected = true;
    console.log("snapshootObj.Call: ", snapshootObj.Call);
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;

    this.SelectedOptionContract = snapshootObj.Call.Ticker;
    if (action === "Buy") {
      this.OptionOrderForm.patchValue({OptionLimitPrice: snapshootObj.Call.Ask});
    } else if (action === "Sell") {
      this.OptionOrderForm.patchValue({OptionLimitPrice: snapshootObj.Call.Bid});
    }
  }

  setSelectedPlaceOrderRowPut(snapshootObj: OptionSnapshot): void{
    this.resetCallTableIfIsRowSelected();
    this.resetPutTableIfRowIsSelected();
    snapshootObj.Put.isSelected = true;
    console.log("snapshootObj.Put: ", snapshootObj.Put);
    var action = this.OptionOrderForm.get('SelectedOptionAction')?.value;

    this.SelectedOptionContract = snapshootObj.Put.Ticker
    if (action === "Buy") {
      this.OptionOrderForm.patchValue({OptionLimitPrice: snapshootObj.Put.Ask});
    } else if (action === "Sell") {
      this.OptionOrderForm.patchValue({OptionLimitPrice: snapshootObj.Put.Bid});
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

  switchToOptionTab(): void {
    console.log("Switch to option tab");
    this.currentProductListTab = 'product-list-option';
    if (this.SelectedProduct) {
      this.OptionSnapshotData = [];
      this.isLoading = true;
      var symbol = this.SelectedProduct.Symbol;

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
    this.currentTab
    if (this.SelectedProduct) {
      var symbol = this.SelectedProduct.Symbol;

      // Get data to show Underlying Price
      this.StockData$ = this.tradeService.getMarketData(this.SelectedProduct.ProductId).pipe(share());
      this.isLoadingStrategyContractResult = true;
      this.StockData$.pipe(take(1)).subscribe(value => {
        var strategy = this.ByStrategyForm.get('SelectedStrategy')?.value;

        if (strategy) {
          if (strategy.Name === 'DeltaNeutral') {
            this.ByStrategyForm.patchValue({ LimitPrice: value.LastTradedPrice });        
          }

          this.OptionParameterList = this.utilityService.getOptionParameters(strategy.Name);
          var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
          legs.clear()
          var data = this.utilityService.getSampleContract(strategy.Name, symbol, value.LastTradedPrice);
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
  }

  confirmLiquidateAll(): void {
    console.log("Executing Liquidate All Operation");
  }

  preselectAccount(): void {
    this.StockOrderForm.patchValue({ SelectedAccount: this.SelectedBrokerAccount });
    this.OptionOrderForm.patchValue({ SelectedAccount: this.SelectedBrokerAccount });
    this.ByStrategyForm.patchValue({ SelectedAccount: this.SelectedBrokerAccount });
  }

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