import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UIStateService {
  private formSelectEnabled = new BehaviorSubject<boolean>(true);
  formSelectEnabled$ = this.formSelectEnabled.asObservable();

  setFormSelectEnabled(enabled: boolean) {
    this.formSelectEnabled.next(enabled);
  }
}