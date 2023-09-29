import { Component, OnInit, Input, Inject, createPlatform } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CollectionReference, collectionGroup } from '@angular/fire/firestore';
import { ActivePositionGroupEntry } from 'src/app/interface/active-position-group-entry';
import { ActivePositionLegEntry } from 'src/app/interface/active-position-leg-entry';
import { FormControl, Validators, FormGroup, FormBuilder, AbstractControl, FormArray } from '@angular/forms';
import { MarketData } from 'src/app/interface/market-data';
import { TradeService } from 'src/app/_service/trade.service';
import { ProductService } from 'src/app/_service/product.service';
import { OptionsService } from 'src/app/_service/options.service';
import { UtilityService } from 'src/app/_service/utility.service';
import { OrderType } from 'src/app/interface/order-type';
import { UnitType } from 'src/app/interface/unit-type';
import { Observable, Subject, EMPTY, concat, of, firstValueFrom, from, forkJoin, combineLatest } from 'rxjs';
import { debounceTime, delay, switchMap, tap, catchError, map, share, take, filter, distinctUntilChanged, mergeMap, switchAll, concatMap, mergeAll, defaultIfEmpty } from 'rxjs/operators';
import { FIRESTORE_REFERENCES } from 'src/app/core/firebase.module';
import { ContractOptionLeg } from 'src/app/interface/contract-option-leg';
import { AccountSelection } from 'src/app/interface/account-selection';
import { signalRService } from 'src/app/_service/signalR.service';
import { merge } from 'jquery';

declare var $: any;

@Component({
  selector: 'ow-main-trade-activepositions-tab',
  templateUrl: './active-positions.component.html',
  styleUrls: ['./active-positions.component.css']
})
export class ActivePositionsComponent implements OnInit {
  @Input() SelectedBrokerAccount!: AccountSelection;
  firestore: any = AngularFirestore;
  ActivePositionList: Record<number, ActivePositionGroupEntry>;
  StockPositionToClose: any;
  OptionPositionToClose: any;
  StrategyPositionToClose: any;
  StockData$: Observable<MarketData>;
  OptionData: MarketData;
  StockOrderTypeList: OrderType[];
  StockUnitTypeList: UnitType[];


  StockOrderForm: FormGroup;
  ConfirmedStockOrder: any;
  OptionOrderForm: FormGroup;
  ConfirmedOptionOrder: any;
  ByStrategyForm: FormGroup;
  ConfirmedStrategyOrder: any;

  // Post Order Confirmation Pop-Up
  OrderSuccessParameter: any;
  OrderRejectedParameter: any;
  StrategyOrderSuccessParameter: any;
  StrategyOrderRejectedParameter: any;

  isLoading: Boolean = false;

