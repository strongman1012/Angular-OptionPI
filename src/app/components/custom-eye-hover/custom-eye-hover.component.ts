import { Component, OnInit, Input } from '@angular/core';
import { AiSignalResult } from 'src/app/interface/aiSignal';
import { WatchListData } from 'src/app/interface/watchList-result';
import { ScreenerDataResult } from 'src/app/interface/screener-result';
import { CustomEyeHoverInput } from 'src/app/interface/custom-eye-hover';

@Component({
  selector: 'app-custom-eye-hover',
  templateUrl: './custom-eye-hover.component.html',
  styleUrls: ['./custom-eye-hover.component.css'],
})
export class CustomEyeHoverComponent implements OnInit {
  
  @Input() AiSignal:AiSignalResult;
  @Input() Watch: WatchListData;
  @Input() ScreenerData: ScreenerDataResult;
  @Input() index:number;

  isSymbol: boolean = true;
  symbols:any[];
  underlying: string = '';
  optionContract: string = '';

  constructor() {
    this.AiSignal = {
      Name: '',
      OptionContracts: '',
      Strategy: '',
      Timestamp: 0,
      Underlying: '',
    };

    this.Watch = {
      Strategy: '',
      Underlying: '',
      Name: '',
      OptionContracts: '',
      LastUnderlyingPrice: 0,
      BidBundlePrice: 0,
      AskBundlePrice: 0,
      LastBundlePrice: 0,
    };

    this.ScreenerData = {
      Underlying:'',
      Name:'',
      OptionContracts:'',
      Breakeven1:0,
      Breakeven2:0,
      MaxLoss:0,
      MaxProfit:0,
      MaxProfitToLoss:0,
      NetPremium:0,
      NetPremiumToMaxLoss:0,
      RiskNeutralWinProbability:0,
      Delta:0,
      Gamma:0,
      HV:0,
      IV:0,
      IVChange:0,
      UnderlyingPrice:0,
      HVPrediction:'',
      IVPrediction:'',
      BehaviorPrediction:'',
      SentimentPrediction:'',
    }

    this.index = 1;
    this.symbols = [];
  }
  ngOnInit(): void {
    this.getSymbol();
  }
  getDate(data:any): any {

    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    const matches = data.match(dateRegex);

    var dateString;

    if (matches && matches.length > 0) {
      dateString = matches[0];
    } else {
      console.log("Date not found in the input string");
    }

    const tempDate = String(dateString)

    const date = new Date(tempDate);

    date.setDate(date.getDate() + 1);

    const year = date.getFullYear().toString().substr(-2);

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = year + month + day;

    return formattedDate;
  }

  getPrice(data:any): any {

    var numbers = data.match(/\d+/g);

    var price = numbers.slice(3);

    return price
  }

  getExpiry(data:any): any{
    const day = data.substring(0, 2);
    const month = data.substring(2, 4);
    const year = data.substring(4);
    const expiry = `${day}-${month}-${year}`;

    return expiry;
  }
  
  getSymbol(): any {
    
    let tempSymbol:String = '';
    var underlying:String = '';
    var optionContract:String = '';

    if(this.AiSignal.Underlying && this.AiSignal.OptionContracts){
      underlying = this.AiSignal.Underlying;
      optionContract = this.AiSignal.OptionContracts;
    }else if(this.Watch.Underlying && this.Watch.OptionContracts){
      underlying = this.Watch.Underlying;
      optionContract = this.Watch.OptionContracts;
    }else if(this.ScreenerData.Underlying && this.ScreenerData.OptionContracts){
      underlying = this.ScreenerData.Underlying;
      optionContract = this.ScreenerData.OptionContracts;
    } 

    let date = this.getDate(optionContract);  
    let expiry = this.getExpiry(date);
    let prices = this.getPrice(optionContract);
    tempSymbol = underlying + date;
    // tempSymbol = date;

    if(prices.length > 0){
      prices.map((data:number, index:any) => {
        let symbol;
        let type;

        const integralPart = parseInt(data.toString());
        const decimalPart = parseFloat((data % 1).toFixed(2));

        let integerLength = integralPart.toString().length;
        let decimalLength = decimalPart.toString().length;

        if(index >= 2){
          symbol = tempSymbol + "C" + "0".repeat(5 - integerLength) + integralPart + decimalPart + "0".repeat(3-decimalLength)
          type = "Call"
        } else{
          symbol = tempSymbol + "P" + "0".repeat(5 - integerLength) + integralPart + decimalPart + "0".repeat(3-decimalLength)
          type = "Put"
        }
        this.symbols.push([symbol, type, expiry, data])
        // this.symbols.push([underlying, type, expiry, data, symbol])
      })
    }else {
      console.log('There is no result.')
    }
  }
}
