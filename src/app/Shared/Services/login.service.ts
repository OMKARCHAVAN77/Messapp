import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  myUserRegisterApiUrl:string = 'https://find-food-backend2.vercel.app/api/user/register';

  //userId,password,role

  myUserLoginApiUrl:string = 'https://find-food-backend2.vercel.app/api/user/login';
  //userId,password
  constructor(private http:HttpClient) { }
  postRegisterList(myUserObj:any){
   const myPayLoad ={
      "userId": myUserObj.emailId,
      "password": myUserObj.password,
      "role": myUserObj.role,
    }
    return this.http.post(this.myUserRegisterApiUrl,myPayLoad)
  }

  postLoginList(myLoginObj:any){
    const payload = {
      "userId": myLoginObj.emailId,
      "password": myLoginObj.password,
    }
    return this.http.post(this.myUserLoginApiUrl,payload,{
      // withCredentials:true
    })
  }
}
