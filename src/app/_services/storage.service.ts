import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from '../_models/user.model';
import { AuthService } from './auth.service';
import { StringConstants } from '../_config/string-constants';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private authSuscription!: Subscription;
  public userInfo = new BehaviorSubject<User>(this.getUser());
  private loggedin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public loggedin$: Observable<boolean>= this.loggedin.asObservable();

  username: string = '';
  component: string;

  constructor(private authService: AuthService) {
    this.authSuscription = this.authService.configObservable.subscribe(user => {
      this.saveUser(user);
    });
  }

  set(key: string, item: object) {
    localStorage.setItem(key, JSON.stringify(item));
  }
  get(key: string) {
    const cacheItem = localStorage.getItem(key);
    if (cacheItem !== null) {
      const record = JSON.parse(cacheItem);
      return record;
    }
    return null;
  }
  remove(key: string) {
    localStorage.removeItem(key);
  }


  setUsername(username: string) {
    this.username = username;
    window.localStorage.setItem(StringConstants.USERNAME_KEY, username);
  }

  getUsername() {
    return window.localStorage.getItem(StringConstants.USERNAME_KEY);
  }

  clean(): void {
    window.localStorage.clear();
    this.userInfo.next(null);
  }

  private saveUser(user: User): void {
    if (user != null) {
      this.setUsername(user.email);
      window.localStorage.removeItem(StringConstants.USER_KEY);
      window.localStorage.setItem(StringConstants.USER_KEY, JSON.stringify(user));//
    }
    this.userInfo.next(user);
  }
  public updateVerifiedEmail() {
    // actualizar la visualización de email verificado en la web
    let user = this.getUser();
    if (user) {
      user.email_verified = true;
      this.saveUser(user);
    }
  }
  public getUser(): any {
    const user = window.localStorage.getItem(StringConstants.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  public isLoggedIn(): boolean {
    const user = window.localStorage.getItem(StringConstants.USER_KEY);
    console.log(user);
    if (user) {
      return true;
    }
    return false;
  }

  setComponent(component: string) {
    this.component = component;
  }

  getComponent() {
    return this.component;
  }


  public getValidationValue(): any {
    let validationdata = window.localStorage.getItem(StringConstants.VALIDATIONDATA_KEY);
    if (validationdata) {
    } else {
      validationdata = this.getGuid();
      window.localStorage.setItem(StringConstants.VALIDATIONDATA_KEY, validationdata);//
    }
    return validationdata;
  }
  private getGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  updateloggin(logginupdated){
    this.loggedin.next(logginupdated)
  }

}
