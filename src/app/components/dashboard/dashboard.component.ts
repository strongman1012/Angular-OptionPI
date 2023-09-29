import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ow-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  uid: string;
  bradcrumb: any;

  constructor(private router: Router) {
    this.uid = '';
    this.bradcrumb = {
      title: 'OptionPi',
      subtitle: 'Your one-stop A.I. based Options trading solution',
      data: []
    }
  }

  ngOnInit(): void {
  }

}