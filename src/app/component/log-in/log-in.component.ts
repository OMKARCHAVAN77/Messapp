import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginService } from '../../Shared/Services/login.service';
import { AgainLoginService } from '../../Shared/Services/again-login.service';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  hidePassword: boolean = true;
  myLoginForm!: FormGroup;
  captcha: string = '';
  private googleLoginTriggered: boolean = false;  // ✅ flag added

  @ViewChild('email', { read: MatInput }) emailMatInput!: MatInput;
  @ViewChild('email') emailElementRef!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  // ✅ Backend URL
  private backendUrl = 'https://findfoodbackend.vercel.app';

  constructor(
    private fb: FormBuilder,
    private tostrServ: ToastrService,
    private loginserve: LoginService,
    private router: Router,
    private http: HttpClient,
    private againLoginServ: AgainLoginService,
    private socialAuthService: SocialAuthService  // ✅ added
  ) { }

  ngOnInit(): void {
    this.initialLoginForm();
    this.generateCaptcha();

    // ✅ Listen for Google login — only when user clicked button
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user && this.googleLoginTriggered) {
        console.log('Google User:', user);
        this.handleGoogleLogin(user);
        this.googleLoginTriggered = false;
      }
    });
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

  // ✅ Send Google data to backend and save in MongoDB
  handleGoogleLogin(user: SocialUser): void {
    this.http.post(`${this.backendUrl}/api/google-login`, {
      name: user.name,
      email: user.email,
      photo: user.photoUrl,
      googleId: user.id
    }).subscribe({
      next: (resp: any) => {
        console.log('Backend Google login response:', resp);
        localStorage.setItem('userId', resp.userId);
        localStorage.setItem('role', resp.role);
        localStorage.setItem('token', resp.data);
        localStorage.setItem('googleUser', JSON.stringify({
          name: resp.name,
          email: user.email,
          photo: resp.photo
        }));

        this.tostrServ.success('Google Login Successful! Welcome ' + user.firstName);

        // ✅ Navigate based on role
        if (resp.role === 'Admin') {
          this.router.navigate(['layout/dashbord']);
          return;
        }

        if (resp.role === 'Customer') {
          this.router.navigate(['mainCustomer']);
          return;
        }

        if (resp.role === 'Mess Owner') {
          this.againLoginServ.getMessLoginDetails().subscribe({
            next: (_apiResp: any) => {
              if (_apiResp.success === true) {
                this.router.navigate(['layout/dashbord']);
                this.tostrServ.success('Welcome Back!');
              }
            },
            error: (_error: any) => {
              this.router.navigate(['ownerdetails']);
              this.tostrServ.info('Please complete your Mess details.');
            }
          });
        }
      },
      error: (err) => {
        console.error('Backend Google login error:', err);
        this.tostrServ.error('Google login failed!');
      }
    });
  }

  onSubmit() {
    if (this.myLoginForm.invalid) return;
    if (this.myLoginForm.value.captchaInput !== this.captcha) {
      this.tostrServ.error('Invalid CAPTCHA');
      this.generateCaptcha();
      return;
    }
    this.loginserve.postLoginList(this.myLoginForm.value).subscribe({
      next: (_resp: any) => {
        localStorage.setItem('userId', _resp.userId);
        localStorage.setItem('role', _resp.role);
        localStorage.setItem('token', _resp.data);
        this.myLoginForm.reset();

        if (_resp.role === 'Admin') {
          this.router.navigate(['layout/dashbord']);
          this.tostrServ.success('Admin Login Successful...');
          return;
        }

        if (_resp.role === 'Customer') {
          this.router.navigate(['customer']);
          this.tostrServ.success('Customer Login Successful...');
          return;
        }

        if (_resp.role === 'Mess Owner') {
          this.againLoginServ.getMessLoginDetails().subscribe({
            next: (_apiResp: any) => {
              if (_apiResp.success === true) {
                this.router.navigate(['layout/dashbord']);
                this.tostrServ.success('Welcome Back!');
              }
            },
            error: (_error: any) => {
              if (_error.status === 400) {
                this.router.navigate(['ownerdetails']);
                this.tostrServ.info('Please complete your Mess details.');
              } else {
                this.router.navigate(['ownerdetails']);
                this.tostrServ.info('Please complete your Mess details.');
              }
            }
          });
        }
      },
      error: (_error: any) => {
        this.tostrServ.error('Login Failed. Please check your credentials.');
      }
    });
  }
}