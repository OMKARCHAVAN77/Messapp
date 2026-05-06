import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { CustomerService } from '../../Shared/Services/customer.service';
import { FeedBackPageComponent } from '../customer/feed-back-page/feed-back-page.component';


interface Mess {
  userId: string;
  // Add more fields as needed, e.g. messName, rating, etc.
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
  myNewMessDetailsInformationObj: { messDetails: any[]; timeDetails: any[], rating: any[], menuDetails: any[] } = { messDetails: [], timeDetails: [], rating: [], menuDetails: [] };
  messStatusText: string = ''
  messInfo: any;
  myMessName: string = '';
  star: string = '0';
  totalRatings: number = 0;
  myRatingData: any[] = [];
  timeInfo: any;
  paginatedMessDetails: Mess[] = [];
  constructor(private customerServ: CustomerService, private activeRoute: ActivatedRoute, public dialog: MatDialog, private cdRef: ChangeDetectorRef,private router:Router) { }

  ngOnInit(): void {

    this.activeRoute.params.pipe(
      switchMap((params: any) => {
        this.userId = params['id']; // Get userId from route
        console.log('UserId from route:', this.userId);
        localStorage.setItem('CustomerUserId', this.userId);
        return this.customerServ.getCustomerInMessDetails(); // Fetch data from API
      })
    ).subscribe((data: any) => {
      console.log('Full Mess Details:', data);

      // Ensure data and messDetails exist before accessing userId
      if (data?.messDetails) {
        this.messInfo = data.messDetails.find((mess: any) => mess.userId === this.userId);
        console.log('Filtered Mess Info:', this.messInfo);
        this.myMessName = this.messInfo.messName;
      }

      // Rating Data 
      if (data?.rating) {
        this.myRatingData = data.rating;
        const ratings = this.myRatingData
          .filter((customerRating: any) => customerRating.customerUserId === this.userId)
          .map((userRating: any) => userRating.rating);
        this.totalRatings = ratings.length;
        if (this.totalRatings > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
          const averageRating = totalRating / this.totalRatings;
          this.star = averageRating.toFixed(1); // Round to 1 decimal place
        }
      }

      if (data?.timeDetails) {
  this.myNewMessDetailsInformationObj.timeDetails = data.timeDetails;
  this.timeInfo = data.timeDetails.find((time: any) => time.userId === this.userId);
}
    });
    this.refreshRatingData();
  }

  formatTime(time: string): string {
    if (!time || typeof time !== 'string' || !time.includes(':')) {
      return '-'; // fallback if time is invalid
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

  feedbackText: string = 'F';
  buttonWidth: string = '40px';




  getRelatedDetails(userId: any): any {
    return this.myNewMessDetailsInformationObj.timeDetails.find(detail => detail.userId === userId) || null;
  }
  // feedback
  openMyFeedBackBox() {
    // const dialogRef = this.dialog.open(FeedBackPageComponent, {
    //   width: '700px',
    //   data: { name: this.myMessName, messOwnerUserId: this.userId },
    //   position: { right: '50px', top: '70px' }
    // });

    // dialogRef.afterClosed().subscribe((result: boolean) => {
    //   if (result) { // If feedback was submitted successfully
    //     this.refreshRatingData();
    //   }
    // });

    alert("please login or singup")
  }

   getMessStatus(timeInfo: any): string {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    // console.log('currentTimeInMinutes >>>',currentTimeInMinutes);

    // Check morning hours
    if (timeInfo?.morning?.from && timeInfo?.morning?.to) {
      const [morningFromHours, morningFromMinutes] = timeInfo.morning.from.split(':').map(Number);
      const [morningToHours, morningToMinutes] = timeInfo.morning.to.split(':').map(Number);

      const morningOpen = morningFromHours * 60 + morningFromMinutes;
      const morningClose = morningToHours * 60 + morningToMinutes;

      if (currentTimeInMinutes >= morningOpen && currentTimeInMinutes <= morningClose) {
        if (currentTimeInMinutes >= (morningClose - 30)) {
          return 'Closing Soon';
        }
        return 'Open';
      }

      if (currentTimeInMinutes >= (morningOpen - 30) && currentTimeInMinutes < morningOpen) {
        return 'Opening Soon';
      }
    }


    // Check evening hours
    if (timeInfo?.evening?.from && timeInfo?.evening?.to) {
      const [eveningFromHours, eveningFromMinutes] = timeInfo.evening.from.split(':').map(Number);
      const [eveningToHours, eveningToMinutes] = timeInfo.evening.to.split(':').map(Number);

      const eveningOpen = eveningFromHours * 60 + eveningFromMinutes;
      const eveningClose = eveningToHours * 60 + eveningToMinutes;

      if (currentTimeInMinutes >= eveningOpen && currentTimeInMinutes <= eveningClose) {
        if (currentTimeInMinutes >= (eveningClose - 30)) {
          return 'Closing Soon';
        }
        return 'Open';
      }

      if (currentTimeInMinutes >= (eveningOpen - 30) && currentTimeInMinutes < eveningOpen) {
        return 'Opening Soon';
      }
    }


    return 'Closed';
  }


  refreshRatingData() {
    this.customerServ.getCustomerInMessDetails().subscribe(
      (data: any) => {
        console.log('Full response data:', data);

        // Check if response indicates unauthenticated access
        if (data?.message === 'Please login' || !data.rating) {
          console.warn('User not logged in or no rating data.');
          // Handle unauthenticated user, e.g., redirect to login
          // Handle unauthenticated user, e.g., redirect to login
          this['router'].navigate(['/login']);
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
          const averageRating = totalRating / this.totalRatings;
          this.star = averageRating.toFixed(1);
        } else {
          this.star = '0';
        }
      },
      (error) => {
        console.error('Error fetching rating data:', error);
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

  visible: boolean = false;

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
