import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';
import { CloudinaryService } from '../../Shared/Services/cloudinary.service';
import { ShareFoodTypeService } from '../../Shared/Services/share-food-type.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DetailsComponent implements OnInit {
  messDetails!: FormGroup
  myMessDetails:any
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  licenseImagePreview: string | null = null;
  myFoodLicensePhoto:any

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('licenseFileInput') licenseFileInput!: ElementRef;
  toastrServ: any;
  constructor(private fb: FormBuilder,private snackBar: MatSnackBar,private tostrServ: ToastrService,private router :Router,private messDashboardServ:MessDashboardService, private cloudServ :CloudinaryService,private sharedFoodServ:ShareFoodTypeService ) { }


  ngOnInit(): void {
    this.initialDetailsForm();
    this.getMessDetails();
    this.setValue();
  }
  
  
  initialDetailsForm() {
    this.messDetails = this.fb.group({
     userId: localStorage.getItem('userId') || '',
        messName: ['', Validators.required],
        address: this.fb.group({
          shopNumber: ['', Validators.required],
          area: ['', Validators.required],
          city: ['', Validators.required],
          pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
          landmark: ['', Validators.required]
        }),
        contact: this.fb.group({
          mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
          email: ['', [Validators.required, Validators.email]]
        }),
        license: this.fb.group({
          licenseNumber: ['', Validators.required],
          licenseImage: this.fb.control('', Validators.required),

        }),
         foodType: ['veg', Validators.required],
        messImages: this.fb.array([])
    });

  }


  resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

 



  getMessDetails(){
    this.messDashboardServ.getMessDetailsList().subscribe({
      next:(_response:any)=>{
        console.log('Mess Details Information >>>>',_response);
        this.myFoodLicensePhoto = _response.data.license.licenseImage;
        this.myMessDetails = _response.data
        console.log(this.myMessDetails);
        this.setValue();
      },
      error:(_error:any)=>{
        console.log(_error);
      }
    })
  }


  setValue() {
    // debugger
    this.messDetails.patchValue({
      messName: this.myMessDetails?.messName,
      address: this.myMessDetails?.address,
      contact: this.myMessDetails?.contact,
      license: {
        licenseNumber: this.myMessDetails?.license?.licenseNumber,
        licenseImage: this.myMessDetails?.license?.licenseImage
      },
      
      foodType: this.myMessDetails?.foodType
    });

    // Patch mess images into FormArray
    const messImagesArray = this.messDetails.get('messImages') as FormArray;
    messImagesArray.clear();
    if (this.myMessDetails?.messImages?.length) {
      this.myMessDetails.messImages.forEach((imgUrl: string) => {
        messImagesArray.push(new FormControl(imgUrl));
        this.imagePreviews.push(imgUrl); // Display the preview
      });
    }

    // Set license image preview
    this.licenseImagePreview = this.myMessDetails?.license?.licenseImage;
  }

  // Handle license image change
  onLicenseFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.cloudServ.uploadImages(file).subscribe({
      next: (res: any) => {
        // debugger
        this.messDetails.get('license.licenseImage')?.setValue(res); 
        this.myFoodLicensePhoto= res
        console.log('Ala ala ala >>>',this.myFoodLicensePhoto)
        // Set the image path
      },
      error: (err) => {
        console.error('Image upload failed:', err);
      }
    });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.licenseImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Handle mess image selection
  onFileChange(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);

        this.cloudServ.uploadImages(file).subscribe({
          next: (res: any) => {
            const imageUrl = res;
            const messImagesArray = this.messDetails.get('messImages') as FormArray;
            messImagesArray.push(new FormControl(imageUrl)); // Add image URL to FormArray
          },
          error: (err) => {
            console.error('Error uploading image:', err);
          }
        });
      });

      input.value = ''; // Reset input
    }
  }

  // Remove an image from the FormArray
  removeImage(index: number): void {
    const messImagesArray = this.messDetails.get('messImages') as FormArray;
    if (messImagesArray.length > index) {
      messImagesArray.removeAt(index);
    }

    this.imagePreviews.splice(index, 1);
  }

  // Get selected files' names (for display)
  getSelectedFileNames(): string {
    return this.selectedFiles.length > 0
      ? this.selectedFiles.map((file) => file.name).join(', ')
      : 'Choose file or drop here';
  }

  // On Save - Get paths of all uploaded images
  onSave() {
    const formData = this.messDetails.value;
    console.log('Submitted Payload >>>', formData);

    this.messDashboardServ.patchMessDetailsList(formData).subscribe({
      next: (response: any) => {
        console.log('Mess details updated successfully:', response);
        this.tostrServ.success('Feedback submitted successfully');
      
      },
      error: (error: any) => {
        console.error('Error updating mess details:', error);
        console.error('Backend message:', error.error);
           this.tostrServ.error('Error in submitting feedback');
      }
    });
  }

  //remove btn function
  removePhoto() {
    this.myFoodLicensePhoto = null;
  }

  onVegNonVeg(foodType:any){
    console.log(foodType);
    this.sharedFoodServ.setFoodType(foodType);
  }

    onLogoutButton(){
  this.router.navigate(['login'])
}
}