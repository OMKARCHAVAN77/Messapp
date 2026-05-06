import { Component, Inject } from '@angular/core';
import { CustomerService } from '../../../Shared/Services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-feed-back-page',
  templateUrl: './feed-back-page.component.html',
  styleUrl: './feed-back-page.component.css'
})
export class FeedBackPageComponent {
  rating: number = 0;  // Stores the selected rating
  tempRating: number = 0; // Temporary rating for hover effect
  starArray = [1, 2, 3, 4, 5];
  feedback: string = '';
  myCustomerUserId: any;
  myUserId: any;
  myMessName: string = '';
  myMessOwnerUserId:any;
  constructor(private customerServ: CustomerService, private tostrServ: ToastrService, private matDialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    // this.myCustomerUserId = localStorage.getItem('CustomerUserId'); 
    this.myUserId = localStorage.getItem('userId');
    // console.log('customer User Id >>>', this.myCustomerUserId);
    // console.log('data >>>',this.data);
    this.myMessName = this.data.name;
    this.myMessOwnerUserId = this.data.messOwnerUserId;
    console.log(this.myMessName);
    console.log('myMessOwnerUserId >>>>',this.myMessOwnerUserId);
  }


  resetHover() {
    this.tempRating = this.rating; // Reset to stored rating
  }


  onRating(myStar: any) {
    // console.log(myStar);
    this.rating = myStar;
    // console.log(this.rating);
  }

  // In FeedBackPageComponent
  onSubmitFeedBack() {
    const payLoad = {
      customerUserId: this.myUserId,
      messUserId: this.myMessOwnerUserId ,
      rating: this.rating,
      feedback: this.feedback
    }
    console.log(payLoad)
    this.customerServ.postFeedBackDetails(payLoad).subscribe({
      next: (_resp: any) => {
        this.tostrServ.success('Feedback submitted successfully');
        // Return true to indicate successful submission
        this.matDialogRef.close(true);
      },
      error: (_err: any) => {
        console.log(_err);
        this.tostrServ.error('Error in submitting feedback');
        this.matDialogRef.close(false);
      }
    });
  }
}
