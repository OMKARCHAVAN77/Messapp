import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareFoodTypeService {
  private foodTypeSubject = new BehaviorSubject<any>(null);
  sharedObservable$ = this.foodTypeSubject.asObservable();

  constructor() { }

  setFoodType(foodType: any) {
    this.foodTypeSubject.next(foodType);
  }

  getFoodType() {
    return this.sharedObservable$;
  }
}