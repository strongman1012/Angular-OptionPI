import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsService } from './analytics.service';

import { ToastrService } from 'ngx-toastr';

import { DasboardService } from 'src/app/components/dashboard/dashboard.service';
declare var window: any;
declare var $: any;

@Component({
  selector: 'ow-analytics-tab',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  uid = '' as any;
  bradcrumb = '' as any;
  currentTab = 'heatmap';
  currentRoute: any = '';
  isCollapsed = false;
  getrequestObj:any;
  UnderlyingPrice: string;
  BundlePrice: string;
  AtmIV: string;
  DivYield: string;
  RiskFreeRate: string;
  resultdata:{};
  formModal: any;

  constructor(
    private dashboardService: DasboardService,
    private router: Router,
    private auth: AngularFireAuth,
    private modalService: NgbModal,
    private toast: ToastrService,
    private analyticsService: AnalyticsService,

  ) {

    this.currentRoute = this.router.url;
    this.getrequestObj = {
      strategy: "Iron Condor",
      underlying: "AAPL",
      optionContracts:  "AAPL230630C00165000",
    };
    this.resultdata={};
    
    this.UnderlyingPrice="";
    this.BundlePrice="";
    this.AtmIV="";
    this.DivYield="";
    this.RiskFreeRate="";
  
    this.bradcrumb = {
      title: 'Analytic',
      subtitle: '',
      data: [
        {
          name: 'Home',
          navigation: '/dashboard',
        },
        {
          name: 'Analytic',
          navigation: false,
        }
      ]
    }
  }

  setTab(tabName: string){
    this.currentTab = tabName;
  }
  menu_click(){
    $('.analytic-position').toggleClass('active');
  }
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
    // if (this.isCollapsed) {
    //   $('.SideBarMain').removeClass('active');
    //   $('.SideBarLft').removeClass('Addwidth');
    // } else {
    //   $('.SideBarMain').addClass('active');
    //   $('.SideBarLft').addClass('Addwidth');
    // }
  }

  ngOnInit(): void {
    this.analyticsService.GetMetricsForAnalyzeModelValuation(this.getrequestObj).subscribe(result => {
      this.UnderlyingPrice= result.UnderlyingPrice;
      this.BundlePrice=result.BundlePrice;
      this.AtmIV=result.AtmIV;
      this.DivYield=result.DivYield;
      this.RiskFreeRate=result.RiskFreeRate;
      // console.log(result,"response1234567898888888");
      // const result={
      //   GetUnderlyingPrice:"$"+"114.44",
      //   GetBundlePrice:"$"+"14.43",
      //   GetAtmIV:"0.97"+ "%",
      //   GetDivYield:"0.0036" + "%",
      //   GetRiskFreeRate:"0.0375" + "%",
      // }
      // console.log(this.result.UnderlyingPrice123)
      
      
     
   });
  //  this.formModal = new window.bootstrap.Modal(
  //   document.getElementById('myModalAnalytics')
  // );
  // this.formModal.show();
  }

}