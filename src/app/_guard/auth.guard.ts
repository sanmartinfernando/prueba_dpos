import { Injectable } from '@angular/core';
import {    CanActivate,
            CanActivateChild,
            ActivatedRouteSnapshot,
            RouterStateSnapshot,
            Router
        } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from '../_models/user.model';
import { StorageService } from '../_services/storage.service';

@Injectable()
export class AuthGuard implements CanActivate {

    private user: User;

    constructor(private router: Router,
                private storageService: StorageService,
    ) {
        this.storageService.userInfo.subscribe(user => this.user = user);
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot):
            Promise<boolean> | Observable<boolean> | boolean {
         if (this.user) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }

}
