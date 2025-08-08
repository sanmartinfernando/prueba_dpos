import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../_models/user.model';
import { AuthService } from './auth.service';
import { StringConstants } from '../_rest/string-constants';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public userInfo = new BehaviorSubject(this.getUser());
  private loggedin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public loggedin$: Observable<boolean> = this.loggedin.asObservable();

  username: string = '';
  component: string;

  constructor(private authService: AuthService) {
    this.authService.configObservable.subscribe(user => {
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

  public setUsername(username: string) {
    this.username = username;
    window.localStorage.setItem(StringConstants.USERNAME_KEY, username);
  }

  public getUsername() {
    return window.localStorage.getItem(StringConstants.USERNAME_KEY);
  }

  public clean(): void {
    window.localStorage.clear();
    sessionStorage.clear();
    this.userInfo.next(null);
  }

  public updateVerifiedEmail() {
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
    if (user) {
      return true;
    }
    return false;
  }

  public setComponent(component: string) {
    this.component = component;
  }

  public getComponent() {
    return this.component;
  }

  public updateloggin(logginupdated) {
    this.loggedin.next(logginupdated)
  }

  private saveUser(user: User): void {
    if (user != null) {
      this.setUsername(user.email);
      window.localStorage.removeItem(StringConstants.USER_KEY);
      window.localStorage.setItem(StringConstants.USER_KEY, JSON.stringify(user));//
    }
    this.userInfo.next(user);
  }
}
