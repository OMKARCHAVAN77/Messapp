import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessFormDataService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ POST — Mess Owner Main Form
  postMessOwnerDetailsList(myMessDetailsObj: any) {
    return this.http.post(`${this.baseUrl}/api/user/messData`, myMessDetailsObj);
    // ✅ removed withCredentials: true — interceptor handles token
  }
}