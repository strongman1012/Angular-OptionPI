import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AccountSummary } from 'src/app/interface/account-summary';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CollectionReference, collectionGroup } from '@angular/fire/firestore';
import { FIRESTORE_REFERENCES } from 'src/app/core/firebase.module';
import { AccountSelection } from 'src/app/interface/account-selection';

@Component({
  selector: 'ow-main-trade-accountsummary-tab',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.css']
})
export class AccountSummaryComponent implements OnInit {
  AccountSummary: AccountSummary;
  AccountPositionSummary: any;
  RawInformation: any;
  firestore: any = AngularFirestore;

  @Input() SelectedBrokerAccount!: AccountSelection;

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private defaultFireStore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.TIGER_FIRESTORE) private readonly tigerFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.FUTU_FIRESTORE) private readonly futuFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.IB_FIRESTORE) private readonly ibFirestore: AngularFirestore,
  ) {
    this.AccountSummary = {
      Currency: "USD",
      NAV: 0,
      TradingLimit: 0,
      MarginUsed: 0,
      MarginAvailable: 0,
      UnrealizedPL: 0
    };
    this.AccountPositionSummary = {
      Currency: "USD",
      Long: {
        Allocation: 41536.11,
        AllocationPct: 0.2268,
        Exposure: 62313.88,
        ExposurePct: 0.3402
      },
      Short: {
        Allocation: 0.00,
        AllocationPct: 0.00,
        Exposure: 0.00,
        ExposurePct: 0.00
      }
    };
    this.RawInformation = {
      Currency: "USD",
      Fund: 0,
      AvailableToDeal: 0,
      Margin: 0
    };

    this.firestore = this.tigerFirestore;
  }

  ngOnChanges(changes: any) {
    if(this.SelectedBrokerAccount.brokerType === 'Tiger'){
      this.firestore = this.tigerFirestore;
    }
    if(this.SelectedBrokerAccount.brokerType === 'FUTU'){
      this.firestore = this.futuFirestore;
    }
    if(this.SelectedBrokerAccount.brokerType === 'Interactive Brokers'){
      this.firestore = this.ibFirestore;
    }
    this.getAccountInformation();
  }

  getAccountInformation(){
    var uid = "";
    if(this.SelectedBrokerAccount.brokerType === 'Tiger'){
      uid = localStorage.getItem('tiger-uid') || "";
    }
    if(this.SelectedBrokerAccount.brokerType === 'FUTU'){
      uid = localStorage.getItem('futu-uid') || "";
    }
    if(this.SelectedBrokerAccount.brokerType === 'Interactive Brokers'){
      uid = localStorage.getItem('ib-uid') || "";
    }

    if (uid) {
        const group$ = this.firestore.collection('users').doc(uid).collection('accounts').doc(this.SelectedBrokerAccount.id).valueChanges();
        group$.subscribe((doc: any) => {
          this.AccountSummary.Currency = doc.info.currency;
          this.AccountSummary.NAV = doc.info.equity;
          this.AccountSummary.TradingLimit = doc.info.tradingLimit;
          this.AccountSummary.MarginUsed = doc.info.margin;
          this.AccountSummary.MarginAvailable = doc.info.available;
          this.AccountSummary.UnrealizedPL = doc.info.unrealizedPL;
          this.RawInformation.Currency = doc.info.currency;
          this.RawInformation.Fund = doc.info.fund;
          this.RawInformation.AvailableToDeal = doc.info.available;
          this.RawInformation.Margin = doc.info.margin;
        });
    }
  }

  ngOnInit(): void {
      this.getAccountInformation();
  }

}