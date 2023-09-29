import { Component, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BackOfficeService } from 'src/app/components/dashboard/main/backOffice/backOffice.service';
import { pipe } from 'rxjs';

@Component({
  selector: 'ow-main-backOffice-tab',
  templateUrl: './backOffice.component.html',
  styleUrls: ['./backOffice.component.css']
})
export class BackOfficeComponent implements OnInit {

  @Input() currentTab: string = 'activeOrder';
  deleteBy: string;
  deleteOrderPositionValue: string;
  deleteGroupType: string;
  addGroupType: string;
  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private backOfficeService: BackOfficeService
  ) {

    this.deleteBy = "id";
    this.deleteOrderPositionValue = "activeOrder";
    this.deleteGroupType = "activeOrder";
    this.addGroupType = "activeOrder";
  }

  setTab(tabName: string) {
    this.currentTab = tabName;
  }
  setDeleteGroupType(name: string) {
    this.deleteGroupType = name;
  }
  setAddGroupType(name: string) {
    this.addGroupType = name;
  }
  setDeleteOrderPosition(name: string) {
    this.deleteOrderPositionValue = name;
  }
  addGroup() {
    let userId = $('#addGroupForm input[name="userId"]').val() as string;
    let accountNumber = $('#addGroupForm input[name="accountNumber"]').val() as string;
    let orderId = $('#addGroupForm input[name="groupId"]').val() as string;
    let strategy = $('#addGroupForm input[name="strategy"]').val() as string;
    console.log("adding group with userId ={0}, accountNumber = {1}, orderId = {2}",
      userId, accountNumber, orderId, this.addGroupType, strategy)

    
    if (this.deleteOrderPositionValue == "activeOrder") {
      var requestObj = {
        userId,
        accountNumber,
        orderId: [orderId],
        strategy
      }
      this.backOfficeService.addOrderGroup(requestObj);
    } else {
      var requestObj2 = {
        userId,
        accountNumber,
        strategy,
        symbol: "AAPL"
      }
      this.backOfficeService.addPositionGroup(requestObj2);
    }
  }
  addActiveOrder() {
    var data = $('#addActiveOrderForm').serializeArray();
    var requestObj: any = {}
    for (var i = 0; i < data.length; i++) {
      requestObj[data[i]['name']] = data[i]['value'];
    }
    requestObj['orderTime'] =  new Date(requestObj['orderTime']).getTime()
    requestObj['tradeTime'] =  new Date(requestObj['tradeTime']).getTime()
    console.log(requestObj);
    this.backOfficeService.addActiveOrder(requestObj, requestObj['userId'], requestObj['accountNumber']);
  }
  deleteOrderPosition() {
    let userId = $('#deleteOrderPositionForm input[name="userId"]').val() as string;
    let accountNumber = $('#deleteOrderPositionForm input[name="accountNumber"]').val() as string;
    let orderId = $('#deleteOrderPositionForm input[name="orderId"]').val() as string;
    console.log("Deleting order/position with userId ={0}, accountNumber = {1}, orderId = {2} ",
      userId, accountNumber, orderId, this.deleteOrderPositionValue)

    if (this.deleteOrderPositionValue == "activeOrder") {
      this.backOfficeService.DeleteActiveOrder(userId, accountNumber, orderId);
    } else {
      this.backOfficeService.deleteOpenPosition(userId, accountNumber, orderId);
    }
  }

  deleteGroup() {
    let userId = $('#deleteGroupForm input[name="userId"]').val() as string;
    let accountNumber = $('#deleteGroupForm input[name="accountNumber"]').val() as string;
    let orderId = $('#deleteGroupForm input[name="groupId"]').val() as string;
    console.log("Deleting group with userId ={0}, accountNumber = {1}, orderId = {2}",
      userId, accountNumber, orderId, this.deleteGroupType, this.deleteBy)
    return
    if (this.deleteGroupType == "activeOrder") {
      if (this.deleteBy == "id") this.backOfficeService.deleteOrderGroupById(userId, accountNumber, orderId);
      else this.backOfficeService.deleteOrderGroup(userId, accountNumber);

    } else if (this.deleteGroupType == "openPosition") {
      if (this.deleteBy == "id") this.backOfficeService.deletePositionGroupById(userId, accountNumber, orderId);
      else this.backOfficeService.deletePositionGroup(userId, accountNumber);

    } else {
      if (this.deleteBy == "id") this.backOfficeService.deleteRevPositionMapById(userId, accountNumber, orderId);
      else this.backOfficeService.deleteRevPositionMap(userId, accountNumber);
    }
  }

  ngOnInit(): void {

    //setTimeout(() => {
    //Set this after API call completed to switch the main tabs
    //this.currentMainTab.emit('screener');
    //}, 3000);

  }

}