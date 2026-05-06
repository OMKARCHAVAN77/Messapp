import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';
import { ShareFoodTypeService } from '../../Shared/Services/share-food-type.service';
import { MessFormDataService } from '../../Shared/Services/mess-form-data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrl: './price.component.css'
})
export class PriceComponent implements OnInit {
  priceDetails!: FormGroup;
  mypriceDetails: any;
  myFoodType:any;
  myGetLocalStorageFoodType:any;
  myDemoFoodType:any;


  constructor(private fb: FormBuilder,private tostrServ: ToastrService,private router :Router, private messDashboardServ: MessDashboardService,private sharedFoodServ:ShareFoodTypeService) { }
  ngOnInit(): void {
    this.initialPriceForm();
    this.getPriceDetails();
  
    // Load from local storage (optional fallback)
    this.myGetLocalStorageFoodType = localStorage.getItem('foodType');
  
    // 1. First fetch food type from backend
    this.getMessFoodTypeDetails();
  
    // 2. Subscribe to food type changes (manual selection)
    this.sharedFoodServ.getFoodType().subscribe((param: any) => {
      this.myFoodType = param;
      localStorage.setItem('foodType', this.myFoodType);
      this.priceDetails.patchValue({ foodType: param });
    });
  }
  
  initialPriceForm() {
    this.priceDetails = this.fb.group({
      userId: localStorage.getItem('userId'),
      foodType: [''],
      monthlyCharges: ['', [Validators.required, Validators.min(1)]],
      singleDayCharges: ['', [Validators.required, Validators.min(1)]],
      specialDayVegCharges: ['', [Validators.required, Validators.min(1)]],
      specialDaynonVegCharges: ['', [Validators.required, Validators.min(1)]],

    })
  }

  getPriceDetails() {
    this.messDashboardServ.getPriceDetailsList().subscribe({
      next: (_response: any) => {
        //console.log('Price Details Information >>>>', _response);
        this.mypriceDetails = _response.data;
        //console.log(this.mypriceDetails);
            this.setValue();
        
      },
      error: (_error: any) => {
        //console.log(_error);
      }
    })
  }

  setValue() {
    this.priceDetails.patchValue({
      foodType:  this.myDemoFoodType,  // Already set in ngOnInit
      monthlyCharges: this.mypriceDetails?.monthlyCharges,
      singleDayCharges: this.mypriceDetails?.singleDayCharges,
      specialDayVegCharges: this.mypriceDetails?.specialDayVegCharges,
      specialDaynonVegCharges: this.mypriceDetails?.specialDaynonVegCharges,
    });
  
    //console.log('Patched form values >>>', this.priceDetails.value);
  }
  onSave() {
   const formData = this.priceDetails.value
     console.log('Submitted Payload >>>', formData);

    this.messDashboardServ.patchPriceDetailsList(formData).subscribe({
      next: (response: any) => {
        console.log('Mess details updated successfully:', response);
          this.tostrServ.success('updated successfully');
      },
      error: (error: any) => {
        console.error('Error updating mess details:', error);
        console.error('Backend message:', error.error);
         this.tostrServ.error('Error in updating ');
      }
    });
  }

  getMessFoodTypeDetails() {
    this.messDashboardServ.getMessDetailsList().subscribe((param: any) => {
      this.myDemoFoodType = param.data.foodType;
      localStorage.setItem('foodType', this.myDemoFoodType);
  
      // ✅ Call setValue AFTER getting foodType
      this.setValue();
    });
  }


  onLogoutButton(){
    this.router.navigate(['login'])
  }
}