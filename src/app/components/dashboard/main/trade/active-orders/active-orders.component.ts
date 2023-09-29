import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CollectionReference, collectionGroup, query, orderBy, startAfter, limit } from '@angular/fire/firestore';
import { ActiveOrderGroupEntry } from 'src/app/interface/active-order-group-entry';
import { ActiveOrderLegEntry } from 'src/app/interface/active-order-leg-entry';
import { TradeService } from 'src/app/_service/trade.service';
import { FIRESTORE_REFERENCES } from 'src/app/core/firebase.module';
import * as $ from 'jquery';
import { AccountSelection } from 'src/app/interface/account-selection';

@Component({
  selector: 'ow-main-trade-activeorders-tab',
  templateUrl: './active-orders.component.html',
  styleUrls: ['./active-orders.component.css']
})
export class ActiveOrdersComponent implements OnInit {
  @Input() SelectedBrokerAccount!: AccountSelection;
  firestore: any = AngularFirestore;
  ActiveOrderList: Record<number, ActiveOrderGroupEntry>;
  isCollapsed: boolean = false;
  isLoadingActiveOrders: boolean = false;

  OrderToCancel: any;
  OrderToRecompute: any;
  OrderToResubmit: any;
  CurrentPage: number;
  TotalPage: number;
  ItemPerPage: number;
  IsFirstPage: boolean;
  IsLastPage: boolean;
  Pages: number[];

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private tradeService: TradeService,
    private defaultFireStore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.TIGER_FIRESTORE) private readonly tigerFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.FUTU_FIRESTORE) private readonly futuFirestore: AngularFirestore,
    @Inject(FIRESTORE_REFERENCES.IB_FIRESTORE) private readonly ibFirestore: AngularFirestore,
  ) {
    this.ActiveOrderList = {};
    this.OrderToCancel = {};
    this.OrderToRecompute = {};
    this.OrderToResubmit = {};
    this.CurrentPage = 1;
    this.TotalPage = 1;
    this.ItemPerPage = 10;
    this.IsFirstPage = true;
    this.IsLastPage = true;
    this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);

    this.firestore = this.tigerFirestore;
  }

  submitCancel(activeOrder: any): void {
    console.log("Submit cancel strategy order...", JSON.stringify(activeOrder));
    this.OrderToCancel = activeOrder;
  }

  submitRecompute(activeOrder: any): void {
    console.log("Recompute strategy order...", JSON.stringify(activeOrder));
    this.OrderToRecompute = activeOrder;
  }

  submitResubmit(activeOrder: any): void {
    console.log("Resubmit strategy order...", JSON.stringify(activeOrder));
    this.OrderToResubmit = activeOrder;
  }

  confirmCancelStrategyOrder(): void {
    let requestObj = {
      AccountId: this.SelectedBrokerAccount.id,
      Broker: this.SelectedBrokerAccount.brokerType,
      GroupId: this.OrderToCancel.groupId
    };

    console.log("Confirm cancel strategy order...", JSON.stringify(requestObj));
    this.tradeService.cancelStrategyOrder(requestObj).subscribe();
  }

  confirmRecomputeOrder(): void {
    let requestObj = {
      AccountId: this.SelectedBrokerAccount.id,
      GroupId: this.OrderToRecompute.groupId
    };

    console.log("Confirm recompute strategy order...", JSON.stringify(requestObj));
  }

  confirmResubmitOrder(): void {
    let requestObj = {
      AccountId: this.SelectedBrokerAccount.id,
      GroupId: this.OrderToResubmit.groupId
    };

    console.log("Confirm resubmit strategy order...", JSON.stringify(requestObj));
  }

  toggleCollapsedActiveOrder(activeOrder: any) {
    activeOrder.value.isCollapsed = !activeOrder.value.isCollapsed;
    this.isCollapsed = !activeOrder.value.isCollapsed;
  }

  ngAfterViewInit() {
    // $('tr.OnClickAdd td.AddPlus').click(function(){
    //   $(this).toggleClass('added');
    //   $(this).parent().next('tr.showhide').slideToggle();
    // });
  }

  previousPage() {
    this.CurrentPage--;
    this.getActiveOrders(this.CurrentPage);
  }

  nextPage() {
    this.CurrentPage++;
    this.getActiveOrders(this.CurrentPage);
  }

  goToPage(pageNum: number) {
    this.CurrentPage = pageNum;
    this.getActiveOrders(this.CurrentPage);
  }

  checkIsEmptyObject(objectValue: any) {
    return Object.keys(objectValue).length === 0;
  }

  getActiveOrders(page: number) {
    this.isLoadingActiveOrders = true;

    if (this.firestore) {
      switch (this.SelectedBrokerAccount.brokerType) {
        case 'Interactive Brokers':
          this.getActiveOrdersIb(page);
          break;
        case 'FUTU':
          this.getActiveOrdersFutu(page);
          break;
        case 'Tiger':
          this.getActiveOrdersTiger(page);
          break;
      }
    }
  }

  getActiveOrdersIb(page: number) {
    this.isLoadingActiveOrders = true;
    var uid = localStorage.getItem('ib-uid') || "";

    if (uid) {
      var offset = (page - 1) * this.ItemPerPage;
      if (offset > 0) offset += 1;
      const group$ = this.firestore.collection('users').doc(uid).collection('groups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id,
          (ref: { orderBy: (arg0: string) => { (): any; new(): any; startAfter: { (arg0: number): { (): any; new(): any; limit: { (arg0: number): any; new(): any; }; }; new(): any; }; }; }) => ref.orderBy("groupId").startAfter(offset).limit(this.ItemPerPage)).valueChanges();
      //const group$ = this.firestore.collection('users').doc(uid).collection('groups').valueChanges();
      group$.subscribe((doc: any) => {
        this.ActiveOrderList = {};
        doc.forEach((coll: any) => {
          const emptyLeg: { [key: number]: ActiveOrderLegEntry } = {};
          // Add to dictionary
          this.ActiveOrderList[coll.groupId] = {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: emptyLeg,
            product: coll.product,
            intention: coll.intention
          };
          Object.keys(coll.legs).forEach((legId: any) => {
            const leg$ = this.firestore.collection('users').doc(uid).collection('combolegs')
              .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
              .doc(coll.legs[legId].toString()).valueChanges();
            leg$.subscribe((doc2: any) => {
              if (doc2 && doc2.hasOwnProperty('brokerOrderId')) {
                this.ActiveOrderList[coll.groupId].legs[legId] = doc2;
                this.ActiveOrderList[coll.groupId].legs[legId].orderTime *= 1000; // Unix milisecond

                const activeOrder$ = this.firestore.collection('users').doc(uid).collection('activeOrders')
                  .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.brokerOrderId).valueChanges();
                activeOrder$.subscribe((doc3: any) => {
                  this.ActiveOrderList[coll.groupId].legs[legId].orderStatus = doc3.orderStatus; // Unix milisecond
                });
              }
              //console.log(JSON.stringify(doc2));
            });
          });
        });
        this.isLoadingActiveOrders = false;
        //console.log(typeof this.ActiveOrderList);
        //console.log(JSON.stringify(doc));
      });
    }
  }

  getActiveOrdersFutu(page: number) {
    this.isLoadingActiveOrders = true;
    var uid = localStorage.getItem('futu-uid') || "";

    if (uid) {
      var offset = (page - 1) * this.ItemPerPage;
      if (offset > 0) offset += 1;
      const group$ = this.firestore.collection('users').doc(uid).collection('groups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id,
          (ref: { orderBy: (arg0: string) => { (): any; new(): any; startAfter: { (arg0: number): { (): any; new(): any; limit: { (arg0: number): any; new(): any; }; }; new(): any; }; }; }) => ref.orderBy("groupId").startAfter(offset).limit(this.ItemPerPage)).valueChanges();
      //const group$ = this.firestore.collection('users').doc(uid).collection('groups').valueChanges();
      group$.subscribe((doc: any) => {
        this.ActiveOrderList = {};
        doc.forEach((coll: any) => {
          const emptyLeg: { [key: number]: ActiveOrderLegEntry } = {};
          // Add to dictionary
          this.ActiveOrderList[coll.groupId] = {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: emptyLeg,
            product: coll.product,
            intention: coll.intention
          };
          Object.keys(coll.legs).forEach((legId: any) => {
            const leg$ = this.firestore.collection('users').doc(uid).collection('legs')
              .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
              .doc(coll.legs[legId].toString()).valueChanges();
            leg$.subscribe((doc2: any) => {
              if (doc2 && this.SelectedBrokerAccount.brokerType == "FUTU") {
                const activeOrder$ = this.firestore.collection('users').doc(uid).collection('activeOrders')
                  .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id,
                    (ref: any) => ref.where('legId', '==', doc2.id)).valueChanges();
                activeOrder$.subscribe((doc3: any) => {
                  this.ActiveOrderList[coll.groupId].legs[legId] = doc3[0];
                  //console.log(JSON.stringify(doc3));
                });
              } else if (doc2) {
                const activeOrder$ = this.firestore.collection('users').doc(uid).collection('activeOrders')
                  .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.brokerOrderId).valueChanges();
                activeOrder$.subscribe((doc3: any) => {
                  this.ActiveOrderList[coll.groupId].legs[legId] = doc3;
                  //console.log(this.ActiveOrderList);
                  //console.log(JSON.stringify(doc3));
                });
              }
              //console.log(JSON.stringify(doc2));
            });
          });
        });
        this.isLoadingActiveOrders = false;
        //console.log(typeof this.ActiveOrderList);
        //console.log(JSON.stringify(doc));
      });
    }
  }

  getActiveOrdersTiger(page: number) {
    this.isLoadingActiveOrders = true;
    var uid = localStorage.getItem('tiger-uid') || "";

    if (uid) {
      var offset = (page - 1) * this.ItemPerPage;
      if (offset > 0) offset += 1;
      const group$ = this.firestore.collection('users').doc(uid).collection('groups')
        .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id,
          (ref: { orderBy: (arg0: string) => { (): any; new(): any; startAfter: { (arg0: number): { (): any; new(): any; limit: { (arg0: number): any; new(): any; }; }; new(): any; }; }; }) => ref.orderBy("groupId").startAfter(offset).limit(this.ItemPerPage)).valueChanges();
      //const group$ = this.firestore.collection('users').doc(uid).collection('groups').valueChanges();
      group$.subscribe((doc: any) => {
        this.ActiveOrderList = {};
        doc.forEach((coll: any) => {
          const emptyLeg: { [key: number]: ActiveOrderLegEntry } = {};
          // Add to dictionary
          this.ActiveOrderList[coll.groupId] = {
            isCollapsed: true,
            groupId: coll.groupId,
            strategy: coll.strategy,
            legs: emptyLeg,
            product: coll.product,
            intention: coll.intention
          };
          Object.keys(coll.legs).forEach((legId: any) => {
            if (this.SelectedBrokerAccount.brokerType === 'Interactive Brokers') {
              const leg$ = this.firestore.collection('users').doc(uid).collection('combolegs')
                .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
                .doc(coll.legs[legId].toString()).valueChanges();
              leg$.subscribe((doc2: any) => {
                if (uid) {
                  if (doc2 && doc2.hasOwnProperty('brokerOrderId')) {
                    this.ActiveOrderList[coll.groupId].legs[legId] = doc2;
                    this.ActiveOrderList[coll.groupId].legs[legId].orderTime *= 1000; // Unix milisecond

                    const activeOrder$ = this.firestore.collection('users').doc(uid).collection('activeOrders')
                      .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.brokerOrderId).valueChanges();
                    activeOrder$.subscribe((doc3: any) => {
                      this.ActiveOrderList[coll.groupId].legs[legId].orderStatus = doc3.orderStatus; // Unix milisecond
                    });
                  }
                }
                //console.log(JSON.stringify(doc2));
              });
            }
            else {
              const leg$ = this.firestore.collection('users').doc(uid).collection('legs')
                .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id)
                .doc(coll.legs[legId].toString()).valueChanges();
              leg$.subscribe((doc2: any) => {
                if (uid) {
                  if (doc2 && this.SelectedBrokerAccount.brokerType == "FUTU") {
                    const activeOrder$ = this.firestore.collection('users').doc(uid).collection('activeOrders')
                      .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id,
                        (ref: any) => ref.where('legId', '==', doc2.id)).valueChanges();
                    activeOrder$.subscribe((doc3: any) => {
                      this.ActiveOrderList[coll.groupId].legs[legId] = doc3[0];
                      //console.log(JSON.stringify(doc3));
                    });
                  } else if (doc2) {
                    const activeOrder$ = this.firestore.collection('users').doc(uid).collection('activeOrders')
                      .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id).doc(doc2.brokerOrderId).valueChanges();
                    activeOrder$.subscribe((doc3: any) => {
                      this.ActiveOrderList[coll.groupId].legs[legId] = doc3;
                      //console.log(this.ActiveOrderList);
                      //console.log(JSON.stringify(doc3));
                    });
                  }
                }
                //console.log(JSON.stringify(doc2));
              });
            }
          });
        });
        this.isLoadingActiveOrders = false;
        //console.log(typeof this.ActiveOrderList);
        //console.log(JSON.stringify(doc));
      });
    }
  }

  updatePage() {
    var uid = "";
    if (this.SelectedBrokerAccount.brokerType === 'Tiger') {
      uid = localStorage.getItem('tiger-uid') || "";
    }
    if (this.SelectedBrokerAccount.brokerType === 'FUTU') {
      uid = localStorage.getItem('futu-uid') || "";
    }
    if (this.SelectedBrokerAccount.brokerType === 'Interactive Brokers') {
      uid = localStorage.getItem('ib-uid') || "";
    }
    if (uid) {
      if (this.firestore) {
        const test = this.firestore.collection('users').doc(uid).collection('groups')
          .doc(this.SelectedBrokerAccount.id).collection(this.SelectedBrokerAccount.id,
            (ref: { orderBy: (arg0: string) => any; }) => ref.orderBy("groupId")).valueChanges();
        test.subscribe((result: string | any[]) => {
          this.TotalPage = Math.ceil(result.length / this.ItemPerPage);
          this.IsFirstPage = this.CurrentPage === 1;
          this.IsLastPage = this.CurrentPage === this.TotalPage;
          this.Pages = Array.from({ length: this.TotalPage }, (v, k) => k + 1);
          //console.log(result);
        });
      }
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
    this.getActiveOrders(this.CurrentPage);
  }

  ngOnInit(): void {
    this.getActiveOrders(1);
    this.updatePage();

  }

}