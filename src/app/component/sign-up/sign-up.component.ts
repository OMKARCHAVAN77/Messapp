import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { AgainLoginService } from '../../Shared/Services/again-login.service';
import { LoginService } from '../../Shared/Services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  myRegisterForm!: FormGroup;

  // focus in first Input tag
  @ViewChild('userName', { read: MatInput }) userNameMatInput!: MatInput;
  @ViewChild('userName') userNameElementRef!: ElementRef;
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder,private toastrServ: ToastrService, private userSignInUpServ: LoginService, private router: Router,  private againLoginServ: AgainLoginService) { }

  ngOnInit(): void {
    this.myRegisterForm = this.fb.group({
      username: this.fb.control('', Validators.required),
      emailId: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: this.fb.control('', Validators.required),
      role: this.fb.control('Mess Owner', Validators.required),
    }, { validator: this.passwordMatchValidator });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    }, 0); // Avoid ExpressionChangedAfterItHasBeenCheckedError
  }
  

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['mismatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  onSubmit() {
    console.log('Registration Successful:', this.myRegisterForm.value);

    // Store form values before any potential reset
    const formData = { ...this.myRegisterForm.value };

    // user send register information
    this.userSignInUpServ.postRegisterList(formData).subscribe({
      next: (_resp: any) => {
        console.log('Registration Successful:', _resp);
        // this.toastrServ.success('Registration Successfully...');

        //login send to the user information
        this.userSignInUpServ.postLoginList(formData).subscribe({
          next: (_resp: any) => {  
            console.log('Login Successful:', _resp);
            localStorage.setItem('userId', _resp.userId);
            localStorage.setItem('role', _resp.role);
            localStorage.setItem('token', _resp.data);
            // this.toastrServ.success('Login Successful...');

            //login get part
            this.againLoginServ.getMessLoginDetails().subscribe({
              next: (_apiResp: any) => {
                console.log('Login Successful:', _resp);
                if (_apiResp.success === true && _resp.role === 'Mess Owner') {
                   this.toastrServ.success('Mess Owner Register Successful...');
                  this.router.navigate(['ownerdetails']); // Mess Owner Form 
                 
                } else if (_apiResp.success === true && _resp.role === 'Customer') {
                  this.router.navigate(['customer']);
                  this.toastrServ.success('Customer Register Successful...');
                
                }
              },
             error: (_error: any) => {
              console.error('Mess details API failed:', _error);
              // stay on current page
               this.router.navigate(['signup']);
              }
            });
          },
          error: (loginError: any) => {
            console.error('Login Failed:', loginError);
                  this.toastrServ.error('Login Failed...');
          }
        });
      },
      error: (_error: any) => {
             this.toastrServ.error('Registration Failed...');
        console.error('Registration Failed:', _error);
      }
    });

    this.myRegisterForm.markAllAsTouched();
    // Move reset to after login is complete or remove it if you navigate away
    // this.myRegisterForm.reset();
  }
}
