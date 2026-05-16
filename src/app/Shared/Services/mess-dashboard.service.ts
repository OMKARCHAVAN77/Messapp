import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessDashboardService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ POST — Mess Owner Main Form (fixed: was changed to GET by mistake)
  postMessOwnerDetailsList(myMessDetailsObj: any) {
    return this.http.post(`${this.baseUrl}/api/user/messData`, myMessDetailsObj);
  }

  // ✅ GET — Mess details
  getMessDetailsList() {
    return this.http.get(`${this.baseUrl}/api/user/messDetailsData`);
  }

  // ✅ GET — Menu details
  getMenuDetailsList() {
    return this.http.get(`${this.baseUrl}/api/user/menuDetailsData`);
  }

  // ✅ GET — Price details
  getPriceDetailsList() {
    return this.http.get(`${this.baseUrl}/api/user/priceDetailsData`);
  }

  // ✅ GET — Time details
  getTimeDetailsList() {
    return this.http.get(`${this.baseUrl}/api/user/timeDetailsData`);
  }

  // ✅ PATCH — Mess update
  patchMessDetailsList(myMessObj: any) {
    return this.http.patch(`${this.baseUrl}/api/user/saveMessDetails`, myMessObj);
  }

  // ✅ PATCH — Menu update
  patchMenuDetailsList(myMenuObj: any) {
    return this.http.patch(`${this.baseUrl}/api/user/saveMenuDetails`, myMenuObj.menuDetails);
  }

  // ✅ PATCH — Price update
  patchPriceDetailsList(myPriceObj: any) {
    return this.http.patch(`${this.baseUrl}/api/user/savePriceDetails`, myPriceObj);
  }

  // ✅ PATCH — Time update
  patchTimeDetailsList(myTimeObj: any) {
    return this.http.patch(`${this.baseUrl}/api/user/saveTimeDetails`, myTimeObj.timeDetails);
  }
}