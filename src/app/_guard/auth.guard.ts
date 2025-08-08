import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../_models/user.model';
import { StorageService } from '../_services/storage.service';


@Injectable()
export class AuthGuard implements CanActivate {

    private router = inject(Router); 
    private storageService = inject (StorageService);
    
    private user: User;

    constructor() {
        this.storageService.userInfo.subscribe(user => this.user = user);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | Observable<boolean> | boolean {
        if (this.user) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
