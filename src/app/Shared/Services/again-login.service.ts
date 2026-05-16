import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgainLoginService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMessLoginDetails() {
    return this.http.get(`${this.baseUrl}/api/user/messFormRendering`);
    // ✅ removed withCredentials: true — interceptor handles token
  }
}