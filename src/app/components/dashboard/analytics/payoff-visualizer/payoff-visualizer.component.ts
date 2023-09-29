import { Component, OnInit, Input } from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as Highcharts from 'highcharts';
import { Options } from '@angular-slider/ngx-slider';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsService } from '../analytics.service';

import { OptionsStrategy } from 'src/app/interface/options-strategy';
import { TargetVariable } from 'src/app/interface/target-variable';
import { UtilityService } from 'src/app/_service/utility.service';
import { OptionsParameter } from 'src/app/interface/options-parameter';
import * as moment from 'moment';
declare var window: any;
import * as $ from 'jquery';
import { visual_data } from './visuali_data';
interface CustomChartClickEventObject extends Highcharts.ChartClickEventObject {
  point: Highcharts.Point;
}
@Component({
  selector: 'ow-analytic-payoff-visualizer-tab',
  templateUrl: './payoff-visualizer.component.html',
  styleUrls: ['./payoff-visualizer.component.css'],
})
export class PayoffVisualizerComponent implements OnInit {
  ConfigForm: FormGroup;
  StrategyList: OptionsStrategy[];
  OptionParameterList: OptionsParameter[];
  TargetVariableList: TargetVariable[];
  ModalNumberVisual: number;
  daysToExpiry: number;
  // formModal: any;
  IVList: string[];
  StockPrice:number[];
  StockPrice_item: any = [];
  StockPrice_list: any = [];
  StockNumber: any = [];
  ivColor: any = [];
  payoffVisualizerChartSeriesData : any =[];
  // Checkbox_checked:string;
  payoffVisualObj: any = {};
  @Input() isCollapsed!: any;
  // isCollapsed = false;
  valueProperty :any ={};
  Highcharts = Highcharts;
  isLoadingPayoffVisualizerChart: boolean = false;
  payoffVisualizerChartOptions: any = {};
  // chart: any = {};
  payoffVisualizerChartUpdateFlag: boolean = false;

