import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler)
    : Observable<HttpEvent<any>> {

    // skip Cloudinary — rejects Authorization header
    if (req.url.includes('cloudinary.com')) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');

    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set(
          'Authorization', `Bearer ${token}`
        )
      });
      return next.handle(clonedReq);
    }
    return next.handle(req);
  }
}