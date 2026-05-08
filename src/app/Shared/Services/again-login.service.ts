import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AgainLoginService {
  constructor(private http: HttpClient) { }

  getMessLoginDetails(){
    return this.http.get('https://find-food-backend2.vercel.app/api/user/messFormRendering',{
      // withCredentials:true,
    })
  }}