  LegDistanceNewOptions: Options = {
    floor: 2.5,
    ceil: 25,
    step: 0.1,
    minLimit: 2.5,
    maxLimit: 25,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    },
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
    },
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
    },
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
    },
  };
  TimeToExpiryOptions: Options = {
    floor: 15,
    ceil: 90,
    step: 15,
    minLimit: 15,
    maxLimit: 90,
    showSelectionBar: true,
  };
  IVSkewRateOptions: Options = {
    floor: 0,
    ceil: 2,
    step: 0.05,
    minLimit: 0,
    maxLimit: 2,
    showSelectionBar: true,
  };

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private analyticsService: AnalyticsService
  ) {
    this.StrategyList = utilityService.getStrategySelections();
    this.TargetVariableList = this.utilityService.getAnalyticsTargetVariables();
    this.OptionParameterList = this.utilityService.getOptionParameters(
      this.StrategyList[0].Name
    );
    this.ModalNumberVisual = 0;
    this.daysToExpiry = 1;
    this.IVList=[];
    this.StockPrice=[];
    // this.StockPrice_item= [];
    // this.StockPrice_list= [];
    // this.Checkbox_checked=this.IVList[0];
    this.ConfigForm = this.formBuilder.group({
      SelectedTargetVariable: [this.TargetVariableList[0]],
      SelectedStrategy: [this.StrategyList[0]],
      SelectedStock: [{}],
      SelectedExpiry: [''],
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
      IVSkewRate: 1,
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
  leftsetting():void{
    $('.PayOffVisualOne').toggleClass('showleft');
  }
  rightsetting():void{
    $('.PayOffVisualThree').toggleClass('showright');
  }
  initPayoffVisualizerChart(payoffVisualizerChartSeriesData111: any): void {
    this.payoffVisualizerChartOptions = {
      title: {
        text: '',
      },
      subtitle: {
        text: '',
      },
      xAxis: {
        labels: {
          enabled: true,
        },
      },
      yAxis: {
        title: {
          text:"PayOff"
        },
        min: 0,
        max: 100,
        tickInterval: 20,
        labels: {
          format: '{value}%',
        },
      },
      plotOptions: {
        series: {
          events: {
            click: (event: CustomChartClickEventObject) => {
              // Handle the click event
              if (event.point) {
                const clickedPoint = event.point.y;
                // this.showModal(clickedPoint);
                console.log('Clicked Point:', clickedPoint);
                // if (clickedPoint) this.showModal(clickedPoint);
              }
            },
          },
        },
      },

      series: payoffVisualizerChartSeriesData111,
      credits: {
        enabled: false,
      },
    };
    console.log(this.payoffVisualizerChartOptions,'3');
  }
   ngOnInit() : void {
    this.payoffVisualObj.Strategy = 'IronCondor';
    this.payoffVisualObj.Underlying = 'AAPL';
    this.payoffVisualObj.OptionContracts = 'Iron Condor 2023-07-15 40|45|55|60';
    this.payoffVisualObj.IVList = [0.1,0.15,0.25];
    this.payoffVisualObj.DaysToExpiry = 10;
    this.accessApi();
   
    const checkbox = document.getElementsByName("iv[]");
    checkbox.forEach((item: any)=>{
      this.StockNumber.push({
        color: item.getAttribute("data-color"),
        visible: false,
        showInLegend:false,
      })
    })
    // for(var i=0;i<22; i++){
    //   var obj={}; 
    //   this.StockNumber.push(obj);
    // }
    this.initPayoffVisualizerChart(this.StockNumber);
  
  }

  onStrategyChanged(selectedStrategy: OptionsStrategy) {
    if (selectedStrategy) {
      this.OptionParameterList = this.utilityService.getOptionParameters(
        selectedStrategy.Name
      );
      this.ConfigForm.patchValue({
        SelectedParameter: this.OptionParameterList[0],
      });
    } else {
      this.OptionParameterList = this.utilityService.getOptionParameters('');
      this.ConfigForm.patchValue({
        SelectedParameter: this.OptionParameterList[0],
      });
    }
  }
  onDrawwithIV(event: any) {
    // event.target.checked
    var checkboxes = document.getElementsByName('iv[]');
    var ivlist: number[] = [];
    // this.ivColor = [];
    this.payoffVisualizerChartSeriesData = [];
    checkboxes.forEach((item: any) => {
      
        var decimal = parseInt(item.id.replace('iv', ''));
        decimal = decimal / 100;
        if(item.checked)
        {
          ivlist.push(decimal);
          this.payoffVisualizerChartSeriesData.push({
            color: item.getAttribute("data-color"),
            visible: true,
            showInLegend:true,
            isSelect: decimal
          })
        }
       
        else
        this.payoffVisualizerChartSeriesData.push({
          color: item.getAttribute("data-color"),
          visible: false,
          showInLegend:false
        })
       
    });
// console.log(ivlist,"ivlist")
    this.payoffVisualObj.Strategy = 'IronCondor';
    this.payoffVisualObj.Underlying = 'AAPL';
    this.payoffVisualObj.OptionContracts = 'Iron Condor 2023-07-15 40|45|55|60';
    this.payoffVisualObj.IVList = ivlist;
    this.payoffVisualObj.DaysToExpiry = this.daysToExpiry;
    this.onChangeApi();
    // for(var i=0;i<22; i++){
    //   var obj={}; 
    //   this.StockNumber.push(obj);
    // }
    // this.initPayoffVisualizerChart(this.StockNumber);
  }
  
  onDraw(event: any) {
    var checkboxes = document.getElementsByName('iv[]');
    var ivlist: number[] = [];
    this.daysToExpiry = parseInt(event.target.id.replace('check', ''));
    this.payoffVisualizerChartSeriesData = [];

    checkboxes.forEach((item: any) => {
      var decimal = parseInt(item.id.replace('iv', ''));
      decimal = decimal / 100;
      if(item.checked){
        ivlist.push(decimal);
        this.payoffVisualizerChartSeriesData.push({
          color: item.getAttribute("data-color"),
          visible: true,
          showInLegend:true,
          isSelect: decimal
        })
      }
      
      else
      this.payoffVisualizerChartSeriesData.push({
        color: item.getAttribute("data-color"),
        visible: false,
        showInLegend:false
      })
    });
    // console.log(ivlist,'ivlist');
    this.payoffVisualObj.Strategy = 'IronCondor';
    this.payoffVisualObj.Underlying = 'AAPL';
    this.payoffVisualObj.OptionContracts = 'Iron Condor 2023-07-15 40|45|55|60';
    this.payoffVisualObj.IVList = ivlist;
    this.payoffVisualObj.DaysToExpiry = this.daysToExpiry;
    // console.log(this.payoffVisualObj);
    this.onChangeApi();
    // this.confirmConfigChange();
  }
  onChangeApi(){
    // console.log(this.ivColor[0].id,"this.ivColor.id")
    // this.isLoadingPayoffVisualizerChart = true;
    this.analyticsService
    .generatePayoffVisualizerChart(this.payoffVisualObj)
    .subscribe(
      (result) => {
      console.log(result, 'response');
      this.IVList=[];
      this.StockPrice=[];
      result.map((value,index)=>{
        const  IV_val=Object.keys(result[index])[0];
        this.IVList.push(IV_val);
      });
      console.log(this.IVList,"dddddddddddddddddddddddddd")
      this.IVList.map((item_val,index) => {
        var num = index + 1 ;
        this.StockPrice_item =[];
        this.valueProperty = result.find(item => item.hasOwnProperty(item_val));
        for(var i=0; i<this.valueProperty[item_val].length;i++){
          this.StockPrice_item.push(this.valueProperty[item_val][i].StockPrice)
        }


        this.payoffVisualizerChartSeriesData.map( (val: any, ind: number)=>{
          if(val.isSelect == item_val)
          {
            this.payoffVisualizerChartSeriesData[ind].name = 'Stock Price' + num;
            this.payoffVisualizerChartSeriesData[ind].type = 'spline';
            this.payoffVisualizerChartSeriesData[ind].data = this.StockPrice_item;
            this.payoffVisualizerChartSeriesData[ind].animation = {duration: 1000};
            this.payoffVisualizerChartSeriesData[ind].dataLabels = false;
          }
        });


        // var aaa={
        //   name: 'Stock Price' + num,
        //   type: 'spline',
        //   // color: this.ivColor[index].color,
        //   data: this.StockPrice_item,
        //   animation: {
        //     duration: 1000,
        //   },
        //   dataLabels: false,
        // }
        // this.payoffVisualizerChartSeriesData.push(aaa)
      })
      console.log(this.payoffVisualizerChartSeriesData,"aaaaaaaaaaaa")
      this.initPayoffVisualizerChart(this.payoffVisualizerChartSeriesData);

    });
  }
  accessApi(){
    this.analyticsService
      .generatePayoffVisualizerChart(this.payoffVisualObj)
      .subscribe((result) => {
        console.log(result, 'response22222222');

        this.IVList=[];
        this.StockPrice=[];
        result.map((value,index)=>{
          const  IV_val=Object.keys(result[index])[0];
          this.IVList.push(IV_val);
          // console.log(Object.values(value)[0].StockPrice,'stockprice');
        });
        this.StockPrice_list =[];
        this.IVList.map(item_val => {
          this.StockPrice_item =[];
          this.valueProperty = result.find(item => item.hasOwnProperty(item_val));
          for(var i=0; i<this.valueProperty[item_val].length;i++){
            this.StockPrice_item.push(this.valueProperty[item_val][i].StockPrice)
          }
          this.StockPrice_list.push(this.StockPrice_item)
          // console.log(this.valueProperty[item_val].length,'valueProperty_length');
          // console.log(this.valueProperty[item_val][1].StockPrice,'valueProperty');
        })
        var payoffVisualizerChartSeriesData =  [
          {
            name: 'Stock Price',
            type: 'spline',
            color: '#505dee',
            data: this.StockPrice_list[0],
            animation: {
              duration: 1000,
            },
            dataLabels: false,
            visible: true,
            showInLegend:true
          }
         
        ];
        console.log(payoffVisualizerChartSeriesData,"aaaaaaaaaaaa")
        this.initPayoffVisualizerChart(payoffVisualizerChartSeriesData);
                 

      });
  }
  confirmConfigChange() {
    // var targetVariable = this.ConfigForm.get('SelectedTargetVariable')?.value;
    // var strategy = this.ConfigForm.get('SelectedStrategy')?.value;
    // var parameter = this.ConfigForm.get('SelectedParameter')?.value;
    // var legDistanceNew = this.ConfigForm.get('LegDistanceNew')?.value;
    // var legDistanceFurther = this.ConfigForm.get('LegDistanceFurther')?.value;
    // var timeToExpiry = this.ConfigForm.get('TimeToExpiry')?.value;
    // var riskFreeRate = this.ConfigForm.get('RiskFreeRate')?.value;
    // var dividendYield = this.ConfigForm.get('DividendYield')?.value;
    // var ivSkewRate = this.ConfigForm.get('IVSkewRate')?.value;
    // var amount = this.ConfigForm.get('Amount')?.value;

    // var requestObj = {
    //   targetVariable: targetVariable.Name,
    //   strategy: strategy.Name,
    //   parameter: parameter.Name,
    //   legDistanceNew: legDistanceNew,
    //   legDistanceFurther: legDistanceFurther,
    //   timeToExpiry: timeToExpiry,
    //   riskFreeRate: riskFreeRate,
    //   dividendYield: dividendYield,
    //   ivSkewRate: ivSkewRate,
    //   amount: amount
    // };

    // console.log("Updating payoff visualizer...", JSON.stringify(requestObj));

    // TODO: API Call
    this.isLoadingPayoffVisualizerChart = true;
    setTimeout(() => {
      this.payoffVisualizerChartOptions.series[0].data = Array.from(
        { length: 10 },
        () => Math.random() * 100
      );
      this.payoffVisualizerChartOptions.series[1].data = Array.from(
        { length: 10 },
        () => Math.random() * 100
      );
      this.payoffVisualizerChartOptions.series[2].data = Array.from(
        { length: 10 },
        () => Math.random() * 100
      );
      this.isLoadingPayoffVisualizerChart = false;
    }, 300);
  }
}
