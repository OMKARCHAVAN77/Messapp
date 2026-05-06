import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../Shared/Services/customer.service';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css'
})
export class MenuListComponent {
  days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  myMenuOwnerDetailsList: any[] = [];
  myMessUserId: any;
  myMorningMenuList: any;
  myEveningMenuList: any;
  myPriceDetailsList: any;
  myUnqiuePriceDetails:any;

  currentDay: any;
  constructor(private matDialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any, private customerServ: CustomerService, private messDashboardservice: MessDashboardService) { }
  ngOnInit(): void {
    console.log(this.data.messOwnerUserId);
    this.myMessUserId = this.data.messOwnerUserId;
    this.customerServ.getCustomerInMessDetails().subscribe({
      next: (res: any) => {
        console.log(res);
        // console.log(res.priceDetails)
        // console.log(res.menuDetails);
        this.myPriceDetailsList = res.priceDetails;
        // console.log('myPriceDetailsList >>>>>>', this.myPriceDetailsList)
        this.myMenuOwnerDetailsList = res.menuDetails;
        // console.log(this.myMenuOwnerDetailsList);
        this.getMenuDetails();
        this.getPriceDetails();
      }
    });
    // this.getDays();
  }

  getMenuDetails() {
    this.myMenuOwnerDetailsList.find((menuMatchUserId: any) => {
      if (menuMatchUserId.userId === this.myMessUserId) {
        console.log(menuMatchUserId);
        this.getDays(menuMatchUserId)
      }
    })
  }

  getPriceDetails() {
    const myUnquiePrice = this.myPriceDetailsList.find((mypriceId: any) => mypriceId.userId === this.myMessUserId);
    console.log('myUnquiePrice >>>>',myUnquiePrice);
    this.myUnqiuePriceDetails = myUnquiePrice;
  }




  getDays(menuList: any) {
    const date = new Date();
    console.log(date);
    const daysNumber = date.getDay();
    console.log(daysNumber);
    const currentDayName = this.days[daysNumber];
    this.currentDay = currentDayName + ' Menu';
    console.log("Current day:", currentDayName);

    if (menuList.morning && menuList.morning[currentDayName]) {
      this.myMorningMenuList = menuList.morning[currentDayName];;
      console.log('Morning Menu:', this.myMorningMenuList);
    }

    if (menuList.evening && menuList.evening[currentDayName]) {
      this.myEveningMenuList = menuList.evening[currentDayName];;
      console.log('Evening Menu:', this.myEveningMenuList);
    }
  }



}
