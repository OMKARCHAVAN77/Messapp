import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RatingViewsChartService {

  constructor(private http:HttpClient) { }

  //this only rating api use to the profile and dashboard
  //rating part get in Owner
  myRatingDetailsAPiUrl:string = 'https://find-food-backend2.vercel.app/api/user/getRatingData';
  getRatingDetailsList(){
    return this.http.get(this.myRatingDetailsAPiUrl,{
      withCredentials:true,
    });
  }

  //Views Part Get in Owner
  myViewApiUrl:string = 'https://find-food-backend2.vercel.app/api/user/getViews';
  getViewsDetailsList(){
    return this.http.get(this.myViewApiUrl,{
      withCredentials:true,
    })
  }


  getViewsPeriodForChart(period:any) {
    const payload = {
      period: period,
    };
  return  this.http
      .post('https://find-food-backend2.vercel.app/api/user/views', payload, {
        withCredentials: true,
      })   
  }
}
