import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { OptionsStrategy } from 'src/app/interface/options-strategy';
import { TargetVariable } from 'src/app/interface/target-variable';
import { UtilityService } from 'src/app/_service/utility.service';
import * as Highcharts from 'highcharts';
import { Options } from '@angular-slider/ngx-slider';
import { OptionsParameter } from 'src/app/interface/options-parameter';
import { AnalyticsService } from '../analytics.service';
import * as $ from 'jquery';
import * as moment from 'moment';

declare var window: any;
interface CustomChartClickEventObject extends Highcharts.ChartClickEventObject {
  point: Highcharts.Point;
}
@Component({
  selector: 'ow-analytic-path-diagram-tab',
  templateUrl: './path-diagram.component.html',
  styleUrls: ['./path-diagram.component.css']
})
export class PathDiagramComponent implements OnInit {
  ConfigForm: FormGroup;
  SelectedStrategy: OptionsStrategy;
  StrategyList: OptionsStrategy[];
  OptionParameterList: OptionsParameter[];
  TargetVariableList: TargetVariable[];
  ModalNumberDiagramX:number;
  ModalNumberDiagramY:number;
  formModal: any;
  yVal: any;
  ee:any;
  pathDiagramChartData_Input :any =[]
  @Input() isCollapsed!: any;
  @Input() UnderlyingPrice:string;

  Highcharts = Highcharts;
  isLoadingPathDiagramChart: boolean = false;
  pathDiagramChartOptions: any = {};
  pathDiagramChartUpdateFlag: boolean = false;
  getrequestObj:any;
  resultDotItem : any = {};
  pathDiagramChartData : any = [];
  pathDiagramChartData_init : any = [];
  StockPriceValue: number = 0;
  IVValue: number = 0;
  DayValue: number = 0;
  InputVal:any = '';
  StockPriceOptions: Options = {
    floor: -100,
    ceil: 100,
    step: 0.1,
    minLimit: 0,
    maxLimit: 1,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  }
  IVOptions: Options = {
    floor: 0,
    ceil: 1,
    step: 0.1,
    minLimit: 0,
    maxLimit: 1,
    showSelectionBar: true,
    translate: (value: number): string => {
      return value + '%';
    }
  }
  DayOptions: Options = {
    floor: 0,
    ceil: 1,
    step: 1,
    minLimit: 0,
    maxLimit: 1,
    showSelectionBar: true,
  }
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
  TimeToExpiryOptions: Options = {
    floor: 15,
    ceil: 90,
    step: 15,
    minLimit: 15,
    maxLimit: 90,
    showSelectionBar: true
  };
  IVSkewRateOptions: Options = {
    floor: 0,
    ceil: 2,
    step: 0.05,
    minLimit: 0,
    maxLimit: 2,
    showSelectionBar: true
  };

