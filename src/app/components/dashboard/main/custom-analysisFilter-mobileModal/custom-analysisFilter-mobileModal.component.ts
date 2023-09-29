import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AnalysisFilter } from 'src/app/interface/analysis-filter';
import { UtilityService } from 'src/app/_service/utility.service';

declare var $: any;

@Component({
  selector: 'app-custom-analysisFilter-mobileModal',
  templateUrl: './custom-analysisFilter-mobileModal.component.html',
  styleUrls: ['./custom-analysisFilter-mobileModal.component.css']
})
export class CustomAnalysisFilterMobileModalComponent implements OnInit {

  @Input() SelectedAnalysisFilterList:AnalysisFilter[]; 

  @Output() selectedAnalysisFilterListChange = new EventEmitter<any[]>();

  AnalysisList: any[];
  fundamentalList: any[];
  eventList: any[];
  technicalList: any[];
  statisticalList: any[];
  volatilityList: any[];
  atmList: any[];

  prevItem:any[];

  checkboxstatus: boolean;

  selectedItems: string[] = [];
  individualItems: any[];
  displayNumber: number;

  constructor(
    private utilityService: UtilityService,
  ) {
    this.SelectedAnalysisFilterList=[];
    this.AnalysisList = this.utilityService.getAnalysisFilterList();
    this.fundamentalList = this.utilityService.getFundamentalList();
    this.eventList = this.utilityService.getEventList();
    this.technicalList = this.utilityService.getTechnicalList();
    this.statisticalList = this.utilityService.getStatisticalList();
    this.volatilityList = this.utilityService.getVolatilityList();
    this.atmList = this.utilityService.getATMList();

    this.prevItem = [];
    
    this.individualItems = [];
    this.displayNumber = 0;
    this.checkboxstatus = false;
   }

   ngOnInit(): void {
  }

  closeModal() {
    $('#customModal').modal('hide');
  }

  addAnalysisFilter(filterName:string, filterValue:string, filterGroup:string) {
    if(!this.SelectedAnalysisFilterList.find((item:AnalysisFilter) => item.group === filterGroup)){
     this.SelectedAnalysisFilterList.unshift({name:filterName, value: filterValue, group:filterGroup})
    }else {
      const tempArray = this.SelectedAnalysisFilterList.filter(item => item.group !== filterGroup)
      tempArray.unshift({name:filterName, value: filterValue, group:filterGroup})
      this.SelectedAnalysisFilterList = tempArray;
    }
    this.selectedAnalysisFilterListChange.emit(this.SelectedAnalysisFilterList)
    
    this.closeModal();
    this.displayNumber = 0
  }

  checkStatus(filterName: string) {
    return this.SelectedAnalysisFilterList.some(filter => filter.name === filterName);
  }

  onClickFilterName(id:number) {
    if(id === 0){
      this.individualItems = this.fundamentalList;
    }else if(id === 1){
      this.individualItems = this.eventList;
    }else if(id === 2){
      this.individualItems = this.technicalList;
    }else if(id === 3){
      this.individualItems = this.statisticalList;
    }else if(id === 4){
      this.individualItems = this.volatilityList;
    }else if(id === 5){
      this.individualItems = this.atmList;
    }
    this.displayNumber = 1;
  }

  setPrimaryBtn(){
    this.displayNumber = 0; 
  }
}
