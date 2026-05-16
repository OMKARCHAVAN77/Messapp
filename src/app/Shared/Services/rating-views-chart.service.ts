import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingViewsChartService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ GET — Rating data for owner dashboard
  getRatingDetailsList() {
    return this.http.get(`${this.baseUrl}/api/user/getRatingData`);
  }

  // ✅ GET — Views data for owner dashboard
  getViewsDetailsList() {
    return this.http.get(`${this.baseUrl}/api/user/getViews`);
  }

  // ✅ POST — Views chart by period
  getViewsPeriodForChart(period: any) {
    const payload = { period: period };
    return this.http.post(`${this.baseUrl}/api/user/views`, payload);
  }
}