  isCollapsed: boolean = false;
  isLoadingActivePositions: boolean = false;
  activePositionMode: string = 'Pal';

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private tradeService: TradeService,
    private optionsService: OptionsService,
    private productService: ProductService,
    private utilityService: UtilityService,
    private defaultFireStore: AngularFirestore,
    private signalRservice: signalRService,
    @Inject(FIRESTORE_REFERENCES.TIGER_FIRESTORE) private readonly tigerFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.FUTU_FIRESTORE) private readonly futuFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.IB_FIRESTORE) private readonly ibFirestore: AngularFirestore,
  ) {
    this.StockOrderTypeList = this.utilityService.getOrderTypeSelections();
    this.StockUnitTypeList = this.utilityService.getUnitTypeSelections();
    this.ActivePositionList = {};
    this.StockPositionToClose = {
      Product: "",
      Strategy: ""
    };
    this.OptionPositionToClose = {
      Product: "",
      Strategy: ""
    };
    this.StrategyPositionToClose = {
      Product: "",
      Strategy: ""
    };
    this.OptionData = {
      AskPrice: 0,
      AskSize: 0,
      AskTime: "",
      BidPrice: 0,
      BidSize: 0,
      BidTime: "",
      AssetClass: "Options",
      TradeVenue: "UnitedStates",
      Timestamp: "",
      Symbol: "",
      ProductId: 0,
      LastTradedPrice: 0,
      LastTradedSize: 0,
      LastTradedTime: "",
      Open: 0,
      High: 0,
      Low: 0,
      PrevClose: 0,
      CumulativeVolume: 0,
      MidPrice: 0
    };
    this.StockData$ = EMPTY;
    this.StockOrderForm = this.formBuilder.group(
      {
        SelectedAccount: this.SelectedBrokerAccount,
        SelectedStockAction: ["Buy"],
        StockQuantity: [1, [Validators.required]],
        SelectedStockOrderType: [this.StockOrderTypeList[0]],
        SelectedStockUnitType: [this.StockUnitTypeList[0]],
        StockLimitPrice: [100],
        StockStopPrice: [100],
        SelectedStockValidity: ["Day"]
      }
    );
    this.OptionOrderForm = this.formBuilder.group(
      {
        SelectedAccount: this.SelectedBrokerAccount,
        SelectedOptionAction: ["Buy"],
        OptionQuantity: [1, [Validators.required]],
        OptionLimitPrice: [1],
        OptionProduct: [""],
      }
    );
    this.ByStrategyForm = this.formBuilder.group(
      {
        SelectedAccount: this.SelectedBrokerAccount,
        SelectedStrategy: [undefined],
        SelectedStock: [{}],
        SelectedExpiry: [""],
        SelectedParameter: [],
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
    this.ConfirmedStrategyOrder = {
      product: {},
      legs: []
    };
    this.ConfirmedStockOrder = {
      product: {},
    }
    this.ConfirmedOptionOrder = {
      product: {},
    }

    this.firestore = this.tigerFirestore;
  }

  closeStockPosition(position: ActivePositionGroupEntry): void {
    this.productService.getProductFromSymbol(position.product).pipe(take(1)).subscribe(result => {
      this.StockData$ = this.tradeService.getMarketData(result.Data.ProductId).pipe(share());
      this.StockPositionToClose = {
        Product: result.Data,
        Quantity: position.legs[0].dealSize,
      };
      if (position.legs[0].direction == 'BUY') {
        this.StockPositionToClose.Action = 'SELL';
        this.StockData$.pipe(take(1)).subscribe(value => {
          //console.log(JSON.stringify(value));
          this.StockOrderForm.patchValue({ StockLimitPrice: value.BidPrice });
          this.StockOrderForm.patchValue({ StockStopPrice: value.BidPrice });
        });
      }
      else if (position.legs[0].direction == 'SELL') {
        this.StockPositionToClose.Action = 'BUY';
        this.StockData$.pipe(take(1)).subscribe(value => {
          //console.log(JSON.stringify(value));
          this.StockOrderForm.patchValue({ StockLimitPrice: value.AskPrice });
          this.StockOrderForm.patchValue({ StockStopPrice: value.AskPrice });
        });
      }
    });
  }

  closeOptionPosition(position: ActivePositionGroupEntry): void {
    this.OptionPositionToClose = {
      Product: position.legs[0].product,
      Quantity: position.legs[0].dealSize,
      Underlying: position.product
    };
    this.optionsService.getSingleOptionSnapshot(position.legs[0].product).pipe(take(1)).subscribe(result => {
      this.OptionData.LastTradedPrice = result.Last;
      this.OptionData.LastTradedSize = 0;
      this.OptionData.AskPrice = result.Ask;
      this.OptionData.AskSize = result.AskVolume;
      this.OptionData.BidPrice = result.Bid;
      this.OptionData.BidSize = result.BidVolume;
      this.OptionData.CumulativeVolume = result.DailyVol;

      if (position.legs[0].direction == 'BUY') {
        this.OptionPositionToClose.Action = 'SELL';
        //console.log(JSON.stringify(value));
        this.OptionOrderForm.patchValue({ OptionLimitPrice: this.OptionData.BidPrice });
      }
      else if (position.legs[0].direction == 'SELL') {
        this.OptionPositionToClose.Action = 'BUY';
        //console.log(JSON.stringify(value));
        this.OptionOrderForm.patchValue({ OptionLimitPrice: this.OptionData.AskPrice });
      }
    });
  }

  closeStrategyPosition(position: ActivePositionGroupEntry): void {
    this.StrategyPositionToClose = {
      Product: position.product,
      Strategy: position.strategy
    };
    this.productService.getProductFromSymbol(position.product).pipe(take(1)).subscribe(result => {
      this.StockData$ = this.tradeService.getMarketData(result.Data.ProductId).pipe(share());

      var legs = this.ByStrategyForm.controls["Legs"] as FormArray;
      legs.clear();

      Object.keys(position.legs).forEach((legId: any) => {
        if (position.legs[legId].assetType === 'Options') {
          var parsedOption = this.utilityService.parseOption(position.legs[legId].product);

          this.optionsService.getSingleOptionSnapshot(position.legs[legId].product).pipe(take(1)).subscribe(result => {
            var legContent = {
              Symbol: position.legs[legId].product,
              Action: '',
              LimitPrice: 0,
              StrikePrice: parsedOption.StrikePrice,
              //StrikePrice: Math.floor(currentPrice * 0.9),
              Rights: parsedOption.Right,
              Direction: '',
              Quantity: position.legs[legId].dealSize,
              Expiry: parsedOption.Expiry.slice(0, 4) + "-" + parsedOption.Expiry.slice(4, 6) + "-" + parsedOption.Expiry.slice(6),
              FairValue: 0,
              OrderType: 'Limit'
            }

            if (position.legs[legId].direction == 'BUY') {
              legContent.Action = 'Sell';
              legContent.Direction = 'Long';
              legContent.LimitPrice = result.Bid
              legContent.FairValue = result.Bid;
            }
            else if (position.legs[legId].direction == 'SELL') {
              legContent.Action = 'Buy';
              legContent.Direction = 'Short';
              legContent.LimitPrice = result.Ask;
              legContent.FairValue = result.Ask;
            }
            legs.push(this.formBuilder.group(legContent));
          });
        }
        else {
          this.StockData$.pipe(take(1)).subscribe(value => {
            this.ByStrategyForm.patchValue({ Quantity: position.legs[legId].dealSize });
            if (position.legs[legId].direction == 'BUY') {
              this.ByStrategyForm.patchValue({ Action: 'Sell' });
              this.ByStrategyForm.patchValue({ Direction: 'Long' });
              this.ByStrategyForm.patchValue({ LimitPrice: value.BidPrice });
            }
            else if (position.legs[legId].direction == 'SELL') {
              this.ByStrategyForm.patchValue({ Action: 'Buy' });
              this.ByStrategyForm.patchValue({ Direction: 'Short' });
              this.ByStrategyForm.patchValue({ LimitPrice: value.AskPrice });
            }
          });
        }
      })
    });
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

  setActivePositionMode(modeType: string): void {
    this.activePositionMode = modeType;
  }

  setActivePositionAlertData(activePosition: any) {
    console.log("activePosition: ", activePosition);
  }

  toggleCollapsedActivePosition(activePosition: any) {
    activePosition.value.isCollapsed = !activePosition.value.isCollapsed;
    this.isCollapsed = !activePosition.value.isCollapsed;
  }

  submitOptionOrder(): void {
    var account = this.SelectedBrokerAccount;
    var action = this.OptionPositionToClose.Action;
    //var product = this.OptionOrderForm.get('OptionProduct')?.value;
    var quantity = this.OptionPositionToClose.Quantity;
    var limitPrice = this.OptionOrderForm.get('OptionLimitPrice')?.value;

    var requestObj = {
      account: account.id,
      action: action,
      symbol: this.OptionPositionToClose.Product,
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
    var account = this.SelectedBrokerAccount;
    var action = this.StockPositionToClose.Action;
    var orderType = this.StockOrderForm.get('SelectedStockOrderType')?.value;
    var quantity = this.StockPositionToClose.Quantity;
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
      validity: validity,
      product: this.StockPositionToClose.Product
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
      product: requestObj.product
    }
  }

  submitStrategyOrder(): void {
    var account = this.SelectedBrokerAccount;
    var strategy = this.StrategyPositionToClose.Strategy;
    var action = this.ByStrategyForm.get('Action')?.value;
    var quantity = this.ByStrategyForm.get('Quantity')?.value;
    var limitPrice = this.ByStrategyForm.get('LimitPrice')?.value;
    var legs = this.ByStrategyForm.get('Legs')?.value;

    var requestObj = {
      account: account.id,
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
      strategy: requestObj.strategy,
      action: requestObj.action,
      direction: requestObj.direction,
      quantity: requestObj.quantity,
      limitPrice: requestObj.limitPrice,
      symbol: this.StrategyPositionToClose.Product,
      legs: legs
    };
  }

  confirmSendOptionOrder(): void {
    var account = this.SelectedBrokerAccount;
    var action = this.OptionPositionToClose.Action;
    //var product = this.OptionOrderForm.get('OptionProduct')?.value;
    var quantity = this.OptionPositionToClose.Quantity;
    var limitPrice = this.OptionOrderForm.get('OptionLimitPrice')?.value;

    var requestObj = {
      AccountId: account?.id,
      Broker: account?.brokerType,
      Action: action,
      Symbol: this.OptionPositionToClose.Product,
      Quantity: quantity,
      LimitPrice: parseFloat(limitPrice),
      Validity: "Day",
      OrderType: "Limit",
      Underlying: this.OptionPositionToClose.Underlying
    };

    console.log("Confirm send option order...", JSON.stringify(requestObj));
    this.tradeService.placeOptionOrder(requestObj).subscribe((result) => {
      console.log(JSON.stringify(result));
      if (result.status !== "REJECTED") {
        this.OrderSuccessParameter = {
          Action: action,
          Quantity: quantity,
          Symbol: this.OptionPositionToClose.Product,
          OrderType: "Limit",
          LimitPrice: limitPrice
        };
        $('#OrderCreated').modal('show');
      } else {
        this.OrderRejectedParameter = {
          Action: action,
          Quantity: quantity,
          Symbol: this.OptionPositionToClose.Product,
          OrderType: "Limit",
          LimitPrice: limitPrice,
          RejectReason: result.reason
        };
        $('#OrderRejected').modal('show');
      }
    });
  }

  confirmSendStockOrder(): void {
    var account = this.SelectedBrokerAccount;
    var action = this.StockPositionToClose.Action;
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
      Symbol: this.StockPositionToClose.Product.Symbol,
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
          Symbol: this.StockPositionToClose.Symbol,
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
          Symbol: this.StockPositionToClose.Symbol,
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
    var account = this.SelectedBrokerAccount;
    var strategy = this.StrategyPositionToClose.Strategy;
    var action = this.ByStrategyForm.get('Action')?.value;
    var quantity = this.ByStrategyForm.get('Quantity')?.value;
    var limitPrice = this.ByStrategyForm.get('LimitPrice')?.value;
    var legs = this.ByStrategyForm.get('Legs')?.value;

    let requestObj = {
      AccountId: account.id,
      Broker: account?.brokerType,
      Strategy: strategy,
      Action: action,
      Symbol: this.StrategyPositionToClose.Product,
      Quantity: quantity,
      LimitPrice: parseFloat(limitPrice),
      Validity: "Day",
      OrderType: "Limit",
      Legs: legs
    };

    console.log("Confirm send strategy order...", JSON.stringify(requestObj));
    this.tradeService.placeStrategyOrder(requestObj).subscribe((result: any) => {
      console.log(JSON.stringify(result));
      if (result.status !== "REJECTED") {
        this.StrategyOrderSuccessParameter = {
          Strategy: strategy,
          Underlying: this.StrategyPositionToClose.Product
        };
        $('#OrderSuccess').modal('show');
      } else {
        this.StrategyOrderRejectedParameter = {
          Strategy: strategy,
          Underlying: this.StrategyPositionToClose.Product,
          RejectReason: "Unknown"
        };
        $('#StrategyOrderRejected').modal('show');
      }
    });

    // if (strategy.Name == 'DeltaNeutral') {
    //   let requestObj = {
    //     strategy: strategy,
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
    //     strategy: strategy,
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

  ngAfterViewInit() {
    // $('tr.OnClickAdd td.AddPlus').click(function(){
    //   $(this).toggleClass('added');
    //   $(this).parent().next('tr.showhide').slideToggle();
    // });
  }

  checkIsEmptyObject(objectValue: any) {
    return Object.keys(objectValue).length === 0;
  }

  async getActivePositions() {
    if (this.firestore) {
      switch (this.SelectedBrokerAccount.brokerType) {
        case 'Interactive Brokers':
          await this.getActivePositionsIb();
          break;
        case 'FUTU':
          await this.getActivePositionsFutu();
          break;
        case 'Tiger':
          await this.getActivePositionsTiger();
          break;
      }
    }
  }

  async getActivePositionsIbOld() {
    this.isLoadingActivePositions = true;
    this.ActivePositionList = {};
    var uid = localStorage.getItem('ib-uid') || "";

    if (uid) {
      const group$ = this.firestore.collection('users').doc(uid).collection('positionGroups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).valueChanges();
      group$.subscribe((doc: any) => {
        this.ActivePositionList = {};
        doc.forEach((coll: ActivePositionGroupEntry) => {
          const emptyLeg: { [key: number]: ActivePositionLegEntry } = {};
          // Add to dictionary
          this.ActivePositionList[coll.groupId] = {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: emptyLeg,
            hasFilledLeg: false,
            product: coll.product,
            aggregatedUPL: 0
          };

          Object.keys(coll.legs).forEach((legId: any) => {
            const leg$ = this.firestore.collection('users').doc(uid).collection('positionLegs')
              .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
              .doc(coll.legs[legId].toString()).valueChanges();
            leg$.subscribe((doc2: any) => {
              //console.log(JSON.stringify(doc2));
              if (uid) {
                const activePosition$ = this.firestore.collection('users').doc(uid).collection('openPositions')
                  .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.product).valueChanges();
                activePosition$.subscribe((doc3: any) => {
                  if (doc3.underlying) {
                    // if (doc3.direction === 'BUY') {
                    //   doc3.unrealizedPNL = (optionData[doc3.product].bid - doc3.openingPrice) * doc3.dealSize * doc3.multiplier;
                    // }
                    // else if (doc3.direction === 'SELL') {
                    //   doc3.unrealizedPNL = (doc3.openingPrice - optionData[doc3.product].ask) * doc3.dealSize * doc3.multiplier;
                    // }
                    doc3.unrealizedPNLPct = doc3.unrealizedPNL / (doc3.openingPrice * doc3.dealSize * doc3.multiplier);
                  }
                  else {
                    // if (doc3.direction === 'BUY') {
                    //   doc3.unrealizedPNL = (stockData[doc3.product].BidPrice - doc3.openingPrice) * doc3.dealSize;
                    // }
                    // else if (doc3.direction === 'SELL') {
                    //   doc3.unrealizedPNL = (doc3.openingPrice - stockData[doc3.product].AskPrice) * doc3.dealSize;
                    // }
                    doc3.unrealizedPNLPct = doc3.unrealizedPNL / (doc3.openingPrice * doc3.dealSize);
                  }
                  this.ActivePositionList[coll.groupId].legs[legId] = doc3;
                  if (doc3) {
                    this.ActivePositionList[coll.groupId].hasFilledLeg = true;
                    this.ActivePositionList[coll.groupId].aggregatedUPL += doc3.unrealizedPNL;
                  }
                });
              }
              //console.log(JSON.stringify(doc2));
            });
          });
        });
        this.isLoadingActivePositions = false;
        console.log(this.ActivePositionList);        
      });
    }
  }

  async getActivePositionsIb() {
    this.isLoadingActivePositions = true;
    this.ActivePositionList = {};
    var uid = localStorage.getItem('ib-uid') || "";

    if (uid) {
      const group$ = this.firestore.collection('users').doc(uid).collection('positionGroups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).valueChanges();

      group$.pipe(
        map((mp: any) => mp.map((coll: any) => {
          return {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: coll.legs,
            hasFilledLeg: false,
            product: coll.product,
            aggregatedUPL: 0
          };
        })),
        tap((query: any) => console.log(`Querying 1 for ${query.groupId}...`)),
        // map((coll: any) => {
        //   const emptyLeg: { [key: number]: ActivePositionLegEntry } = {};
        //   return {
        //     isCollapsed: true,
        //     groupId: coll.groupId,
        //     strategy: coll.strategy,
        //     legs: coll.legs,
        //     hasFilledLeg: true,
        //     product: coll.product,
        //     aggregatedUPL: 0
        //   }
        // }),
        // tap((query: any) => console.log(`Querying 2 for ${query.groupId}...`)),
        // switchMap((entry: any) =>
        //   entry.map((cd: any) =>
        //     forkJoin(
        //       Object.keys(cd.legs).map((legId: any) => of(cd.legs[legId]))
        //     )
        //   )
        // ),
        // mergeAll() // Flatten the nested Observables

        switchMap((entry: any) => {
          //return cd;
          return entry.map((cd: any) => {
            var streams = Object.keys(cd.legs).map((legId: any) => {
              // return of(cd.legs[legId]);
              //console.log("Tracing position legs " + cd.legs[legId]);
              const leg$ = this.firestore.collection('users').doc(uid).collection('positionLegs')
                .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
                .doc(cd.legs[legId].toString()).valueChanges();

              return leg$.pipe(switchMap(
                (x: any) => {
                  //console.log("GroupID: " + cd.groupId + ", product: " + x.product);
                  const activePosition$ = this.firestore.collection('users').doc(uid).collection('openPositions')
                    .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(x.product).valueChanges()
                  return activePosition$.pipe(
                    filter(value => value !== null && value !== undefined),
                    switchMap(
                    (doc3: any) => {
                      return of(doc3);
                    }
                  ));
                }
              ));
            });
            var combined$ = combineLatest(streams);
            return combined$.pipe(map((x: any) => {
              cd.legs = x;
              cd.hasFilledLeg = true;
              return cd;
            }))
          });       
        }),
        mergeAll(), // Flatten the nested Observables

        //   // return forkJoin(Object.keys(cd.legs).map((legId: any) => {
        //   //   //return of(cd.legs[legId]);
        //   //   const leg$ = this.firestore.collection('users').doc(uid).collection('positionLegs')
        //   //     .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
        //   //     .doc(cd.legs[legId].toString()).valueChanges()
        //   //   return leg$.pipe(switchMap(
        //   //     (x: any) => {
        //   //       const activePosition$ = this.firestore.collection('users').doc(uid).collection('openPositions')
        //   //         .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(x.product).valueChanges()
        //   //       return activePosition$.pipe(take(1));
        //   //     }
        //   //   ), take(1));
        //   // }))
        // }),
        // // switchAll(),
        // tap(query => console.log(`Querying 3 for ${query}...`))
      ).subscribe((x: any) => {
        this.ActivePositionList[x.groupId] = x;
        this.isLoadingActivePositions = false;
        console.log(x);
      });      
    }
  }

  async getActivePositionsFutu() {
    this.isLoadingActivePositions = true;
    var uid = localStorage.getItem('futu-uid') || "";

    if (uid) {
      const group$ = this.firestore.collection('users').doc(uid).collection('positionGroups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).valueChanges();
      //const group$ = this.firestore.collection('users').doc(uid).collection('groups').valueChanges();
      group$.subscribe((doc: any) => {
        this.ActivePositionList = {};
        doc.forEach((coll: ActivePositionGroupEntry) => {
          const emptyLeg: { [key: number]: ActivePositionLegEntry } = {};
          // Add to dictionary
          this.ActivePositionList[coll.groupId] = {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: emptyLeg,
            hasFilledLeg: false,
            product: coll.product,
            aggregatedUPL: 0
          };

          Object.keys(coll.legs).forEach((legId: any) => {
            const leg$ = this.firestore.collection('users').doc(uid).collection('positionsLegs')
              .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
              .doc(coll.legs[legId].toString()).valueChanges();
            leg$.subscribe((doc2: any) => {
              //console.log(JSON.stringify(doc2));
              if (uid) {
                const activePosition$ = this.firestore.collection('users').doc(uid).collection('openPositions')
                  .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.product).valueChanges();
                activePosition$.subscribe((doc3: any) => {
                  if (doc3) {
                    if (doc3.assetType === 'Options') {
                      doc3.multiplier = 100;
                      //doc3.unrealizedPNL *= doc3.multiplier;
                      doc3.unrealizedPNLPct = (doc3.unrealizedPNL / 100) / (doc3.openingPrice * Math.abs(doc3.dealSize));
                    }
                    else {
                      doc3.unrealizedPNLPct = doc3.unrealizedPNL / (doc3.openingPrice * Math.abs(doc3.dealSize));
                    }
                    this.ActivePositionList[coll.groupId].legs[legId] = doc3;
                    if (doc3) {
                      if (doc3.strategy == "") {
                        this.ActivePositionList[coll.groupId].aggregatedUPL = doc3.unrealizedPNL;
                      } else {
                        this.ActivePositionList[coll.groupId].aggregatedUPL += doc3.unrealizedPNL;
                      }
                      this.ActivePositionList[coll.groupId].hasFilledLeg = true;
                    }
                  }
                });
              }
              //console.log(JSON.stringify(doc2));
            });
          });
        });
        this.isLoadingActivePositions = false;
        console.log(this.ActivePositionList);
        // console.log(Object.keys(this.ActivePositionList[Number(607)].legs))

        if (!this.checkIsEmptyObject(this.ActivePositionList)) {
          var listChannel = Object.values(this.ActivePositionList).map(p => p.product);

          setTimeout(() => {
            this.signalRservice.registerChannel(listChannel).subscribe();
            
            listChannel.forEach(channel =>
              this.signalRservice.registerDataListener(channel).pipe().subscribe(
                result => {
                  
                  let tmp = JSON.parse(result);
                  setTimeout(() => {
                    Object.keys(this.ActivePositionList).forEach(key => {
                      Object.keys(this.ActivePositionList[Number(key)].legs).forEach(leg => {
                        if (this.ActivePositionList[Number(key)].legs[Number(leg)] &&
                          this.ActivePositionList[Number(key)].legs[Number(leg)].product == tmp.symbol) {
                          this.ActivePositionList[Number(key)].legs[Number(leg)].unrealizedPNL = tmp.last;
                        }
                      })
                    });
                  }, 1000);
                }
              ))
          }, 2000);
        }
      });
    }
  }

  async getActivePositionsTiger() {
    this.isLoadingActivePositions = true;
    var uid = localStorage.getItem('tiger-uid') || "";

    if (uid) {
      const group$ = this.firestore.collection('users').doc(uid).collection('positionGroups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).valueChanges();
      //const group$ = this.firestore.collection('users').doc(uid).collection('groups').valueChanges();
      group$.subscribe((doc: any) => {
        this.ActivePositionList = {};
        doc.forEach((coll: ActivePositionGroupEntry) => {
          const emptyLeg: { [key: number]: ActivePositionLegEntry } = {};
          // Add to dictionary
          this.ActivePositionList[coll.groupId] = {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: emptyLeg,
            hasFilledLeg: false,
            product: coll.product,
            aggregatedUPL: 0
          };

          Object.keys(coll.legs).forEach((legId: any) => {
            const leg$ = this.firestore.collection('users').doc(uid).collection('positionsLegs')
              .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
              .doc(coll.legs[legId].toString()).valueChanges();
            leg$.subscribe((doc2: any) => {
              //console.log(JSON.stringify(doc2));
              if (uid) {
                const activePosition$ = this.firestore.collection('users').doc(uid).collection('openPositions')
                  .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.product).valueChanges();
                activePosition$.subscribe((doc3: any) => {
                  if (doc3.assetType === 'Options') {
                    doc3.unrealizedPNL *= doc3.multiplier;
                    doc3.unrealizedPNLPct = doc3.unrealizedPNL / (doc3.openingPrice * doc3.dealSize * doc3.multiplier);
                  }
                  else {
                    doc3.unrealizedPNLPct = doc3.unrealizedPNL / (doc3.openingPrice * doc3.dealSize);
                  }
                  this.ActivePositionList[coll.groupId].legs[legId] = doc3;
                  if (doc3) {
                    this.ActivePositionList[coll.groupId].aggregatedUPL += doc3.unrealizedPNL;
                    this.ActivePositionList[coll.groupId].hasFilledLeg = true;
                  }
                });
              }
              //console.log(JSON.stringify(doc2));
            });
          });
        });
        this.isLoadingActivePositions = false;
        console.log(this.ActivePositionList);
        // console.log(Object.keys(this.ActivePositionList[Number(607)].legs))

        if (!this.checkIsEmptyObject(this.ActivePositionList)) {
          var listChannel = Object.values(this.ActivePositionList).map(p => p.product);
          
          setTimeout(() => {
            this.signalRservice.registerChannel(listChannel).subscribe();
            listChannel.forEach(channel =>
              this.signalRservice.registerDataListener(channel).pipe().subscribe(
                result => {
                  
                  let tmp = JSON.parse(result);
                  setTimeout(() => {
                    Object.keys(this.ActivePositionList).forEach(key => {
                      Object.keys(this.ActivePositionList[Number(key)].legs).forEach(leg => {
                        if (this.ActivePositionList[Number(key)].legs[Number(leg)] &&
                          this.ActivePositionList[Number(key)].legs[Number(leg)].product == tmp.symbol) {
                          this.ActivePositionList[Number(key)].legs[Number(leg)].unrealizedPNL = tmp.last;
                        }
                      })
                    });
                  }, 1000);
                }
              ))
          }, 2000);
        }
      });
    }
  }

  ngOnChanges(changes: any) {
    if (this.SelectedBrokerAccount.brokerType === 'Tiger') {
      this.firestore = this.tigerFirestore;
    }
    if (this.SelectedBrokerAccount.brokerType === 'FUTU') {
      this.firestore = this.futuFirestore;
    }
    if (this.SelectedBrokerAccount.brokerType === 'Interactive Brokers') {
      this.firestore = this.ibFirestore;
    }

    this.getActivePositions();
  }

  ngOnInit(): void {
    this.signalRservice.startConnection();
    // this.getActivePositions();
  }

  getIronCondorBundlePrice(): number {
    var legs = this.ByStrategyForm.get('Legs')?.value;
    if (legs.length === 4) {
      var totalPrice = legs.filter((x: ContractOptionLeg) => { return x.Action === 'Buy'; }).map((x: ContractOptionLeg) => { return x.LimitPrice; }).reduce((total: number, item: number) => { return total + item; })
        - legs.filter((x: ContractOptionLeg) => { return x.Action === 'Sell'; }).map((x: ContractOptionLeg) => { return x.LimitPrice; }).reduce((total: number, item: number) => { return total + item; });
      return Math.round(totalPrice * 100 + Number.EPSILON) / 100;
    }
    return 0;
  }
}