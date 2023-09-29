import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { debounceTime, delay, switchMap, tap, catchError, map, share, take } from 'rxjs/operators';
import { HistoricalPositionResult } from 'src/app/interface/historical-position-result';
import { Observable, EMPTY } from 'rxjs';
import { HistoricalPositionService } from './historical-position.service';
import { HistoricalPositionSearchRequest } from 'src/app/interface/historical-position-search-request';
import * as $ from 'jquery';
import { AccountSelection } from 'src/app/interface/account-selection';

@Component({
  selector: 'ow-main-trade-historicaltransactions-historicalposition-tab',
  templateUrl: './historical-position.component.html',
  styleUrls: ['./historical-position.component.css']
})
export class HistoricalPositionComponent implements OnInit {
  @Input() SelectedBrokerAccount!: AccountSelection;
  HistoricalPositionResult: HistoricalPositionResult;
  CurrentPage: number;
  TotalPage: number;
  ItemPerPage: number;
  IsFirstPage: boolean;
  IsLastPage: boolean;
  Pages: number[];
  isCollapsed: boolean = false;
  isLoadingHistoricalPosition = false;
  SearchValue :string;

  currentSortedColumn = {
    name: 'MaxExitTime',
    type: 'Desc'
  }

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private HistoricalPositionService: HistoricalPositionService
  ) {

    this.HistoricalPositionResult = {
      Data: [{
        isCollapsed: true,
        PortfolioId: 0,
        PortfolioName: "",
        Strategy: "",
        Direction: "",
        Underlying: "",
        AggregatedRealizedPL: 0,
        AggregatedNetPL: 0,
        MaxEntryTime: 0,
        MaxExitTime: 0,
        Leg1: {
          Symbol: "",
          Currency: "",
          Position: "",
          Quantity: 0,
          Entry: 0,
          Exit: 0,
          RealizedPL: 0,
          RealizedPLPct: 0,
          NetPL: 0,
          NetPLPct: 0,
          ContractType: 0,
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          EntryTime: 0,
          ExitTime: 0,
        },
        Leg2: {
          Symbol: "",
          Currency: "",
          Position: "",
          Quantity: 0,
          Entry: 0,
          Exit: 0,
          RealizedPL: 0,
          RealizedPLPct: 0,
          NetPL: 0,
          NetPLPct: 0,
          ContractType: 0,
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          EntryTime: 0,
          ExitTime: 0,
        },
        Leg3: {
          Symbol: "",
          Currency: "",
          Position: "",
          Quantity: 0,
          Entry: 0,
          Exit: 0,
          RealizedPL: 0,
          RealizedPLPct: 0,
          NetPL: 0,
          NetPLPct: 0,
          ContractType: 0,
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          EntryTime: 0,
          ExitTime: 0,
        },
        Leg4: {
          Symbol: "",
          Currency: "",
          Position: "",
          Quantity: 0,
          Entry: 0,
          Exit: 0,
          RealizedPL: 0,
          RealizedPLPct: 0,
          NetPL: 0,
          NetPLPct: 0,
          ContractType: 0,
          Expiry: "",
          StrikePrice: 0,
          Multiplier: 0,
          EntryTime: 0,
          ExitTime: 0,
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

  toggleCollapsedHistoricalPosition(historicalPosition: any){
    historicalPosition.isCollapsed = !historicalPosition.isCollapsed;
    this.isCollapsed = historicalPosition.isCollapsed;
  }

  updatePage(result: HistoricalPositionResult): void {
    this.HistoricalPositionResult = result;
    this.TotalPage = Math.ceil(this.HistoricalPositionResult.TotalData / this.ItemPerPage);
    this.IsFirstPage = this.CurrentPage === 1;
    this.IsLastPage = this.CurrentPage === this.TotalPage;
    this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
  }

  getHistoricalPosition(page:number, currentSortedColumn: any){
    var requestObj: HistoricalPositionSearchRequest = {
      accountId: this.SelectedBrokerAccount.id,
      search: this.SearchValue,
      sort: currentSortedColumn.name,
      order: currentSortedColumn.type,
      offset: (page - 1) * 10,
      limit: 10
    }
    this.HistoricalPositionService.getHistoricalPositions(this.SelectedBrokerAccount.brokerType, requestObj, 0)
      .subscribe(result=>{
        this.isLoadingHistoricalPosition = false;
        if (result && result.Data){
          this.updatePage(result);
        }
      });
  }
  search(){
    this.getHistoricalPosition(1, this.currentSortedColumn)
    console.log(this.SearchValue)
  }

  previousPage() {
    this.isLoadingHistoricalPosition = true;
    this.CurrentPage--;
    this.getHistoricalPosition(this.CurrentPage, this.currentSortedColumn);
  }

  nextPage() {
    this.isLoadingHistoricalPosition = true;
    this.CurrentPage++;
    this.getHistoricalPosition(this.CurrentPage, this.currentSortedColumn);
  }

  goToPage(pageNum: number) {
    this.isLoadingHistoricalPosition = true;
    this.CurrentPage = pageNum;
    this.getHistoricalPosition(this.CurrentPage, this.currentSortedColumn);
  }

  ngAfterViewInit() {
  }

  sortColumns(columnName: string, orderType: string){
    this.currentSortedColumn = {
      name: columnName,
      type: orderType
    }
    this.isLoadingHistoricalPosition = true;
    this.getHistoricalPosition(this.CurrentPage, this.currentSortedColumn);
  }

  searchHistoricalPosition(){
    this.isLoadingHistoricalPosition = true;
    this.getHistoricalPosition(1, this.currentSortedColumn);
  }

  ngOnInit(): void {
    this.isLoadingHistoricalPosition = true;
    this.getHistoricalPosition(1, this.currentSortedColumn);
  }

}