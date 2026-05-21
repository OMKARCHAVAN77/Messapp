import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs';
import { CustomerService } from '../../Shared/Services/customer.service';
import { FeedBackPageComponent } from '../customer/feed-back-page/feed-back-page.component';

interface Mess {
  userId: string;
}

@Component({
  selector: 'app-mess-main-details',
  templateUrl: './mess-main-details.component.html',
  styleUrl: './mess-main-details.component.css'
})
export class MessMainDetailsComponent {
  [x: string]: any;
  userId: string = '';
  isOpen: boolean = false;
  myNewMessDetailsInformationObj: { messDetails: any[]; timeDetails: any[], rating: any[], menuDetails: any[] } = {
    messDetails: [],
    timeDetails: [],
    rating: [],
    menuDetails: []
  };
  messStatusText: string = '';
  messInfo: any;
  myMessName: string = '';
  star: string = '0';
  totalRatings: number = 0;
  myRatingData: any[] = [];
  timeInfo: any;
  paginatedMessDetails: Mess[] = [];
  visible: boolean = false;
  feedbackText: string = 'F';
  buttonWidth: string = '40px';

  constructor(
    private customerServ: CustomerService,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) { }

  // ✅ Go back to previous page — works both before and after login
  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.activeRoute.params.pipe(
      switchMap((params: any) => {
        this.userId = params['id'];
        console.log('UserId from route:', this.userId);
        localStorage.setItem('CustomerUserId', this.userId);
        return this.customerServ.getCustomerInMessDetails();
      })
    ).subscribe((data: any) => {
      console.log('Full Mess Details:', data);

      if (data?.messDetails) {
        this.messInfo = data.messDetails.find((mess: any) => mess.userId === this.userId);
        console.log('Filtered Mess Info:', this.messInfo);
        if (this.messInfo) {
          this.myMessName = this.messInfo.messName;
        }
      }

      if (data?.rating) {
        this.myRatingData = data.rating;
        const ratings = this.myRatingData
          .filter((customerRating: any) => customerRating.customerUserId === this.userId)
          .map((userRating: any) => userRating.rating);
        this.totalRatings = ratings.length;
        if (this.totalRatings > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
          this.star = (totalRating / this.totalRatings).toFixed(1);
        }
      }

      if (data?.timeDetails) {
        this.myNewMessDetailsInformationObj.timeDetails = data.timeDetails;
        this.timeInfo = data.timeDetails.find((time: any) => time.userId === this.userId);
      }
    });

    // ✅ Call refreshRatingData separately — no redirect on failure
    this.refreshRatingData();
  }

  formatTime(time: string): string {
    if (!time || typeof time !== 'string' || !time.includes(':')) {
      return '-';
    }
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (isNaN(hours) || isNaN(minutes)) {
      return '-';
    }
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${hours12}:${paddedMinutes} ${period}`;
  }

  getRelatedDetails(userId: any): any {
    return this.myNewMessDetailsInformationObj.timeDetails.find(
      detail => detail.userId === userId
    ) || null;
  }

  openMyFeedBackBox() {
    alert('please login or signup');
  }

  getMessStatus(timeInfo: any): string {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    if (timeInfo?.morning?.from && timeInfo?.morning?.to) {
      const [morningFromHours, morningFromMinutes] = timeInfo.morning.from.split(':').map(Number);
      const [morningToHours, morningToMinutes] = timeInfo.morning.to.split(':').map(Number);
      const morningOpen = morningFromHours * 60 + morningFromMinutes;
      const morningClose = morningToHours * 60 + morningToMinutes;

      if (currentTimeInMinutes >= morningOpen && currentTimeInMinutes <= morningClose) {
        return currentTimeInMinutes >= (morningClose - 30) ? 'Closing Soon' : 'Open';
      }
      if (currentTimeInMinutes >= (morningOpen - 30) && currentTimeInMinutes < morningOpen) {
        return 'Opening Soon';
      }
    }

    if (timeInfo?.evening?.from && timeInfo?.evening?.to) {
      const [eveningFromHours, eveningFromMinutes] = timeInfo.evening.from.split(':').map(Number);
      const [eveningToHours, eveningToMinutes] = timeInfo.evening.to.split(':').map(Number);
      const eveningOpen = eveningFromHours * 60 + eveningFromMinutes;
      const eveningClose = eveningToHours * 60 + eveningToMinutes;

      if (currentTimeInMinutes >= eveningOpen && currentTimeInMinutes <= eveningClose) {
        return currentTimeInMinutes >= (eveningClose - 30) ? 'Closing Soon' : 'Open';
      }
      if (currentTimeInMinutes >= (eveningOpen - 30) && currentTimeInMinutes < eveningOpen) {
        return 'Opening Soon';
      }
    }

    return 'Closed';
  }

  // ✅ FIXED — no more redirect to login on missing rating
  refreshRatingData() {
    this.customerServ.getCustomerInMessDetails().subscribe(
      (data: any) => {
        console.log('Full response data:', data);

        if (!data?.rating) {
          console.warn('No rating data available.');
          this.star = '0';
          this.totalRatings = 0;
          return;
        }

        this.myRatingData = data.rating;
        console.log('Rating data:', this.myRatingData);

        const ratings = this.myRatingData
          .filter((customerRating: any) => customerRating.messUserId === this.userId)
          .map((userRating: any) => userRating.rating);

        console.log('Filtered ratings:', ratings);
        this.totalRatings = ratings.length;

        if (this.totalRatings > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
          this.star = (totalRating / this.totalRatings).toFixed(1);
        } else {
          this.star = '0';
        }
      },
      (error) => {
        console.error('Error fetching rating data:', error);
        // ✅ Set defaults on error — don't crash or redirect
        this.star = '0';
        this.totalRatings = 0;
      }
    );
  }

  showFullText() {
    this.feedbackText = 'Feedback';
    this.buttonWidth = '120px';
  }

  showShortText() {
    this.feedbackText = 'F';
    this.buttonWidth = '40px';
  }

  showDialog() {
    this.visible = true;
  }

  onLoginButton() {
    this.router.navigate(['login']);
  }

  onRegisternButton() {
    this.router.navigate(['signup']);
  }
}