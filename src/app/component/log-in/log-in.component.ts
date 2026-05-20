import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginService } from '../../Shared/Services/login.service';
import { AgainLoginService } from '../../Shared/Services/again-login.service';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

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
    private againLoginServ: AgainLoginService,
    private socialAuthService: SocialAuthService  // ✅ added
  ) { }

  ngOnInit(): void {
    this.initialLoginForm();
    this.generateCaptcha();

    // ✅ Listen for Google login response
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        console.log('Google User:', user);
        this.handleGoogleLogin(user);
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

  // ✅ Google Sign In
  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      console.log('Google login success:', user);
      this.handleGoogleLogin(user);
    }).catch((error) => {
      console.error('Google login error:', error);
      this.tostrServ.error('Google login failed. Please try again.');
    });
  }

  // ✅ Handle Google user — save to localStorage and navigate
  handleGoogleLogin(user: SocialUser): void {
    // Save Google user info to localStorage
   localStorage.setItem('userId', user.id ?? '');
    localStorage.setItem('role', 'Customer');
    localStorage.setItem('token', user.idToken ?? '');
    localStorage.setItem('googleUser', JSON.stringify({
      name: user.name,
      email: user.email,
      photo: user.photoUrl
    }));

    this.tostrServ.success('Google Login Successful! Welcome ' + user.firstName);

    // ✅ Navigate to customer page
    this.router.navigate(['mainCustomer']);
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
