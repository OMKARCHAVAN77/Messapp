import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatInput } from '@angular/material/input';
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

  @ViewChild('email', { read: MatInput }) emailMatInput!: MatInput;
  @ViewChild('email') emailElementRef!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private tostrServ: ToastrService,
    private loginserve: LoginService,
    private router: Router,
    private http: HttpClient,
    private againLoginServ: AgainLoginService
  ) { }

  ngOnInit(): void {
    this.initialLoginForm();
    this.generateCaptcha();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.emailInput) {
        this.emailInput.nativeElement.focus();
      }
    });
  }

  initialLoginForm() {
    this.myLoginForm = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      captchaInput: ['', [Validators.required]]
    });
  }

  generateCaptcha() {
    this.captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  onSubmit() {
  if (this.myLoginForm.invalid) return;

  if (this.myLoginForm.value.captchaInput !== this.captcha) {
    this.tostrServ.error('Invalid CAPTCHA, please try again');
    this.generateCaptcha();
    return;
  }

  this.loginserve.postLoginList(this.myLoginForm.value).subscribe({
    next: (_resp: any) => {
      localStorage.setItem('userId', _resp.userId);
      localStorage.setItem('role', _resp.role);
      localStorage.setItem('token', _resp.data);
      this.myLoginForm.reset();

      // ✅ Admin — skip mess API
      if (_resp.role === 'Admin') {
        this.router.navigate(['layout/dashbord']);
        this.tostrServ.success('Admin Login Successful...');
        return;
      }

      // ✅ Customer — skip mess API, go directly
      if (_resp.role === 'Customer') {
        this.router.navigate(['customer']);
        this.tostrServ.success('Customer Login Successful...');
        return;
      }

      // ✅ Only Mess Owner calls this API
      if (_resp.role === 'Mess Owner') {
        this.againLoginServ.getMessLoginDetails().subscribe({
          next: (_apiResp: any) => {
            if (_apiResp.success === true) {
              this.router.navigate(['ownerdetails']);
              this.tostrServ.success('Mess Owner Login Successful...');
            }
          },
          error: (_error: any) => {
            // New Mess Owner — no mess form filled yet
            this.router.navigate(['layout/dashbord']);
            this.tostrServ.info('Please complete your Mess details.');
          }
        });
      }

    },
    error: (_error: any) => {
      console.log('Login Failed', _error);
      this.tostrServ.error('Login Failed. Please check your credentials.');
    }
  });
}
}