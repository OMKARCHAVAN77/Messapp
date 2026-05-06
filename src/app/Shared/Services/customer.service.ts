import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  myMessDetailsApiUrlInCustomer: string = 'https://find-food-backend2.vercel.app/api/user/getAllMess';
  constructor(private http: HttpClient) { }

  getCustomerInMessDetails() {
    return this.http.get(this.myMessDetailsApiUrlInCustomer, {
      withCredentials: true,
    })
  }

  //feedback Url
  myFeedBackApiUrl: string = 'https://find-food-backend2.vercel.app/api/user/saveRating';
  postFeedBackDetails(myFeedbackObj: any) {
    return this.http.post(this.myFeedBackApiUrl, myFeedbackObj)
  }

  //View Mess Details post and get call APi
  // Api for adding views of customer
  myViewApiUrl: string = 'https://find-food-backend2.vercel.app/api/user/addViews';
  postViewInCustomerList(userViewUserId: any) {
    const payload = {
      messUserId: userViewUserId
    }
    return this.http.post(this.myViewApiUrl, payload, {
      withCredentials: true,
    })
  }
}
