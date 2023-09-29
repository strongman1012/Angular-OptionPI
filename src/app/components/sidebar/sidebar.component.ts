import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthGuard } from 'src/app/_service/auth-guard.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SideBarComponent implements OnInit {
  currentRoute: string;

  constructor(private router: Router, private _authGuard: AuthGuard,) { 
    this.currentRoute = this.router.url;
  }

  currentTab = 'main';
  //displayName = '' as any;

  setTab(tabName: string){
    this.currentTab = tabName;
  }

  logoutUser(): void {
    this._authGuard.logout();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    //this.displayName = (localStorage.getItem('displayname') !== null ? localStorage.getItem('displayname') : '');
  }

}