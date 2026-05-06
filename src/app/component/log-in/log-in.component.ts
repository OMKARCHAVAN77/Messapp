import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from '../../Shared/Services/login.service';
import { AgainLoginService } from '../../Shared/Services/again-login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  hidePassword: boolean = true;
  myLoginForm!: FormGroup;
  captcha: string = '';

   // focus in first Input tag
    @ViewChild('email', { read: MatInput }) emailMatInput!: MatInput;
    @ViewChild('email') emailElementRef!: ElementRef;
    
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  constructor(private fb: FormBuilder, private tostrServ: ToastrService, private loginserve:LoginService , private router: Router, private http: HttpClient, private againLoginServ: AgainLoginService) { }

  ngOnInit(): void {
    this.initialLoginForm();
    this.generateCaptcha();
  }

   ngAfterViewInit(): void {
    // Focus after view is initialized
    setTimeout(() => {
      if (this.emailInput) {
        this.emailInput.nativeElement.focus();
      }
    });
  }


  initialLoginForm() {
    this.myLoginForm = this.fb.group({
      emailId: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      captchaInput: ['', [Validators.required]]
    })
  }

  generateCaptcha() {
    this.captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // onSubmit() {
  //   console.log('Registration Successful:', this.myLoginForm.value);
  //   if (this.myLoginForm.value.captchaInput !== this.captcha) {
      
  //     this.generateCaptcha();
  //   } else {
  //     //debugger
  //     this.loginserve.postLoginList(this.myLoginForm.value).subscribe({
  //       next: (_resp: any) => {
  //         localStorage.setItem('userId', _resp.userId);
  //         localStorage.setItem('role', _resp.role);
  //         localStorage.setItem('token', _resp.data);

  //         this.againLoginServ.getMessLoginDetails().subscribe({
  //           next: (_apiResp: any) => {
  //               this.tostrServ.success('Login successfuly');
  //             console.log('Login Successful:', _resp);
  //             if (_apiResp.success === true && _resp.role === 'Mess Owner') {
                 
  //               this.router.navigate(['ownerdetails']); // Mess Owner Form 
                

  //             } else if (_apiResp.success === true && _resp.role === 'Customer') {
  //                  this.tostrServ.success('Login successfuly');
  //               this.router.navigate(['customer']);

  //             }
  //           },
  //           error: (_error: any) => {
  //             if (_error.error.success === false) {
  //               this.router.navigate(['layout/dashbord']); // Redirect to Dashboard if login fails

  //             }
  //           }
  //         });
  //       },
  //       error: (_error: any) => {
  //           this.tostrServ.error('Login falied');
  //         console.log('Login Failed', _error);

  //       }
  //     });
  //     this.myLoginForm.markAllAsTouched();
  //     this.myLoginForm.reset();
  //   }
  // }




   onSubmit() {
    console.log('Login Successful:', this.myLoginForm.value);
    if (this.myLoginForm.value.captchaInput !== this.captcha) {
      this.generateCaptcha();
    } else {
      this.loginserve.postLoginList(this.myLoginForm.value).subscribe({
        next: (_resp: any) => {
          localStorage.setItem('userId', _resp.userId);
          localStorage.setItem('role', _resp.role);
          localStorage.setItem('token', _resp.data);

          this.againLoginServ.getMessLoginDetails().subscribe({
            next: (_apiResp: any) => {
              console.log('Login Successful:', _resp);
              if (_apiResp.success === true && _resp.role === 'Mess Owner') {
                this.router.navigate(['messOwnerDetails']); // Mess Owner Form 
                this.tostrServ.success('Mess Owner Login Successful...');
              } else if (_apiResp.success === true && _resp.role === 'Customer') {
                this.router.navigate(['customer']);
                this.tostrServ.success('Customer Login Successful...');
              }
            },
            error: (_error: any) => {
              if (_error.error.success === false) {
                this.router.navigate(['layout/dashbord']); // Redirect to Dashboard if login fails
                this.tostrServ.success('Login Successful...');
              }
            }
          });
        },
        error: (_error: any) => {
          console.log('Login Failed', _error);
          this.tostrServ.error('Login Failed...');
        }
      });
      this.myLoginForm.markAllAsTouched();
      this.myLoginForm.reset();
    }
  }


  
}
