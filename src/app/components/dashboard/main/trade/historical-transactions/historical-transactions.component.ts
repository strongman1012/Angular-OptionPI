import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as $ from 'jquery';
import { AccountSelection } from 'src/app/interface/account-selection';

@Component({
  selector: 'ow-main-trade-historicaltransactions-tab',
  templateUrl: './historical-transactions.component.html',
  styleUrls: ['./historical-transactions.component.css']
})
export class HistoricalTransactionsComponent implements OnInit {
  @Input() SelectedBrokerAccount!: AccountSelection;

  currentTab = 'historical-position';

  constructor(
    private router: Router,
    private auth: AngularFireAuth
  ) { }

  ngOnInit(): void {

  }

  setTab(tabName: string){
    this.currentTab = tabName;
  }

}