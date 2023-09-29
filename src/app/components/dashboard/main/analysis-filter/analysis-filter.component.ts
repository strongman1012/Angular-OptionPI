import { UtilityService } from 'src/app/_service/utility.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AnalysisFilter } from 'src/app/interface/analysis-filter';
@Component({
  selector: 'app-analysis-filter',
  templateUrl: './analysis-filter.component.html',
  styleUrls: ['./analysis-filter.component.css']
})
export class AnalysisFilterComponent implements OnInit {

  @Input() item:string;
  @Input() SelectedAnalysisFilterList:AnalysisFilter[];

  @Output() selectedAnalysisFilterListChange = new EventEmitter<any[]>();

  StartDateList: number[];     //0-99 step 1 
  EndDateList: number[];       //1-100 step 1
  StockMinDataList: number[];  //max 19 step 1
  StockMaxDataList: number[];  //max 20 step 1
  IndexList: any[];            //Index S&P 500...    
  DecimalList: any[];     
  ErrorRangeList: any[]; 
  StepNumberList: any[];       //max 100 step 5
  VolatilityList: any[];       //max 70 step 5

  analysisFilterFundamental: any = {
    priceToEarning: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 0,
      endDate: 20,
      indexValue:'S&P 500',
      value:'positive',
    },
    priceToBook: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 0,
      endDate: 20,
      indexValue:'S&P 500',
    },
    priceToSales: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 0,
      endDate: 20,
      indexValue:'S&P 500',
    },
    priceToEarningGrowth: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 0,
      endDate: 20,
      indexValue:'S&P 500',
      value:'positive',
    },
    priceToSalesGrowth: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 0,
      endDate: 20,
      indexValue:'S&P 500',
      value:'positive',
    },
    zScore: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 0,
      endDate: 20,
      indexValue:'S&P 500',
    },
    analystRating: {
      isOptionsVisible: false,
      operator:'between',
      startDate: 1,
      endDate: 5,
    },
  }

  analysisFilterEvent: any = {
    analystUpdate:{
      stockRating:'Upgrade',
      isOptionsVisible:false,
    },
    earningEvent:{
      earningRelease:'Longer',
      period:5,
      isOptionsVisible:false,
    },
    news:{
      sentiment:'positive',
      isOptionsVisible:false,
    },
    volumeBreakout:{
      multiplier:2.5,
      period:5,
      isOptionsVisible:false,
    },
    putCallRatioBreakout:{
      multiplier:2.5,
      period:5,
      isOptionsVisible:false,
    },
  }
  
  analysisFilterTechnical: any = {
    maAnalysis:{
      isOptionsVisible:false,
      analyse:'price',
      shorterPeriod:20,
      longerPeriod:200,
      stockPriceOperator:'higher',
      startRange:0,
      endRange:20,
      rangeOperator:'between',
      days:1,
    },
    momentum:{
      isOptionsVisible:false,
      operator:'between',
      startValue:0,
      endValue:20,
      days:5,
    },
    relativeStrengthToBenchmark:{
      isOptionsVisible:false,
      priceStrengthOperator:'higher',
      benchmark:'S&P 500',
      period:5,
      rangeOperator:'between',
      startRange:0,
      endRange:20,
      stockPriceOperator:'higher',
      days:1,
    },
    RSI:{
      isOptionsVisible: false,
      period:5,
      operator:'between',
      startValue: 1,
      endValue: 5,
    },
    distanceToBottomStock:{
      isOptionsVisible:false,
      positionOperator:'higher',
      bottom:'lowest',
      period:5,
      rangeOperator:'between',
      startRange:0,
      endRange:20,
    },
    distanceToPeak:{
      isOptionsVisible:false,
      positionOperator:'higher',
      bottom:'highest',
      period:5,
      rangeOperator:'between',
      startRange:0,
      endRange:20,
    },
  }

  analysisFilterStatistical: any = {
    correlationToBenchmark:{
      isOptionsVisible:false,
      period:20,
      benchmark:'S&P 500',
      correlationOperator:'between',
      startValue:0,
      endValue:0.2,
      value:'positive',
    },
    beta:{
      days:5,
      betaOperator:'between',
      startValue:0,
      endValue:20,
    },
    sharpeRatio:{
      days:5,
      sharpeRatioOperator:'between',
      startValue:0,
      endValue:20,
    },
    sortinoRatio:{
      days:5,
      sortinoRatioOperator:'between',
      startValue:0,
      endValue:20,
    },
    trendAnalysis:{
      days:5,
      strengthOperator:'between',
      startStrength:0,
      endStrength:20,
      errorOperator:'between',
      startError:0,
      endError:0.1,
    },
  }

  analysisFilterVolatility: any = {
    implied:{
      impliedOperator:'between',
      startValue:0,
      endValue:20,
    },
    historical:{
      period:5,
      historicalOperator:'between',
      startValue:0,
      endValue:20,
    },
    ivPercentile:{
      operator:'between',
      startValue:0,
      endValue:20,
    },
    hvPercentile:{
      period:5,
      operator:'between',
      startValue:0,
      endValue:20,
    },
    atrPercent:{
      period:5,
      operator:'between',
      startValue:0,
      endValue:20,
    },
    ivChange:{
      period:5,
      operator:'between',
      startValue:0,
      endValue:20,
    },
    hvChange:{
      period:5,
      operator:'between',
      startValue:0,
      endValue:20,
      periodAgo:1,
    }
  }

  analysisFilterATM: any = {
    putCallRatio:{
      isOptionsVisible:false,
      operator:'between',
      startValue:10,
      endValue:20,
    },
    openInterestRank:{
      isOptionsVisible:false,
      operator:'between',
      startValue:10,
      endValue:20,
    }
  }

  constructor(
    private utilityService: UtilityService,
  ) { 

    this.item = '';
    this.SelectedAnalysisFilterList = [];
    this.StartDateList = this.getStartDate();
    this.EndDateList = this.getEndDate();
    this.IndexList = this.utilityService.getIndexList();
    this.DecimalList = this.getDecimals();
    this.ErrorRangeList = this.getErrorRanges();
    this.StepNumberList = this.getStepNumbers();
    this.VolatilityList = this.getVolatility();
    this.StockMinDataList = this.getStockMinData();
    this.StockMaxDataList = this.getStockMaxData();
  }

  ngOnInit(): void {
  }

  //get Static Data
  getStartDate() {
    let dynamicArr = [];

    for(let i = 0; i < 100 ; i ++){
      dynamicArr.push(i)
    }
    return dynamicArr;
  }

  getEndDate() {
    let dynamicArr = [];

    for(let i = 1; i < 101 ; i ++){
      dynamicArr.push(i)
    }

    return dynamicArr;
  }

  getDecimals() {
    let dynamicArr = [];

    for(let i = 0; i < 1.05; i += 0.05){
      dynamicArr.push(parseFloat(i.toFixed(2)));
    }

    return dynamicArr;
  }

  getErrorRanges(){
    let dynamicArr = [];

    for(let i = 0; i < 0.1005; i += 0.005){
      dynamicArr.push(parseFloat(i.toFixed(3)));
    }

    return dynamicArr;
  }
  getStepNumbers(){
    let dynamicArr = [];

    for(let i =0; i <105; i += 5){
      dynamicArr.push(i);
    }
    return dynamicArr;
  }

  getVolatility(){
    let dynamicArr = [];

    for(let i =0; i <75; i += 5){
      dynamicArr.push(i);
    }
    return dynamicArr;
  }

  getStockMinData(){
    let dynamicArr = [];

    for(let i =0; i < 20; i ++ ){
      dynamicArr.push(i);
    }
    return dynamicArr;
  }

  getStockMaxData(){
    let dynamicArr = [];

    for(let i =1 ; i < 21; i ++ ){
      dynamicArr.push(i);
    }
    return dynamicArr;
  }

  //Fundamental -> Price to Earning
  hideFundamentalPriceToEarningOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PriceToEarning')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalPriceToEarningOperator(){
    console.log("Price to Earning: ", this.analysisFilterFundamental.priceToEarning.operator);
  }

  setFundamentalPriceToEarningPeriod(){
    console.log("Price to Earning: ", this.analysisFilterFundamental.priceToEarning.startDate);
    console.log("Price to Earning: ", this.analysisFilterFundamental.priceToEarning.endDate);
  }

  setFundamentalPriceToEarningIndex(){
    console.log("Price to Earning: ", this.analysisFilterFundamental.priceToEarning.indexValue);
  }

  setFundamentalPriceToEarningValue(){
    console.log("Price to Earning: ", this.analysisFilterFundamental.priceToEarning.value);
  }

  //Fundamental -> Price to Book
  hideFundamentalPriceToBookOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PriceToBook')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalPriceToBookOperator(){
    console.log("Price to Book: ", this.analysisFilterFundamental.priceToBook.operator);
  }
  setFundamentalPriceToBookPeriod(){
    console.log("Price to Book: StartDate ", this.analysisFilterFundamental.priceToBook.startDate);
    console.log("Price to Book: EndDate", this.analysisFilterFundamental.priceToBook.endDate);
  }
  setFundamentalPriceToBookIndex(){
    console.log("Price to Book: ", this.analysisFilterFundamental.priceToBook.indexValue);
  }

  //Fundamental -> Price to Sales
  hideFundamentalPriceToSalesOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PriceToSales')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalPriceToSalesOperator(){
    console.log("Price to Sales: ", this.analysisFilterFundamental.priceToSales.operator);
  }
  setFundamentalPriceToSalesPeriod(){
    console.log("Price to Sales: StartDate ", this.analysisFilterFundamental.priceToSales.startDate);
    console.log("Price to Sales: EndDate", this.analysisFilterFundamental.priceToSales.endDate);
  }
  setFundamentalPriceToSalesIndex(){
    console.log("Price to Sales: ", this.analysisFilterFundamental.priceToSales.indexValue);
  }

  //Fundamental -> Price to Earning Growth
  hideFundamentalPriceToEarningGrowthOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PriceToEarningGrowth')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalPriceToEarningGrowthOperator(){
    console.log("Price to Earning Growth: ", this.analysisFilterFundamental.priceToEarningGrowth.operator);
  }

  setFundamentalPriceToEarningGrowthPeriod(){
    console.log("Price to Earning Growth: ", this.analysisFilterFundamental.priceToEarningGrowth.startDate);
    console.log("Price to Earning Growth: ", this.analysisFilterFundamental.priceToEarningGrowth.endDate);
  }

  setFundamentalPriceToEarningGrowthIndex(){
    console.log("Price to Earning Growth: ", this.analysisFilterFundamental.priceToEarningGrowth.indexValue);
  }

  setFundamentalPriceToEarningGrowthValue(){
    console.log("Price to Earning Growth: ", this.analysisFilterFundamental.priceToEarningGrowth.value);
  }

  //Fundamental -> Price to Sales Growth
  hideFundamentalPriceToSalesGrowthOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PriceToSalesGrowth')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalPriceToSalesGrowthOperator(){
    console.log("Price to Sales Growth: ", this.analysisFilterFundamental.priceToSalesGrowth.operator);
  }

  setFundamentalPriceToSalesGrowthPeriod(){
    console.log("Price to Sales Growth: ", this.analysisFilterFundamental.priceToSalesGrowth.startDate);
    console.log("Price to Sales Growth: ", this.analysisFilterFundamental.priceToSalesGrowth.endDate);
  }

  setFundamentalPriceToSalesGrowthIndex(){
    console.log("Price to Sales Growth: ", this.analysisFilterFundamental.priceToSalesGrowth.indexValue);
  }

  setFundamentalPriceToSalesGrowthValue(){
    console.log("Price to Sales Growth: ", this.analysisFilterFundamental.priceToSalesGrowth.value);
  }

  //Fundamental -> ZScore Rank
  hideFundamentalZScoreOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'ZScore')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalZScoreOperator(){
    console.log("ZScore: ", this.analysisFilterFundamental.zScore.operator);
  }
  setFundamentalZScoreStartDate(){
    console.log("ZScore: StartDate ", this.analysisFilterFundamental.zScore.startDate);
  }
  setFundamentalZScoreEndDate(){
    console.log("ZScore: EndDate", this.analysisFilterFundamental.zScore.endDate);
  }
  setFundamentalZScoreIndex(){
    console.log("ZScore: Index ", this.analysisFilterFundamental.zScore.indexValue);
  }

  //Fundamental -> Analyst Rating
  hideFundamentalAnalystRatingOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'AnalystRating')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setFundamentalAnalystRatingOperator(){
    console.log("Analyst Rating: ", this.analysisFilterFundamental.analystRating.operator);
  }
  setFundamentalAnalystRatingPeriod(){
    console.log("Analyst Rating: StartDate ", this.analysisFilterFundamental.analystRating.startDate);
    console.log("Analyst Rating: EndDate", this.analysisFilterFundamental.analystRating.endDate);
  }
    
  //Event -> Analyst Update
 
  hideEventAnalystUpdateOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'AnalystUpdate')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setEventAnalystUpdateStockRating(){
    console.log("AnalystUpdate: ", this.analysisFilterEvent.analystUpdate.stockRating);
  }

  //Event -> Earning Event
  hideEventEarningEventOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'EarningEvent')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setEventEarningEventEarningRelease(){
    console.log("Earning Event: Release", this.analysisFilterEvent.earningEvent.earningRelease);
  }
  setEventEarningPeriod(){
    console.log("Earning Event: Period ",this.analysisFilterEvent.earningEvent.period)
  }

  //Event -> News
  hideEventNewsOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'News')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setEventNewsSentiment(){
    console.log("News: Sentiment ", this.analysisFilterEvent.news.sentiment);
  }

  //Event -> Volume Breakout
  hideEventVolumeBreakoutOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'VolumeBreakout')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setEventVolumeBreakoutMultiplier(){
    console.log("Volume Breakout: Multiplier", this.analysisFilterEvent.volumeBreakout.multiplier);
  }
  setEventVolumeBreakoutPeriod(){
    console.log("Volume Breakout: Period ",this.analysisFilterEvent.volumeBreakout.period)
  }

  //Event -> PutCall Ratio Breakout
  hideEventPutCallRatioBreakoutOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PutCallRatioBreakout')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setEventPutCallRatioBreakoutMultiplier(){
    console.log("PutCall Ratio Breakout: Multiplier", this.analysisFilterEvent.putCallRatioBreakout.multiplier);
  }
  setEventPutCallRatioBreakoutPeriod(){
    console.log("PutCall Ratio Breakout: Period ",this.analysisFilterEvent.putCallRatioBreakout.period)
  }

  //Technical -> MA Analysis
  hideTechnicalMaAnalysisOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'MaAnalysis')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setTechnicalMaAnalysisAnalyse(){
    console.log("MA Analysis -> Analyse :", this.analysisFilterTechnical.maAnalysis.analyse);
  }
  setTechnicalMaAnalysisShorterPeriod(){
    console.log("MA Analysis -> Shorter Period :", this.analysisFilterTechnical.maAnalysis.shorterPeriod);
  }
  setTechnicalMaAnalysisOperator(){
    console.log("MA Analysis -> Stock Price Operator :", this.analysisFilterTechnical.maAnalysis.stockPriceOperator);
  }
  setTechnicalMaAnalysisLongerPeriod(){
    console.log("MA Analysis -> Longer Period : ",this.analysisFilterTechnical.maAnalysis.longerPeriod)
  }
  setTechnicalMaAnalysisRangeOperator(){
    console.log("MA Analysis -> Range Operator :", this.analysisFilterTechnical.maAnalysis.rangeOperator);
  }
  setTechnicalMaAnalysisStartRange(){
    console.log("MA Analysis -> Start Range :", this.analysisFilterTechnical.maAnalysis.startRange);
  }
  setTechnicalMaAnalysisEndRange(){
    console.log("MA Analysis -> End Range :", this.analysisFilterTechnical.maAnalysis.endRange);
  }
  setTechnicalMaAnalysisDays(){
    console.log("MA Analysis -> Days :", this.analysisFilterTechnical.maAnalysis.days);
  }

  //Technical -> Momentum Rank
  hideTechnicalMomentumOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'Momentum')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setTechnicalMomentumOperator(){
    console.log("Momentum Rank -> Operator", this.analysisFilterTechnical.momentum.operator);
  }
  setTechnicalMomentumStartDate(){
    console.log("Momentum Rank -> StartValue ",this.analysisFilterTechnical.momentum.startValue)
  }
  setTechnicalMomentumEndDate(){
    console.log("Momentum Rank -> EndValue ",this.analysisFilterTechnical.momentum.endValue)
  }

  setTechnicalMomentumDays(){
    console.log("Momentum Rank -> Days ",this.analysisFilterTechnical.momentum.days)
  }

  //Technical -> RSI
  hideTechnicalRSIOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'RSI')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setTechnicalRSIPeriod(){
    console.log("RSI -> Period : ", this.analysisFilterTechnical.RSI.period);
  }
  setTechnicalRSIOperator(){
    console.log("RSI -> Operator : ", this.analysisFilterTechnical.RSI.operator);
  }
  setTechnicalStartValue(){
    console.log("RSI -> StartValue : ", this.analysisFilterTechnical.RSI.startValue);
  }
  
  setTechnicalEndValue(){
    console.log("RSI -> EndValue :", this.analysisFilterTechnical.RSI.endValue);
  }

  //Technical -> Relative Strength to Benchmark
  hideTechnicalRelativeStrengthToBenchmarkOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'RelativeStrengthToBenchmark')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setTechnicalRelativeStrengthToBenchmarkPriceStrengthOperator(){
    console.log("Relative Strength to Benchmark -> Price Strength :", this.analysisFilterTechnical.relativeStrengthToBenchmark.priceStrengthOperator);
  }
  setTechnicalRelativeStrengthToBenchmarkAnalyse(){
    console.log("Relative Strength to Benchmark -> Benchmark :", this.analysisFilterTechnical.relativeStrengthToBenchmark.benchmark);
  }
  setTechnicalRelativeStrengthToBenchmarkPeriod(){
    console.log("Relative Strength to Benchmark -> Period :", this.analysisFilterTechnical.relativeStrengthToBenchmark.period);
  }
  setTechnicalRelativeStrengthToBenchmarkRangeOperator(){
    console.log("Relative Strength to Benchmark -> Range Operator :", this.analysisFilterTechnical.relativeStrengthToBenchmark.rangeOperator);
  }
  setTechnicalRelativeStrengthToBenchmarkStartRange(){
    console.log("Relative Strength to Benchmark -> Start Range :", this.analysisFilterTechnical.relativeStrengthToBenchmark.startRange);
  }
  setTechnicalRelativeStrengthToBenchmarkEndRange(){
    console.log("Relative Strength to Benchmark -> End Range :", this.analysisFilterTechnical.relativeStrengthToBenchmark.endRange);
  }
  setTechnicalRelativeStrengthToBenchmarkDays(){
    console.log("Relative Strength to Benchmark -> Days :", this.analysisFilterTechnical.relativeStrengthToBenchmark.days);
  }

  //Technical -> Distance to Bottom Stock
  hideTechnicalDistanceToBottomStockOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'DistanceToBottomStock')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setTechnicalDistanceToBottomStockPositionOperator(){
    console.log("Distance to Bottom Stock -> Position :", this.analysisFilterTechnical.distanceToBottomStock.positionOperator);
  }
  setTechnicalDistanceToBottomStockAnalyse(){
    console.log("Distance to Bottom Stock -> Benchmark :", this.analysisFilterTechnical.distanceToBottomStock.bottom);
  }
  setTechnicalDistanceToBottomStockPeriod(){
    console.log("Distance to Bottom Stock -> Period :", this.analysisFilterTechnical.distanceToBottomStock.period);
  }
  setTechnicalDistanceToBottomStockRangeOperator(){
    console.log("Distance to Bottom Stock -> Range Operator :", this.analysisFilterTechnical.distanceToBottomStock.rangeOperator);
  }
  setTechnicalDistanceToBottomStockStartRange(){
    console.log("Distance to Bottom Stock -> Start Range :", this.analysisFilterTechnical.distanceToBottomStock.startRange);
  }
  setTechnicalDistanceToBottomStockEndRange(){
    console.log("Distance to Bottom Stock -> End Range :", this.analysisFilterTechnical.distanceToBottomStock.endRange);
  }
  setTechnicalDistanceToBottomStockDays(){
    console.log("Distance to Bottom Stock -> Days :", this.analysisFilterTechnical.distanceToBottomStock.days);
  }

  //Technical -> Distance to Peak
  hideTechnicalDistanceToPeakOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'DistanceToPeak')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setTechnicalDistanceToPeakPositionOperator(){
    console.log("Distance to Peak -> Position :", this.analysisFilterTechnical.distanceToPeak.positionOperator);
  }
  setTechnicalDistanceToPeakAnalyse(){
    console.log("Distance to Peak -> Benchmark :", this.analysisFilterTechnical.distanceToPeak.bottom);
  }
  setTechnicalDistanceToPeakPeriod(){
    console.log("Distance to Peak -> Period :", this.analysisFilterTechnical.distanceToPeak.period);
  }
  setTechnicalDistanceToPeakRangeOperator(){
    console.log("Distance to Peak -> Range Operator :", this.analysisFilterTechnical.distanceToPeak.rangeOperator);
  }
  setTechnicalDistanceToPeakStartRange(){
    console.log("Distance to Peak -> Start Range :", this.analysisFilterTechnical.distanceToPeak.startRange);
  }
  setTechnicalDistanceToPeakEndRange(){
    console.log("Distance to Peak -> End Range :", this.analysisFilterTechnical.distanceToPeak.endRange);
  }
  setTechnicalDistanceToPeakDays(){
    console.log("Distance to Peak -> Days :", this.analysisFilterTechnical.distanceToPeak.days);
  }

  //Statistical -> Correlation to Benchmark
  hideStatisticalCorrelationToBenchmarkOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'CorrelationToBenchmark')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setStatisticalCorrelationToBenchmarkPeriod(){
    console.log("Correlation To Benchmark -> Period :", this.analysisFilterStatistical.correlationToBenchmark.period);
  }
  setStatisticalCorrelationToBenchmarkAnalyse(){
    console.log("Correlation To Benchmark -> Benchmark :", this.analysisFilterStatistical.correlationToBenchmark.benchmark);
  }
  setStatisticalCorrelationToBenchmarkOperator(){
    console.log("Correlation To Benchmark -> Correlation Operator :", this.analysisFilterStatistical.correlationToBenchmark.correlationOperator);
  }
  setStatisticalCorrelationToBenchmarkStartRange(){
    console.log("Correlation To Benchmark -> Start Value :", this.analysisFilterStatistical.correlationToBenchmark.startValue);
  }
  setStatisticalCorrelationToBenchmarkEndRange(){
    console.log("Correlation To Benchmark -> End Value :", this.analysisFilterStatistical.correlationToBenchmark.endValue);
  }
  setStatisticalCorrelationToBenchmarkValue(){
    console.log("Correlation To Benchmark -> Value :", this.analysisFilterStatistical.correlationToBenchmark.value);
  }

  //Statistical -> Beta
  hideStatisticalBetaOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'Beta')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setStatisticalBetaOperator(){
    console.log("Beta -> Operator", this.analysisFilterStatistical.beta.operator);
  }
  setStatisticalBetaStartValue(){
    console.log("Beta -> StartValue ",this.analysisFilterStatistical.beta.startValue)
  }
  setStatisticalBetaEndValue(){
    console.log("Beta -> EndValue ",this.analysisFilterStatistical.beta.endValue)
  }

  setStatisticalBetaDays(){
    console.log("Beta -> Days ",this.analysisFilterStatistical.beta.days)
  }

  //Statistical -> Sharpe Ratio
  hideStatisticalSharpeRatioOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'SharpeRatio')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setStatisticalSharpeRatioOperator(){
    console.log("Sharpe Ratio -> Operator", this.analysisFilterStatistical.sharpeRatio.sharpeRatioOperator);
  }
  setStatisticalSharpeRatioStartDate(){
    console.log("Sharpe Ratio -> StartValue ",this.analysisFilterStatistical.sharpeRatio.startValue)
  }
  setStatisticalSharpeRatioEndDate(){
    console.log("Sharpe Ratio -> EndValue ",this.analysisFilterStatistical.sharpeRatio.endValue)
  }

  setStatisticalSharpeRatioDays(){
    console.log("Sharpe Ratio -> Days ",this.analysisFilterStatistical.sharpeRatio.days)
  }
  //Statistical -> Sortino Ratio
  hideStatisticalSortinoRatioOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'SortinoRatio')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setStatisticalSortinoRatioOperator(){
    console.log("Sortino Ratio -> Operator", this.analysisFilterStatistical.sortinoRatio.sortinoRatioOperator);
  }
  setStatisticalSortinoRatioStartDate(){
    console.log("Sortino Ratio -> StartValue ",this.analysisFilterStatistical.sortinoRatio.startValue)
  }
  setStatisticalSortinoRatioEndDate(){
    console.log("Sortino Ratio -> EndValue ",this.analysisFilterStatistical.sortinoRatio.endValue)
  }

  setStatisticalSortinoRatioDays(){
    console.log("Sortino Ratio -> Days ",this.analysisFilterStatistical.sortinoRatio.days)
  }
  //Statistical -> Trend Analysis
  hideStatisticalTrendAnalysisOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'TrendAnalysis')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setStatisticalTrendAnalysisStrengthOperator(){
    console.log("Trend Analysis -> Strength", this.analysisFilterStatistical.trendAnalysis.strengthOperator);
  }
  setStatisticalTrendAnalysisStartStrength(){
    console.log("Trend Analysis -> Start Strength ",this.analysisFilterStatistical.trendAnalysis.startStrength)
  }
  setStatisticalTrendAnalysisEndStrength(){
    console.log("Trend Analysis -> End Strength ",this.analysisFilterStatistical.trendAnalysis.endStrength)
  }
  setStatisticalTrendAnalysisErrorOperator(){
    console.log("Trend Analysis -> Error", this.analysisFilterStatistical.trendAnalysis.errorOperator);
  }
  setStatisticalTrendAnalysisStarterror(){
    console.log("Trend Analysis -> Start Error ",this.analysisFilterStatistical.trendAnalysis.startError)
  }
  setStatisticalTrendAnalysisEnderror(){
    console.log("Trend Analysis -> End Strength ",this.analysisFilterStatistical.trendAnalysis.endError)
  }

  setStatisticalTrendAnalysisDays(){
    console.log("Trend Analysis -> Days ",this.analysisFilterStatistical.trendAnalysis.days)
  }

  //Volatility -> Implied Volatility
  hideVolatilityImpliedOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'ImpliedVolatility')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityImpliedOperator(){
    console.log("Implied -> Operator", this.analysisFilterVolatility.implied.impliedOperator);
  }
  setVolatilityImpliedStartValue(){
    console.log("Implied -> StartValue ",this.analysisFilterVolatility.implied.startValue)
  }
  setVolatilityImpliedEndValue(){
    console.log("Implied -> EndValue ",this.analysisFilterVolatility.implied.endValue)
  }
  //Volatility -> Historical Volatility
  hideVolatilityHistoricalOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'HistoricalVolatility')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityHistoricalOperator(){
    console.log("Historical -> Operator", this.analysisFilterVolatility.historical.historicalOperator);
  }
  setVolatilityHistoricalStartValue(){
    console.log("Historical -> StartValue ",this.analysisFilterVolatility.historical.startValue)
  }
  setVolatilityHistoricalEndValue(){
    console.log("Historical -> EndValue ",this.analysisFilterVolatility.historical.endValue)
  }

  setVolatilityHistoricalDays(){
    console.log("Historical -> Period ",this.analysisFilterVolatility.historical.period)
  }

  //Volatility -> IV Percentile
  hideVolatilityIVPercentileOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'IVPercentile')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityIVPercentileOperator(){
    console.log("IV Percentile -> Operator", this.analysisFilterVolatility.ivPercentile.operator);
  }
  setVolatilityIVPercentileStartValue(){
    console.log("IV Percentile -> StartValue ",this.analysisFilterVolatility.ivPercentile.startValue)
  }
  setVolatilityIVPercentileEndValue(){
    console.log("IV Percentile -> EndValue ",this.analysisFilterVolatility.ivPercentile.endValue)
  }

  //Volatility -> HV Percentile
  hideVolatilityHVPercentileOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'HVPercentile')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityHVPercentileOperator(){
    console.log("HV Percentile -> Operator", this.analysisFilterVolatility.hvPercentile.operator);
  }
  setVolatilityHVPercentileStartValue(){
    console.log("HV Percentile -> StartValue ",this.analysisFilterVolatility.hvPercentile.startValue)
  }
  setVolatilityHVPercentileEndValue(){
    console.log("HV Percentile -> EndValue ",this.analysisFilterVolatility.hvPercentile.endValue)
  }

  setVolatilityHVPercentileDays(){
    console.log("HV Percentile -> Period ",this.analysisFilterVolatility.hvPercentile.period)
  }

  //Volatility -> ATR Percent
  hideVolatilityATRPercentOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'ATRPercent')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityATRPercentOperator(){
    console.log("ATR Percent -> Operator", this.analysisFilterVolatility.atrPercent.operator);
  }
  setVolatilityATRPercentStartValue(){
    console.log("ATR Percent -> StartValue ",this.analysisFilterVolatility.atrPercent.startValue)
  }
  setVolatilityATRPercentEndValue(){
    console.log("ATR Percent -> EndValue ",this.analysisFilterVolatility.atrPercent.endValue)
  }
  setVolatilityATRPercentDays(){
    console.log("ATR Percent -> Period ",this.analysisFilterVolatility.atrPercent.Period)
  }

  //Volatility -> IV Change
  hideVolatilityIVChangeOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'IVChange')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityIVChangeOperator(){
    console.log("IV Change -> Operator", this.analysisFilterVolatility.ivChange.operator);
  }
  setVolatilityIVChangeStartValue(){
    console.log("IV Change -> StartValue ",this.analysisFilterVolatility.ivChange.startValue)
  }
  setVolatilityIVChangeEndValue(){
    console.log("IV Change -> EndValue ",this.analysisFilterVolatility.ivChange.endValue)
  }
  setVolatilityIVChangeDays(){
    console.log("IV Change -> Period ",this.analysisFilterVolatility.ivChange.period)
  }

  //Volatility -> HV Change
  hideVolatilityHVChangeOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'HVChange')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setVolatilityHVChangeOperator(){
    console.log("HV Change -> Operator", this.analysisFilterVolatility.hvChange.operator);
  }
  setVolatilityHVChangeStartValue(){
    console.log("HV Change -> StartValue ",this.analysisFilterVolatility.hvChange.startValue)
  }
  setVolatilityHVChangeEndValue(){
    console.log("HV Change -> EndValue ",this.analysisFilterVolatility.hvChange.endValue)
  }
  setVolatilityHVChangeDays(){
    console.log("HV Change -> Period ",this.analysisFilterVolatility.hvChange.period)
  }
  setVolatilityHVChangePeriodAgo(){
    console.log("HV Change -> Period Ago",this.analysisFilterVolatility.hvChange.periodAgo)
  }

  //ATM -> PutCall Ratio
  hideATMPutCallRatioOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'PutCallRatio')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setATMPutCallRatioOperator(){
    console.log("PutCall Ratio -> Operator", this.analysisFilterATM.putCallRatio.operator);
  }
  setATMPutCallRatioStartValue(){
    console.log("PutCall Ratio -> StartValue ",this.analysisFilterATM.putCallRatio.startValue)
  }
  setATMPutCallRatioEndValue(){
    console.log("PutCall Ratio -> EndValue ",this.analysisFilterATM.putCallRatio.endValue)
  }

  //ATM -> Open Interest Rank
  hideATMOpenInterestRankOptions(){
    const tempArray = this.SelectedAnalysisFilterList.filter((item:AnalysisFilter) => item.value !== 'OpenInterestRank')
    this.selectedAnalysisFilterListChange.emit(tempArray);
  }
  setATMOpenInterestRankOperator(){
    console.log("Open Interest Rank -> Operator", this.analysisFilterATM.openInterestRank.operator);
  }
  setATMOpenInterestRankStartValue(){
    console.log("Open Interest Rank -> StartValue ",this.analysisFilterATM.openInterestRank.startValue)
  }
  setATMOpenInterestRankEndValue(){
    console.log("Open Interest Rank -> EndValue ",this.analysisFilterATM.openInterestRank.endValue)
  }
}
