import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrl: './time.component.css'
})
export class TimeComponent implements OnInit {
   myTimeForm!: FormGroup;
  myTimeDetails: any[] = [];
  menuList = [{ day: 'Monday' }, { day: 'Tuesday' }, { day: 'Wednesday' }, { day: 'Thursday' }, { day: 'Friday' }, { day: 'Saturday' }, { day: 'Sunday' }]

  constructor(private router: Router,private messDetailsServ: MessDashboardService, private fb: FormBuilder,private toastrServ:ToastrService) { }
  ngOnInit(): void {
    this.initialTimeForm();
    this.getTimeDetails();
  }
  initialTimeForm() {
    this.myTimeForm = this.fb.group({
      timeDetails: this.fb.group({
        userId: localStorage.getItem('userId'),
        morning: this.fb.group({
          from: this.fb.control('', Validators.required),
          to: this.fb.control('', Validators.required),
        }),
        evening: this.fb.group({
          from: this.fb.control('', Validators.required),
          to: this.fb.control('', Validators.required),
        }),
        holiday: this.fb.group({
          day: this.fb.control('', Validators.required),
          period: this.fb.control('', Validators.required),
        }),
      }),
    })
  }
  getTimeDetails() {
    this.messDetailsServ.getTimeDetailsList().subscribe({
      next: (_timeDetails: any) => {
        console.log(_timeDetails);
        this.myTimeDetails.push(_timeDetails.data);
        // console.log(this.myTimeDetails)
        this.mySetTimeDetails();
      },
      error: (_error: any) => {
        console.log(_error);
      }
    })
  }

  mySetTimeDetails() {
    this.myTimeDetails.forEach((timeDetails: any) => {
      console.log(timeDetails);
      this.myTimeForm.get('timeDetails.morning.from')?.setValue(timeDetails.morning.from);
      this.myTimeForm.get('timeDetails.morning.to')?.setValue(timeDetails.morning.to);
      this.myTimeForm.get('timeDetails.evening.from')?.setValue(timeDetails.evening.from);
      this.myTimeForm.get('timeDetails.evening.to')?.setValue(timeDetails.evening.to);
      this.myTimeForm.get('timeDetails.holiday.day')?.setValue(timeDetails.holiday.day);
      this.myTimeForm.get('timeDetails.holiday.period')?.setValue(timeDetails.holiday.period);
      // this.myTimeForm.patchValue({
      //   'timeDetails.morning.from': timeDetails.morning.from,
      //   'timeDetails.morning.to': timeDetails.morning.to,
      //   'timeDetails.evening.from': timeDetails.evening.from,
      //   'timeDetails.evening.to': timeDetails.evening.to,
      //   'timeDetails.holiday.day': timeDetails.holiday.day,
      //   'timeDetails.holiday.period': timeDetails.holiday.period
      // })
    })
  }

  onTimeDataSubmit() {
    console.log(this.myTimeForm.value);
    this.messDetailsServ.patchTimeDetailsList(this.myTimeForm.value).subscribe({
      next: (_timeDetails: any) => {
         this.toastrServ.success('updated successfully');
        console.log(_timeDetails);
      },
      error: (_error: any) => {
       this.toastrServ.error('Error in updating ');
        console.log(_error);
      }
    })
  }

  onLogoutButton(){
    this.router.navigate(['login'])
  }
}