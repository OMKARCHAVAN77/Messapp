import { Component } from '@angular/core';
import { RatingViewsChartService } from '../../Shared/Services/rating-views-chart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  myFeedBack:any[] = [];
  constructor(private ratingViewChartsServ :RatingViewsChartService,private router : Router){}
  ngOnInit(): void {
    this.getRatingDetails();
  }

  getRatingDetails(){
    this.ratingViewChartsServ.getRatingDetailsList().subscribe({
      next:(_ratingData:any)=>{
        console.log("_ratingData >>>",_ratingData);
        console.log("_ratingData >>>",_ratingData.data);
        this.myFeedBack = _ratingData.data;
      },
      error:(_error:any)=>{
        console.log("_error >>>",_error);
      }
    })
  }


 

  getRatingColor(rating: number): string {
    if (rating >= 4) return 'green';
    if (rating >= 2.5) return 'orange';
    return 'red';
  }
  
  getStars(rating: number): boolean[] {
    const fullStars = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => i < fullStars);
  }

  onLogoutButton(){
  this.router.navigate(['login'])
}
}
