import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export interface HolidaySelection {
  name: string;
  from: string;
  to: string;
}

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrl: './time.component.css'
})
export class TimeComponent implements OnInit {

  myTimeForm!: FormGroup;
  myTimeDetails: any[] = [];

  // Holiday modal state
  isHolidayModalOpen = false;
  pendingHoliday: string | null = null;
  holidayFromDate = '';
  holidayToDate = '';
  dateError = false;
  selectedHolidays: HolidaySelection[] = [];

  holidayList: string[] = [
    "New Year's Day",
    "Republic Day",
    "Holi",
    "Good Friday",
    "Independence Day",
    "Gandhi Jayanti",
    "Diwali",
    "Christmas Day",
    "Weekend"
  ];

  constructor(
    private router: Router,
    private messDetailsServ: MessDashboardService,
    private fb: FormBuilder,
    private toastrServ: ToastrService
  ) {}

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
          period: this.fb.control('', Validators.required),
        }),
      }),
    });
  }

  getTimeDetails() {
    this.messDetailsServ.getTimeDetailsList().subscribe({
      next: (_timeDetails: any) => {
        console.log(_timeDetails);
        this.myTimeDetails.push(_timeDetails.data);
        this.mySetTimeDetails();
      },
      error: (_error: any) => {
        console.log(_error);
      }
    });
  }

  mySetTimeDetails() {
    this.myTimeDetails.forEach((timeDetails: any) => {
      console.log(timeDetails);
      this.myTimeForm.get('timeDetails.morning.from')?.setValue(timeDetails.morning.from);
      this.myTimeForm.get('timeDetails.morning.to')?.setValue(timeDetails.morning.to);
      this.myTimeForm.get('timeDetails.evening.from')?.setValue(timeDetails.evening.from);
      this.myTimeForm.get('timeDetails.evening.to')?.setValue(timeDetails.evening.to);
      this.myTimeForm.get('timeDetails.holiday.period')?.setValue(timeDetails.holiday.period);

      // Restore saved holidays array if present
      if (timeDetails.holiday.holidays && Array.isArray(timeDetails.holiday.holidays)) {
        this.selectedHolidays = timeDetails.holiday.holidays;
      }
    });
  }

  onTimeDataSubmit() {
    const payload = {
      ...this.myTimeForm.value,
      timeDetails: {
        ...this.myTimeForm.value.timeDetails,
        holiday: {
          ...this.myTimeForm.value.timeDetails.holiday,
          holidays: this.selectedHolidays
        }
      }
    };
    console.log(payload);

    this.messDetailsServ.patchTimeDetailsList(payload).subscribe({
      next: (_timeDetails: any) => {
        this.toastrServ.success('Updated successfully');
        console.log(_timeDetails);
      },
      error: (_error: any) => {
        this.toastrServ.error('Error in updating');
        console.log(_error);
      }
    });
  }

  // --- Holiday Modal ---

  openHolidayModal(): void {
    this.pendingHoliday = null;
    this.holidayFromDate = '';
    this.holidayToDate = '';
    this.dateError = false;
    this.isHolidayModalOpen = true;
  }

  closeHolidayModal(): void {
    this.isHolidayModalOpen = false;
    this.pendingHoliday = null;
    this.dateError = false;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('holiday-modal-overlay')) {
      this.closeHolidayModal();
    }
  }

  selectPendingHoliday(name: string): void {
    this.pendingHoliday = this.pendingHoliday === name ? null : name;
  }

  confirmHoliday(): void {
    if (!this.pendingHoliday || !this.holidayFromDate || !this.holidayToDate) {
      this.dateError = true;
      return;
    }
    // Update if already exists, else add new
    const existing = this.selectedHolidays.findIndex(h => h.name === this.pendingHoliday);
    if (existing > -1) {
      this.selectedHolidays[existing] = { name: this.pendingHoliday, from: this.holidayFromDate, to: this.holidayToDate };
    } else {
      this.selectedHolidays.push({ name: this.pendingHoliday, from: this.holidayFromDate, to: this.holidayToDate });
    }
    this.closeHolidayModal();
  }

  removeHoliday(name: string): void {
    this.selectedHolidays = this.selectedHolidays.filter(h => h.name !== name);
  }

  onLogoutButton() {
    this.router.navigate(['login']);
  }
}