import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { debounceTime, delay, switchMap, tap, catchError, map, share, take } from 'rxjs/operators';
import { HistoricalOrderResult } from 'src/app/interface/historical-order-result';
import { Observable, EMPTY } from 'rxjs';
import { HistoricalOrderService } from './historical-order.service';
import * as $ from 'jquery';
import { HistoricalOrderSearchRequest } from 'src/app/interface/historical-order-search-request';
import { AccountSelection } from 'src/app/interface/account-selection';

@Component({
  selector: 'ow-main-trade-historicaltransactions-historicalorder-tab',
  templateUrl: './historical-order.component.html',
  styleUrls: ['./historical-order.component.css']
})
export class HistoricalOrderComponent implements OnInit {
  @Input() SelectedBrokerAccount!: AccountSelection;
  HistoricalOrderResult: HistoricalOrderResult;
  CurrentPage: number;
  TotalPage: number;
  ItemPerPage: number;
  IsFirstPage: boolean;
  IsLastPage: boolean;
  Pages: number[];
  isCollapsed: boolean = false;
  isLoadingHistoricalOrder: boolean = false;
  SearchValue :string;

  currentSortedColumn = {
    name: 'MaxOrderTime',
    type: 'Desc'
  }

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private HistoricalOrderService: HistoricalOrderService
  ) {

    this.HistoricalOrderResult = {
      Data: [{
        isCollapsed: true,
        PortfolioId: 0,
        PortfolioName: "",
        Strategy: "",
        Direction: "",
        Intention: "",
        Underlying: "",
        MaxOrderTime: 0,
        Leg1: {
          Symbol: "",
          Currency: "",
          Action: "",
          Quantity: 0,
          LimitPrice: 0,
          StopPrice: 0,
          Status: "",
          Type: "",
          ContractType: "",
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          OrderTime: 0,
          Intention: ""
        },
        Leg2: {
          Symbol: "",
          Currency: "",
          Action: "",
          Quantity: 0,
          LimitPrice: 0,
          StopPrice: 0,
          Status: "",
          Type: "",
          ContractType: "",
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          OrderTime: 0,
          Intention: ""
        },
        Leg3: {
          Symbol: "",
          Currency: "",
          Action: "",
          Quantity: 0,
          LimitPrice: 0,
          StopPrice: 0,
          Status: "",
          Type: "",
          ContractType: "",
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          OrderTime: 0,
          Intention: ""
        },
        Leg4: {
          Symbol: "",
          Currency: "",
          Action: "",
          Quantity: 0,
          LimitPrice: 0,
          StopPrice: 0,
          Status: "",
          Type: "",
          ContractType: "",
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          OrderTime: 0,
          Intention: ""
        }
      }],
      TotalData: 0,
      TotalDataFiltered: 0
    }
    this.CurrentPage = 1;
    this.TotalPage = 1;
    this.ItemPerPage = 10;
    this.IsFirstPage = true;
    this.IsLastPage = true;
    this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
    this.SearchValue = "";
  }

  toggleCollapsedHistoricalOrder(historicalOrder: any){
    historicalOrder.isCollapsed = !historicalOrder.isCollapsed;
    this.isCollapsed = historicalOrder.isCollapsed;
  }

  updatePage(result: HistoricalOrderResult): void {
    this.HistoricalOrderResult = result;
    this.TotalPage = Math.ceil(this.HistoricalOrderResult.TotalData / this.ItemPerPage);
    this.IsFirstPage = this.CurrentPage === 1;
    this.IsLastPage = this.CurrentPage === this.TotalPage;
    this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
  }

  getHistoricalOrder(page: number, currentSortedColumn: any) {
    var requestObj: HistoricalOrderSearchRequest = {
      accountId: this.SelectedBrokerAccount.id,
      search: this.SearchValue,
      sort: currentSortedColumn.name,
      order: currentSortedColumn.type,
      offset: (page - 1) * 10,
      limit: 10,
    }
    this.HistoricalOrderService.getHistoricalOrders(this.SelectedBrokerAccount.brokerType, requestObj, 0)
      .subscribe(result => {
        this.isLoadingHistoricalOrder = false;
        if (result && result.Data) {
          this.updatePage(result);
        }
      });
  }
  search(){
    this.getHistoricalOrder(1, this.currentSortedColumn)
    console.log(this.SearchValue)
  }

  previousPage() {
    this.isLoadingHistoricalOrder = true;
    this.CurrentPage--;
    this.getHistoricalOrder(this.CurrentPage, this.currentSortedColumn);
  }

  nextPage() {
    this.isLoadingHistoricalOrder = true;
    this.CurrentPage++;
    this.getHistoricalOrder(this.CurrentPage, this.currentSortedColumn);
  }

  goToPage(pageNum: number) {
    this.isLoadingHistoricalOrder = true;
    this.CurrentPage = pageNum;
    this.getHistoricalOrder(this.CurrentPage, this.currentSortedColumn);
  }

  ngAfterViewInit() {
  }

  sortColumns(columnName: string, orderType: string){
    this.currentSortedColumn = {
      name: columnName,
      type: orderType
    }
    this.isLoadingHistoricalOrder = true;
    this.getHistoricalOrder(this.CurrentPage, this.currentSortedColumn);
  }

  searchHistoricalOrder(){
    this.isLoadingHistoricalOrder = true;
    this.getHistoricalOrder(1, this.currentSortedColumn);
  }

  ngOnInit(): void {
    this.isLoadingHistoricalOrder = true;
    this.getHistoricalOrder(1, this.currentSortedColumn);
  }

  

}