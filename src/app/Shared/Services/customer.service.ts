import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ GET — All mess list for customer
  getCustomerInMessDetails() {
    return this.http.get(`${this.baseUrl}/api/user/getAllMess`);
  }

  // ✅ POST — Feedback/rating
  postFeedBackDetails(myFeedbackObj: any) {
    return this.http.post(`${this.baseUrl}/api/user/saveRating`, myFeedbackObj);
  }

  // ✅ POST — Add view count
  postViewInCustomerList(userViewUserId: any) {
    const payload = { messUserId: userViewUserId };
    return this.http.post(`${this.baseUrl}/api/user/addViews`, payload);
  }
}