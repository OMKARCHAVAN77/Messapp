import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessFormDataService {
  myMessPostDetailsApiUrls: string = 'https://find-food-backend2.vercel.app/api/user/messData';
  constructor(private http: HttpClient) { }
  


  //Post To The Mess Owner Main Form Api 
  postMessOwnerDetailsList(myMessDetailsObj: any) {
    return this.http.post(this.myMessPostDetailsApiUrls, myMessDetailsObj,{
      // withCredentials:true
    })
  }
 
}
