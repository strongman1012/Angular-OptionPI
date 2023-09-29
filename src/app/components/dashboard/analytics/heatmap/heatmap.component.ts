import { Component, OnInit, Input,ViewEncapsulation } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { OptionsStrategy } from 'src/app/interface/options-strategy';
import { UtilityService } from 'src/app/_service/utility.service';
import { OptionsParameter } from 'src/app/interface/options-parameter';
import { Options,  } from '@angular-slider/ngx-slider';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsService } from '../analytics.service';
import { data } from "./data";

import * as moment from 'moment';
import * as $ from 'jquery';
declare var window: any;
@Component({
  selector: 'ow-analytic-heatmap-tab',
  templateUrl: './heatmap.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./heatmap.component.css']
})


export class HeatMapComponent implements OnInit {
  
  HeatmapData: number[][];
  HeatmapColHeaders: number[];
  HeatmapRowHeaders: number[];
  AppliedUnitType: string;
  ModalNumber: number;
  formModal: any;
  StrategyList: OptionsStrategy[];
  OptionParameterList: OptionsParameter[];
  ConfigForm: FormGroup;
  getrequestObj:any;
  updaterequestObj:any;
  // timeexpiry:number[];
  
  LegDistanceNewOptions: Options = {
    floor: 2.5,
    ceil: 25,
    step: 0.1,
    minLimit: 2.5,
    maxLimit: 25,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  };
  LegDistanceFurtherOptions: Options = {
    floor: 2.5,
    ceil: 25,
    step: 0.1,
    minLimit: 2.5,
    maxLimit: 25,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  };
  TimeToExpiryOptions: Options = {
    floor: 15,
    ceil: 90,
    step: 15,
    minLimit: 15,
    maxLimit: 90,
    showSelectionBar: true
  };
  RiskFreeRateOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 2,
    minLimit: 0,
    maxLimit: 100,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  };
  DividendYieldOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 2,
    minLimit: 0,
    maxLimit: 100,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  };
  IVValueOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 5,
    minLimit: 15,
    maxLimit: 90,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  };
  IVSkewRateOptions: Options = {
    floor: 0,
    ceil: 2,
    step: 0.05,
    minLimit: 0,
    maxLimit: 2,
    showSelectionBar: true
  };
  
  @Input() isCollapsed!: any;

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private analyticsService: AnalyticsService,

  ) {
    // this.timeexpiry=[];
    // var defaultTimeToExpiry = this.timeexpiry.length;
    this.AppliedUnitType = "Standard";
    this.ModalNumber=0;
    this.getrequestObj = {};
    
    
    // this.HeatmapColHeaders = [...Array(defaultTimeToExpiry).keys()].map(i => i + 1);
    this.HeatmapColHeaders= [];
    // this.HeatmapRowHeaders = [...Array(50).keys()].map(i => i + 160);
    this.HeatmapRowHeaders = [];
    
   
    
    this.HeatmapData = Array(50);
    // this.HeatmapRowHeaders = [...Array(50).keys()].map(i => i + 160);
  
    
    this.StrategyList = utilityService.getStrategySelections();
    this.OptionParameterList = this.utilityService.getOptionParameters(this.StrategyList[0].Name);
    this.ConfigForm = this.formBuilder.group(
      {
        SelectedStrategy: [this.StrategyList[0]],
        SelectedStock: [{}],
        SelectedExpiry: [""],
        SelectedParameter: [this.OptionParameterList[0]],
        MaxLoss: [100],
        MaxGain: [300],
        Probability: [10],
        Amount: [2000],
        LegDistanceNew: [5],
        LegDistanceFurther: [20],
        TimeToExpiry: 30,
        RiskFreeRate: 2,
        DividendYield: 2,
        SelectedIVType: "Uniform",
        IVValue: 50,
        IVSkewRate: 1,
        SelectedUnitType: "Standard",
      }
    );
  }

  onStrategyChanged(selectedStrategy: OptionsStrategy) {
    if (selectedStrategy) {
      this.OptionParameterList = this.utilityService.getOptionParameters(selectedStrategy.Name);
      this.ConfigForm.patchValue({SelectedParameter: this.OptionParameterList[0]});
    } else {
      this.OptionParameterList = this.utilityService.getOptionParameters("");
      this.ConfigForm.patchValue({SelectedParameter: this.OptionParameterList[0]});
    }
  }

  onIVToggle(ivType: string) {
    this.ConfigForm.patchValue({SelectedIVType: ivType});
  }

  onUnitToggle(unitType: string) {
    this.ConfigForm.patchValue({SelectedUnitType: unitType});
  }

  confirmConfigChange() {
    // var strategy = this.ConfigForm.get('SelectedStrategy')?.value;
    // var parameter = this.ConfigForm.get('SelectedParameter')?.value;
    // var legDistanceNew = this.ConfigForm.get('LegDistanceNew')?.value;
    // var legDistanceFurther = this.ConfigForm.get('LegDistanceFurther')?.value;
    // var timeToExpiry = this.ConfigForm.get('TimeToExpiry')?.value;
    // var ivType = this.ConfigForm.get('SelectedIVType')?.value;
    // var ivSkewRate = this.ConfigForm.get('IVSkewRate')?.value;
    // var unitType = this.ConfigForm.get('SelectedUnitType')?.value;
    var riskFreeRate = this.ConfigForm.get('RiskFreeRate')?.value;
    var dividendYield = this.ConfigForm.get('DividendYield')?.value;
    var ivValue = this.ConfigForm.get('IVValue')?.value;
    var amount = this.ConfigForm.get('Amount')?.value;

    console.log(ivValue +"-"+ riskFreeRate + "-" + dividendYield + "-" + amount,"getSuccess");
    // var requestObj = {
    //   strategy: strategy.Name,
    //   parameter: parameter.Name,
    //   legDistanceNew: legDistanceNew,
    //   legDistanceFurther: legDistanceFurther,
    //   timeToExpiry: timeToExpiry,
    //   riskFreeRate: riskFreeRate,
    //   dividendYield: dividendYield,
    //   ivType: ivType,
    //   ivValue: ivValue,
    //   ivSkewRate: ivSkewRate,
    //   amount: amount,
    //   unitType: unitType
    // };

    // console.log("Updating heatmap...", JSON.stringify(requestObj));
    
     this.updaterequestObj = {
      Strategy: "IronCondor",
      Underlying: "AAPL",
      OptionContracts: "Iron Condor 2023-07-15 40|45|55|60",
      IV:ivValue ,
      DivYield: dividendYield,
      Capital: amount,
      RiskFreeRate: riskFreeRate
    }
    this.analyticsService.ComputeHeatmap(this.updaterequestObj).subscribe(result => {
      console.log(result,"resultcompute");
      result.sort((a, b) => a.StockPrice - b.StockPrice);
      // this.timeexpiry=[...new Set(result.map(item => item.Days))];
      // console.log(timeexpiry.length,'timeexpiry');
      // var defaultTimeToExpiry = this.timeexpiry.length;
      this.HeatmapColHeaders =[...new Set(result.map(item => item.Days))];
      this.HeatmapRowHeaders=[...new Set(result.map(item => item.StockPrice))];
      // result.map((value)=>{
      //   this.HeatmapRowHeaders.push(value.StockPrice);
      // });
      const rows = this.HeatmapRowHeaders.length;
      // console.log("12345678901234567890");
      for (var i = 0; i < rows; i++) {
        this.HeatmapData[i] = [];
        for (var j = 0; j < this.HeatmapColHeaders.length; j++) {
          for(var z=0; z<result.length; z++ ){
            if(this.HeatmapRowHeaders[i] === result[z].StockPrice && this.HeatmapColHeaders[j] === result[z].Days){
              this.HeatmapData[i][j]= result[z].Payoff;
            }
        }
          // this.HeatmapData[i][j] = (this.HeatmapRowHeaders[i] === result[i].StockPrice && this.HeatmapColHeaders[j] === result[i].Days ? result[i].Payoff : 0);
        }
      }
      // console.log(result,"response12345677777777")
   });
   
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
  showModal(value:number){
    // alert(value);
    this.ModalNumber = value;
    this.formModal.show();
    // document.getElementById("modal_number").val
    // this.modalService.open(content, { size: 'lg' });
    //console.log(value),'this is nubmer');

  }
  getColorValue(value: number) {
    let color_val;
    if(value>=0 && value<=9){
      color_val = "rgb(248,105,107)";
    }else if(value>=10 && value <=19){
      color_val = "rgb(249,139,142)";
    }else if(value>=20 && value <=29){
      color_val = "rgb(251,206,179)";
    }else if(value>=30 && value <=39){
      color_val = "rgb(253,226,177)";
    }else if(value>=40 && value <=49){
      color_val = "rgb(255,235,132)";
    }else if(value>=50 && value <=59){
      color_val = "rgb(209,217,131)";
    }else if(value>=60 && value <=69){
      color_val = "rgb(178,211,137)";
    }else if(value>=70 && value <=79){
      color_val = "rgb(141,207,158)";
    }else if(value>=80 && value <=89){
      color_val = "rgb(122,200,142)";
    }else{
      color_val = "rgb(99,190,123)";
    }
    return color_val;
    
  }

  ngAfterViewInit(){
    // $(".range-example-input").asRange({
    //   range: false,
    //   limit: false
    // });
  }

  ngOnInit(): void {
    this.getrequestObj = {
      "Strategy": "IronCondor",
      "Underlying": "AAPL",
      "OptionContracts": "Iron Condor 2023-07-15 40|45|55|60",
      "IV": 0.25,
      "RiskFreeRate": 0.02,
      "DivYield": 0.1,
      "Capital": 10000
  };
  
    this.analyticsService.ComputeHeatmap(this.getrequestObj).subscribe(result => {
      console.log(result, 'getheatmap123');
      result.sort((a, b) => a.StockPrice - b.StockPrice);
      // this.timeexpiry=[...new Set(result.map(item => item.Days))];
      // console.log(timeexpiry.length,'timeexpiry');
      // var defaultTimeToExpiry = this.timeexpiry.length;
      this.HeatmapColHeaders=[...new Set(result.map(item => item.Days))];
      console.log([...new Set(result.map(item => item.StockPrice))],"headerRow")
      // result.map((val)=>{
      //   this.HeatmapRowHeaders.push(val.StockPrice);
      // });
      this.HeatmapRowHeaders = [...new Set(result.map(item => item.StockPrice))];
      const rows = this.HeatmapRowHeaders.length;
      console.log(this.HeatmapRowHeaders[0],'5555555555555555')
        for (var i = 0; i < rows; i++) {
          this.HeatmapData[i] = [];
          for (var j = 0; j < this.HeatmapColHeaders.length; j++) {
            for(var z=0; z<result.length; z++ ){
              if(this.HeatmapRowHeaders[i] === result[z].StockPrice && this.HeatmapColHeaders[j] === result[z].Days){
                this.HeatmapData[i][j]= result[z].Payoff;
              }
              // this.HeatmapData[i][j] = (this.HeatmapRowHeaders[i] === result[z].StockPrice && this.HeatmapColHeaders[j] === result[z].Days ? result[z].Payoff : 0);
    
          }
        }
      }
      
      // console.log(result,"response12344444")
   });
    this.formModal = new window.bootstrap.Modal(
      document.getElementById('myModal')
    );
  }

}
