import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../_models/user.model';
import { StorageService } from '../_services/storage.service';

@Injectable()
export class AuthGuard implements CanActivate {

    private router = inject(Router); 
    private storageService = inject(StorageService);
    private user: User;

    /**
     * Constructor.
     * Se suscribe a la información del usuario almacenada para mantener el estado de autenticación.
     */
    constructor() {
        this.storageService.userInfo.subscribe(user => this.user = user);
    }

    /**
     * Verifica si el usuario actual está autenticado para permitir el acceso a una ruta.
     * Si no está autenticado, redirige a la página de inicio de sesión.
     * 
     * @returns `true` si el usuario está autenticado, de lo contrario `false`.
     */
    canActivate(): Promise<boolean> | Observable<boolean> | boolean {
        if (this.user) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
