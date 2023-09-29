import { Component, OnInit, Input } from '@angular/core';
declare var window: any;

@Component({
  // standalone: true,
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.css'],
})

export class CustomDropdownComponent  {

  @Input() item:string; 
  formModal: any;
  
  constructor() {
    this.item = '';
  }
  visualize(){
    this.formModal = new window.bootstrap.Modal(
      document.getElementById('myModalAnalytics')
    );
    this.formModal.show();
  }
  
}
