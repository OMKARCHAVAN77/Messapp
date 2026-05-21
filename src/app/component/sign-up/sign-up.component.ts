import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { AgainLoginService } from '../../Shared/Services/again-login.service';
import { LoginService } from '../../Shared/Services/login.service';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  myRegisterForm!: FormGroup;

  // ✅ Backend URL
  private backendUrl = 'https://findfoodbackend.vercel.app';

  @ViewChild('userName', { read: MatInput }) userNameMatInput!: MatInput;
  @ViewChild('userName') userNameElementRef!: ElementRef;
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private toastrServ: ToastrService,
    private userSignInUpServ: LoginService,
    private router: Router,
    private againLoginServ: AgainLoginService,
    private socialAuthService: SocialAuthService, // ✅ added
    private http: HttpClient                       // ✅ added
  ) { }

  ngOnInit(): void {
    this.myRegisterForm = this.fb.group({
      username: this.fb.control('', Validators.required),
      emailId: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: this.fb.control('', Validators.required),
      role: this.fb.control('Mess Owner', Validators.required),
    }, { validator: this.passwordMatchValidator });

    // ✅ Listen for Google login on register page
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        console.log('Google User on register page:', user);
        this.handleGoogleRegister(user);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    }, 0);
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    if (confirmPassword.errors && !confirmPassword.errors['mismatch']) return null;
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  // ✅ Handle Google register — save to backend
  handleGoogleRegister(user: SocialUser): void {
    this.http.post(`${this.backendUrl}/api/google-login`, {
      name: user.name,
      email: user.email,
      photo: user.photoUrl,
      googleId: user.id
    }).subscribe({
      next: (resp: any) => {
        console.log('Google register response:', resp);
        localStorage.setItem('userId', resp.userId);
        localStorage.setItem('role', resp.role);
        localStorage.setItem('token', resp.data);
        localStorage.setItem('googleUser', JSON.stringify({
          name: resp.name,
          email: user.email,
          photo: resp.photo
        }));

        this.toastrServ.success('Google Register Successful! Welcome ' + user.firstName);

        // ✅ Navigate based on role
        if (resp.role === 'Customer') {
          this.router.navigate(['mainCustomer']);
          return;
        }

        if (resp.role === 'Mess Owner') {
          this.againLoginServ.getMessLoginDetails().subscribe({
            next: (_apiResp: any) => {
              if (_apiResp.success === true) {
                this.router.navigate(['layout/dashbord']);
              }
            },
            error: (_error: any) => {
              this.router.navigate(['ownerdetails']);
              this.toastrServ.info('Please complete your Mess details.');
            }
          });
        }
      },
      error: (err) => {
        console.error('Google register error:', err);
        this.toastrServ.error('Google register failed!');
      }
    });
  }

  onSubmit() {
    if (this.myRegisterForm.invalid) return;

    const formData = { ...this.myRegisterForm.value };

    this.userSignInUpServ.postRegisterList(formData).subscribe({
      next: (_resp: any) => {
        console.log('Registration Successful:', _resp);

        this.userSignInUpServ.postLoginList(formData).subscribe({
          next: (_resp: any) => {
            console.log('Login Successful:', _resp);
            localStorage.setItem('userId', _resp.userId);
            localStorage.setItem('role', _resp.role);
            localStorage.setItem('token', _resp.data);

            this.myRegisterForm.reset();

            if (_resp.role === 'Customer') {
              this.router.navigate(['customer']);
              this.toastrServ.success('Customer Register Successful...');
              return;
            }

            if (_resp.role === 'Mess Owner') {
              this.againLoginServ.getMessLoginDetails().subscribe({
                next: (_apiResp: any) => {
                  if (_apiResp.success === true) {
                    this.router.navigate(['layout/dashbord']);
                    this.toastrServ.success('Welcome Back!');
                  }
                },
                error: (_error: any) => {
                  this.router.navigate(['ownerdetails']);
                  this.toastrServ.success('Registration Successful! Please fill Mess details.');
                }
              });
            }
          },
          error: (loginError: any) => {
            console.error('Login Failed:', loginError);
            this.toastrServ.error('Login Failed...');
          }
        });
      },
      error: (_error: any) => {
        console.error('Registration Failed:', _error);
        this.toastrServ.error('Registration Failed...');
      }
    });
  }
}