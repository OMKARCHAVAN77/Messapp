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

          this.myRegisterForm.reset(); // ✅ reset inside next

          // ✅ Customer — skip mess API, go directly
          if (_resp.role === 'Customer') {
            this.router.navigate(['customer']);
            this.toastrServ.success('Customer Register Successful...');
            return;
          }

          // ✅ Mess Owner — check if has data
          if (_resp.role === 'Mess Owner') {
            this.againLoginServ.getMessLoginDetails().subscribe({
              next: (_apiResp: any) => {
                if (_apiResp.success === true) {
                  // existing owner
                  this.router.navigate(['layout/dashbord']);
                  this.toastrServ.success('Welcome Back!');
                }
              },
              error: (_error: any) => {
                // ✅ New owner — go fill form
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
