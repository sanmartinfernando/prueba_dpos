import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../_models/user.model';
import { AuthService } from './auth.service';
import { StringConstants } from '../_rest/string-constants';

/**
 * Servicio para gestionar el almacenamiento de datos del usuario
 * en localStorage y sessionStorage, manteniendo estados reactivos
 * para la información de usuario y el estado de sesión.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {

  private authService = inject(AuthService);

  public userInfo = new BehaviorSubject<User | null>(this.getUser());
  private loggedin = new BehaviorSubject<boolean>(null);
  public loggedin$: Observable<boolean> = this.loggedin.asObservable();

  public username = '';
  private component: string;

  constructor() {
    this.authService.configObservable.subscribe(user => this.saveUser(user));
  }

  /**
   * Almacena un objeto en localStorage.
   * @param key Clave para el elemento.
   * @param item Objeto a guardar.
   */
  public set(key: string, item: object): void {
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Obtiene un valor desde localStorage.
   * @param key Clave del elemento.
   * @returns Valor almacenado o null si no existe.
   */
  public get(key: string): any {
    const cacheItem = localStorage.getItem(key);
    return cacheItem ? JSON.parse(cacheItem) : null;
  }

  /**
   * Elimina un elemento de localStorage.
   * @param key Clave del elemento.
   */
  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Guarda el nombre de usuario en memoria y localStorage.
   * @param username Nombre de usuario.
   */
  public setUsername(username: string): void {
    this.username = username;
    localStorage.setItem(StringConstants.USERNAME_KEY, username);
  }

  /**
   * Obtiene el nombre de usuario desde localStorage.
   * @returns Nombre de usuario o null si no existe.
   */
  public getUsername(): string | null {
    return localStorage.getItem(StringConstants.USERNAME_KEY);
  }

  /**
   * Limpia todos los datos de localStorage y sessionStorage.
   */
  public clean(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.userInfo.next(null);
  }

  /**
   * Obtiene la información del usuario desde localStorage.
   * @returns Usuario o null si no existe.
   */
  public getUser(): User | null {
    const user = localStorage.getItem(StringConstants.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Indica si existe un usuario en sesión.
   * @returns true si hay usuario, false en caso contrario.
   */
  public isLoggedIn(): boolean {
    return !!localStorage.getItem(StringConstants.USER_KEY);
  }

  /**
   * Define el nombre del componente actual.
   * @param component Nombre del componente.
   */
  public setComponent(component: string): void {
    this.component = component;
  }

  /**
   * Obtiene el nombre del componente actual.
   * @returns Nombre del componente.
   */
  public getComponent(): string {
    return this.component;
  }

  /**
   * Actualiza el estado de sesión.
   * @param logginupdated Nuevo valor de estado.
   */
  public updateloggin(logginupdated: boolean): void {
    this.loggedin.next(logginupdated);
  }

  /**
   * Guarda la información del usuario y actualiza el estado.
   * @param user Usuario a guardar.
   */
  private saveUser(user: User): void {
    if (user) {
      this.setUsername(user.email);
      localStorage.removeItem(StringConstants.USER_KEY);
      localStorage.setItem(StringConstants.USER_KEY, JSON.stringify(user));
    }
    this.userInfo.next(user);
  }
}