  addNewFormArray: any = [];

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private analyticsService: AnalyticsService

  ) {
    this.StrategyList = utilityService.getStrategySelections();
    this.SelectedStrategy = this.StrategyList[0];
    this.TargetVariableList = this.utilityService.getAnalyticsTargetVariables();
    this.ModalNumberDiagramX=0;
    this.ModalNumberDiagramY=0;
    this.getrequestObj = {
      Strategy: "IronCondor",
      Underlying: "AAPL",
      OptionContracts: "Iron Condor 2023-07-15 40|45|55|60",
      StockPrice: 156.5,
      IV: 0.1,
      DaysToExpiry: 5
  };
  
  
  this.UnderlyingPrice="";
    this.OptionParameterList = this.utilityService.getOptionParameters(this.StrategyList[0].Name);
    this.ConfigForm = this.formBuilder.group(
      {
        SelectedTargetVariable: [this.TargetVariableList[0]],
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
        IVSkewRate: 1
      }
    );

  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  initSidebarData(){
    this.StockPriceValue = 20;
    this.StockPriceOptions = {
      floor: -30,
      ceil: 30,
      step: 0.5,
      showSelectionBar: true,
      translate: (value: number): string => {
        return value + '%';
      }
    }

    this.IVValue = 30;
    this.IVOptions = {
      floor: 5,
      ceil: 90,
      step: 1,
      showSelectionBar: true,
      translate: (value: number): string => {
        return value + '%';
      }
    }

    this.DayValue = 20;
    this.DayOptions = {
      floor: 1,
      ceil: 25,
      step: 1,
      minLimit: 1,
      maxLimit: 25,
      showSelectionBar: true,
      readOnly:false
    }
  }

  initPathDiagramChart(pathDiagramChartData: any){

    this.pathDiagramChartOptions = {
      title: {
          text: ''
      },
      subtitle: {
          text: ''
      },
      xAxis: {
        title: {
          enabled: true,
          text: 'Days'
        },
        min: 1,
        max: 25,
        tickInterval: 1,
      },
      yAxis: {
        title: {
          enabled: false
        },
        min: 0,
        max:100,
        tickInterval: 20,
        labels: {
            format: '{value}%',
        }
      },
      plotOptions: {
        series: {
          events: {
            click: (event: CustomChartClickEventObject) => {
              // Handle the click event
                const clickedPointX = event.point.x;
                const clickedPointY = event.point.y;
                console.log(clickedPointX,'clickedPointX');
                console.log(clickedPointY,'clickedPointY');
              
            },
          },
        },
      },
      tooltip: {
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const xValue = this.x as number; // Assuming x-value is of number type
          const yValue = this.y as number; // Assuming y-value is of number type
          const ivValue = (this.point as any).IV;
          const stockprice = (this.point as any).StockPrice;
          const formattedYValue = yValue.toFixed(2); // Format y-value to 2 decimal places
          const formattedStockprice = stockprice.toFixed(2);
          const pointInfo = `Underlying Price:$ ${formattedStockprice}<br/>
                            IV: ${ivValue}%<br/>
                            Day: ${xValue}<br/>
                            Payoff:$ ${formattedYValue}<br/>`;
          
          // Add additional tooltip content as needed
         
          
          return pointInfo ;
        },
      },
      series: [{
          name: 'Stock Price',
          type: 'scatter',
          zoomType: 'xy',
          color: '#ECCB97',
          data: pathDiagramChartData,
          animation: {
            duration: 1000
          },
          dataLabels: false,
          showInLegend:false
      }],
      credits: {
        enabled: false
      }
    }
  }

  initAddNewFormInputs(){
    return {
      stockprice: {
        name: "stockprice",
        value: this.StockPriceValue,
        options: this.StockPriceOptions
      },
      IV: {
        name: "IV",
        value: this.IVValue,
        options: this.IVOptions
      },
      DayValue: {
        name: "DayValue",
        value: this.DayValue,
        options: this.DayOptions
      },
      Button :{
        name : "Confirm",
        active:false,
      }
    };
  }
  
  
  showModal(value1:number,value2:number){
    this.ModalNumberDiagramX = value1;
    this.ModalNumberDiagramY = value2;
    this.formModal.show();
  }
  onUserNameChange(addNewFormIndex: number):void{
    let id="#stockvalue"+ addNewFormIndex;
    this.addNewFormArray[addNewFormIndex].stockprice.value = $(id).val();
  }
  onIVChange(addNewFormIndex: number):void{
    let id="#ivvalue"+ addNewFormIndex;
    this.addNewFormArray[addNewFormIndex].IV.value = $(id).val();
  }
  onDayChange(addNewFormIndex: number):void{
    let id="#dayvalue"+ addNewFormIndex;
    this.addNewFormArray[addNewFormIndex].DayValue.value = $(id).val();
  }
  click_stockprice(value:number,addNewFormIndex: number, flag:string) : void{
    if(flag == 'plus'){
      let CalStockPriceValue = value + 0.5 ;
      this.addNewFormArray[addNewFormIndex].stockprice.value = CalStockPriceValue ;
    }
    else{
      let CalStockPriceValue = value - 0.5 ;
      this.addNewFormArray[addNewFormIndex].stockprice.value = CalStockPriceValue ;
    }
  }
  click_IVvalue(value:number,addNewFormIndex: number,flag:string) : void{
    if(flag == 'plus'){
      let CalIVValue = value + 1 ;
      this.addNewFormArray[addNewFormIndex].IV.value = CalIVValue ;

    }
    else{
      let CalIVValue = value - 1 ;
      this.addNewFormArray[addNewFormIndex].IV.value = CalIVValue ;

    }
  }
  click_DayValue(value:number,addNewFormIndex: number,flag:string) : void{
    if(flag == 'plus'){
      let CalDayValue = value + 1 ;
      this.addNewFormArray[addNewFormIndex].DayValue.value = CalDayValue ;

    }
    else{
      let CalDayValue = value - 1 ;
      this.addNewFormArray[addNewFormIndex].DayValue.value = CalDayValue ;

    }
  }
  ngOnInit(): void {
    
    this.analyticsService.GeneratePathDiagramChart(this.getrequestObj).subscribe(result => {
      this.yVal= result;
      let StockPrice_val:number= parseFloat(this.UnderlyingPrice) ;
      this.resultDotItem={
        x:this.getrequestObj.DaysToExpiry,
        y:this.yVal*10,
        StockPrice: StockPrice_val*120/100,
        IV:this.getrequestObj.IV,
        Index:0
      };
      this.pathDiagramChartData_init.push(this.resultDotItem);
      console.log(this.pathDiagramChartData_init,'pathDiagramChartData-first');
      this.initPathDiagramChart(this.pathDiagramChartData_init);
      this.initSidebarData();
  
      this.addNewFormArray.push(this.initAddNewFormInputs());
   });
    this.initPathDiagramChart([]);
  }

  addNewFormData(){
    this.addNewFormArray.push(this.initAddNewFormInputs());
  }

  removeNewFormData(addNewFormIndex: number){
    let DeleteIndex = addNewFormIndex + 1 ;
    this.pathDiagramChartData_Input =[];
    for(var i=0; i<this.pathDiagramChartData.length; i++){
      if(this.pathDiagramChartData[i].Index != DeleteIndex){
        this.pathDiagramChartData_Input.push(this.pathDiagramChartData[i])
      }
      else{
        this.pathDiagramChartData_Input.push({x:null,
          y:null,
          StockPrice:this.pathDiagramChartData[i].StockPrice,
          IV:this.pathDiagramChartData[i].IV,
          Index:this.pathDiagramChartData[i].Index});
      }
    }
    this.pathDiagramChartData = [];
    this.pathDiagramChartData = this.pathDiagramChartData_Input;
    this.initPathDiagramChart(this.pathDiagramChartData);
    let ID = "#popupID" + addNewFormIndex;
    $(ID).css('display','none');
    // this.addNewFormArray.splice(addNewFormIndex, 1);
    console.log(this.pathDiagramChartData,'pathDiagramChartData-confirm');
    
  }

   addNewFormSubmit(addNewFormIndex: number){
    if(this.addNewFormArray[addNewFormIndex].Button.name == "Confirm"){
      this.addNewFormArray[addNewFormIndex].DayValue.options = {
        floor: 1,
        ceil: 25,
        step: 1,
        minLimit: 1,
        maxLimit: 25,
        showSelectionBar: true,
        readOnly:true
      };
      this.addNewFormArray[addNewFormIndex].Button.active = true;
      console.log(this.addNewFormArray[addNewFormIndex].DayValue.options,'this.addNewFormArray[addNewFormIndex].DayValue.options')
    }
    let ButtonName = this.addNewFormArray[addNewFormIndex].Button.name ;
    this.addNewFormArray[addNewFormIndex].Button.name="Refresh";
    var submittedFormData = this.addNewFormArray[addNewFormIndex];
    this.getrequestObj = {
          Strategy: "IronCondor",
          Underlying: "AAPL",
          OptionContracts: "Iron Condor 2023-07-15 40|45|55|60",
          StockPrice: submittedFormData.stockprice.value,
          IV: submittedFormData.IV.value/100,
          DaysToExpiry: submittedFormData.DayValue.value
      };
     this.confirmAPI(ButtonName,addNewFormIndex);
     
  }
   confirmAPI(ButtonName: string, addNewFormIndex :number){
    this.analyticsService.GeneratePathDiagramChart(this.getrequestObj).subscribe(result => {
      console.log(result,'confirm-result-data');
      this.yVal= result;
      let num: number = parseFloat(this.UnderlyingPrice);
      let setIndex = addNewFormIndex + 1 ;
      this.resultDotItem={
        x:this.getrequestObj.DaysToExpiry,
        y:this.yVal*10,
        StockPrice:num*(this.getrequestObj.StockPrice + 100)/100 ,
        IV:this.getrequestObj.IV,
        Index: setIndex
      };
      if(ButtonName == "Refresh"){
        this.pathDiagramChartData_Input =[];
        for(var i=0; i<this.pathDiagramChartData.length; i++){
          if(this.pathDiagramChartData[i].Index != setIndex){
            this.pathDiagramChartData_Input.push(this.pathDiagramChartData[i])
          }
        }
        this.pathDiagramChartData = [];
        this.pathDiagramChartData = this.pathDiagramChartData_Input
        this.pathDiagramChartData.push(this.resultDotItem);
      }
      else{
        this.pathDiagramChartData.push(this.resultDotItem);
      }
      console.log(this.pathDiagramChartData,'pathDiagramChartData-confirm');
      this.initPathDiagramChart(this.pathDiagramChartData);
  
   });
    this.initPathDiagramChart([]);
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

  confirmConfigChange() {
    var targetVariable = this.ConfigForm.get('SelectedTargetVariable')?.value;
    var strategy = this.ConfigForm.get('SelectedStrategy')?.value;
    var parameter = this.ConfigForm.get('SelectedParameter')?.value;
    var legDistanceNew = this.ConfigForm.get('LegDistanceNew')?.value;
    var legDistanceFurther = this.ConfigForm.get('LegDistanceFurther')?.value;
    var timeToExpiry = this.ConfigForm.get('TimeToExpiry')?.value;
    var riskFreeRate = this.ConfigForm.get('RiskFreeRate')?.value;
    var dividendYield = this.ConfigForm.get('DividendYield')?.value;
    var ivSkewRate = this.ConfigForm.get('IVSkewRate')?.value;
    var amount = this.ConfigForm.get('Amount')?.value;

    var requestObj = {
      targetVariable: targetVariable.Name,
      strategy: strategy.Name,
      parameter: parameter.Name,
      legDistanceNew: legDistanceNew,
      legDistanceFurther: legDistanceFurther,
      timeToExpiry: timeToExpiry,
      riskFreeRate: riskFreeRate,
      dividendYield: dividendYield,
      ivSkewRate: ivSkewRate,
      amount: amount
    };

    console.log("Updating path diagram...", JSON.stringify(requestObj));

    // TODO: API Call
    this.isLoadingPathDiagramChart = true;
    setTimeout(() => {
      let pathDiagramChartData = [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
      [156.2, 60.0], [149.9, 46.8], [169.5, 57.3], [160.0, 64.1], [175.3, 63.6],
      [169.5, 67.3], [160.0, 75.5], [172.7, 68.2], [162.6, 61.4], [157.5, 76.8],
      [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]];
      this.initPathDiagramChart(pathDiagramChartData);
      this.pathDiagramChartOptions.series[0].data = pathDiagramChartData;
      this.isLoadingPathDiagramChart = false;
    }, 2000);
  }

}