import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../_models/user.model';
import { StorageService } from '../_services/storage.service';

/**
 * @class AuthGuard
 * @description
 * Protege rutas que requieren autenticación.
 * Implementa CanActivate para determinar si un usuario puede acceder a una ruta.
 */
@Injectable()
export class AuthGuard implements CanActivate {

    private router = inject(Router);
    private storageService = inject(StorageService);
    private user: User;

    /**
     * Inicializa el AuthGuard y suscribe la información del usuario
     * desde el StorageService para mantener el estado de autenticación.
     */
    constructor() {
        this.storageService.userInfo.subscribe(user => this.user = user);
    }

    /**
     * Determina si el usuario actual puede activar una ruta protegida.
     * Redirige al login si el usuario no está autenticado.
     * 
     * @returns `true` si el usuario está autenticado, `false` en caso contrario.
     */
    public canActivate(): Promise<boolean> | Observable<boolean> | boolean {
        if (this.user) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}