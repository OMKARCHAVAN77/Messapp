import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessDashboardService {
  myMessPostDetailsApiUrls: string = 'https://find-food-backend2.vercel.app/api/user/messData';
  constructor(private http: HttpClient) { }


  //Post To The Mess Owner Main Form Api 
  postMessOwnerDetailsList(myMessDetailsObj: any) {
    return this.http.post(this.myMessPostDetailsApiUrls, myMessDetailsObj)
  }

  //Only All Get Api Link :- 

  //Mess details get Api
  getMessDetailsList() {
    return this.http.get('https://find-food-backend2.vercel.app/api/user/messDetailsData', {
      // withCredentials: true
    })
  }

  //Menu details get Api
  getMenuDetailsList() {
    return this.http.get('https://find-food-backend2.vercel.app/api/user/menuDetailsData', {
      // withCredentials: true
    })
  }

  //price details get Api
  getPriceDetailsList() {
    return this.http.get('https://find-food-backend2.vercel.app/api/user/priceDetailsData',
      {
        // withCredentials: true
      }
    )
  }

  //time details get Api
  getTimeDetailsList() {
    return this.http.get('https://find-food-backend2.vercel.app/api/user/timeDetailsData', {
      // withCredentials: true
    })
  }


  // Patch Api

  //mess Update Api
patchMessDetailsList(myMessObj: any) {
  return this.http.patch('https://find-food-backend2.vercel.app/api/user/saveMessDetails', myMessObj, {
    // withCredentials: true
  });
}
  //menu Update Api
  patchMenuDetailsList(myMenuObj: any) {
    // console.log(myMessObj);
    return this.http.patch('https://find-food-backend2.vercel.app/api/user/saveMenuDetails',myMenuObj.menuDetails, {
      // withCredentials:true
    })
  }

  //Price update Api
  patchPriceDetailsList(myPriceObj: any) {
    return this.http.patch('https://find-food-backend2.vercel.app/api/user/savePriceDetails', myPriceObj, {
      // withCredentials: true
    })
  }

  //Time update Api
  patchTimeDetailsList(myTimeObj: any) {
    return this.http.patch('https://find-food-backend2.vercel.app/api/user/saveTimeDetails', myTimeObj.timeDetails, {
      // withCredentials: true
    })
}
}