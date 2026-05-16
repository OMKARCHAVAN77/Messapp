import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ POST — Register
  postRegisterList(myUserObj: any) {
    const payload = {
      userId: myUserObj.emailId,
      password: myUserObj.password,
      role: myUserObj.role
    };
    return this.http.post(`${this.baseUrl}/api/user/register`, payload);
  }

  // ✅ POST — Login
  postLoginList(myLoginObj: any) {
    const payload = {
      userId: myLoginObj.emailId,
      password: myLoginObj.password
    };
    return this.http.post(`${this.baseUrl}/api/user/login`, payload);
    // ✅ removed withCredentials: true — not needed for JWT login
  }
}