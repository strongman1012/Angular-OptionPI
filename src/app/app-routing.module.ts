import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './_service/auth-guard.service';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent, MainComponent, AccountComponent, AnalyticsComponent } from './components/dashboard';

const routes: Routes = [{
    path: '',
    component: LoginComponent,
    title: 'OptionsWeb | Login'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'OptionsWeb | Login'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'OptionsWeb | Dashboard'
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AuthGuard],
    title: 'OptionsWeb | Account'
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AuthGuard],
    title: 'OptionsWeb | Analytics'
  },
  {
    path: 'password',
    component: LoginComponent,
    title: 'OptionsWeb | Forgot Password'
  },
  {
    path: 'register',
    component: LoginComponent,
    title: 'OptionsWeb | Register'
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
