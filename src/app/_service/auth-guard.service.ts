import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router) { }
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('uid') !== undefined && localStorage.getItem('uid') !== null && localStorage.getItem('uid') !== '') {
            return true;
        }
        this._router.navigate(['']);
        return false;
    }

    logout() {
        localStorage.removeItem('uid');
        localStorage.removeItem('user-credential');
        localStorage.removeItem('displayname');
        localStorage.removeItem('futu-uid');
        localStorage.removeItem('tiger-uid');
        localStorage.removeItem('ib-uid');
        localStorage.removeItem('tiger_access_token');
        localStorage.removeItem('futu_access_token');
        localStorage.removeItem('accountSelections');
    }

    public get loggedIn(): boolean {
        return (localStorage.getItem('uid') !== null &&
        localStorage.getItem('user-credential') !== null &&
        localStorage.getItem('futu-uid') !== null &&
        localStorage.getItem('tiger-uid') !== null &&
        localStorage.getItem('ib-uid') !== null &&
        localStorage.getItem('tiger_access_token') !== null &&
        localStorage.getItem('futu_access_token') !== null &&
        localStorage.getItem('ib_access_token') !== null);
    }
}