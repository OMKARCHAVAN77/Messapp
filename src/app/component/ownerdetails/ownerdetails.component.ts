import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {FormGroup,FormBuilder, Validators,FormArray,FormControl,} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { MessFormDataService } from '../../Shared/Services/mess-form-data.service';
import { CloudinaryService } from '../../Shared/Services/cloudinary.service';

@Component({
  selector: 'app-ownerdetails',
  templateUrl: './ownerdetails.component.html',
  styleUrl: './ownerdetails.component.css',
})
export class OwnerdetailsComponent implements OnInit {
  myMessForm!: FormGroup;
  imagePreviews: string[] = [];
  myFoodLicensePhoto: any;
  selectedFiles: File[] = [];
  preview: string | ArrayBuffer | null = null;
  licenseImagePreview: string | null = null;
  manyPreviews: (string | ArrayBuffer | null)[] = [];
  previews: string[] = [];
  checked = true;
  selectedHoliday = 'Monday';
  selectedOption = 'full-day';
  daysa = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  days: string[] = [...this.daysa];

  constructor(
    private fb: FormBuilder,
    private cloudServ: CloudinaryService,
    private cdr: ChangeDetectorRef,
    private messDetailsServ: MessFormDataService,
    private router: Router
  ) {}
  messUserId: any;

  ngOnInit() {
    // Additional initialization if needed
    this.initialMessDetailsForm();
    this.setDefaultCheckedMenuItems();
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('licenseFileInput') licenseFileInput!: ElementRef;

  initialMessDetailsForm() {
    this.myMessForm = this.fb.group({
      messDetails: this.fb.group({
        userId: localStorage.getItem('userId'),
        messName: ['', Validators.required],
        address: this.fb.group({
          shopNumber: ['', Validators.required],
          area: ['', Validators.required],
          city: ['', Validators.required],
          pincode: [
            '',
            [Validators.required, Validators.pattern(/^[0-9]{6}$/)],
          ],
          landmark: ['', Validators.required],
        }),
        contact: this.fb.group({
          mobileNumber: [
            '',
            [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
          ],
          email: ['', [Validators.required, Validators.email]],
        }),
        license: this.fb.group({
          licenseNumber: ['', Validators.required],
          licenseImage: this.fb.control('', Validators.required),
        }),
        foodType: ['veg', Validators.required],
        messImages: this.fb.array([]),
      }),
      menuDetails: this.fb.group({
        userId: localStorage.getItem('userId'),
        morning: this.fb.group({
          Monday: this.fb.array([], Validators.required),
          Tuesday: this.fb.array([], Validators.required),
          Wednesday: this.fb.array([], Validators.required),
          Thursday: this.fb.array([], Validators.required),
          Friday: this.fb.array([], Validators.required),
          Saturday: this.fb.array([], Validators.required),
          Sunday: this.fb.array([], Validators.required),
        }),
        evening: this.fb.group({
          Monday: this.fb.array([], Validators.required),
          Tuesday: this.fb.array([], Validators.required),
          Wednesday: this.fb.array([], Validators.required),
          Thursday: this.fb.array([], Validators.required),
          Friday: this.fb.array([], Validators.required),
          Saturday: this.fb.array([], Validators.required),
          Sunday: this.fb.array([], Validators.required),
        }),
      }),
      priceDetails: this.fb.group({
        userId: localStorage.getItem('userId'),
        monthlyCharges: ['', [Validators.required, Validators.min(1)]],
        singleDayCharges: ['', [Validators.required, Validators.min(1)]],
        specialDayVegCharges: ['', [Validators.required, Validators.min(1)]],
        specialDaynonVegCharges: ['', [Validators.required, Validators.min(1)]],
      }),
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
          period: this.fb.control('full-day', Validators.required),
        }),
      }),
    });
  }

  onLicenseFileChange(event: any): void {
    const file = event.target.files[0];

    if (!file) return;
    console.log('Selected file:', file);

    this.cloudServ.uploadImages(file).subscribe({
      next: (res: any) => {
        console.log('Upload response:', res);

        this.myMessForm.get('messDetails.license.licenseImage')?.setValue(res);
      },
      error: (err: any) => {
        console.error('Image upload failed:', err);
      },
    });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.licenseImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

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

            const messImagesArray = this.myMessForm.get(
              'messDetails.messImages'
            ) as FormArray;
            messImagesArray.push(new FormControl(imageUrl));
          },
          error: (err: any) => {
            console.error('Error uploading image:', err);
          },
        });
      });

      input.value = '';
    }
  }

  removeImage(index: number): void {
    const messImagesArray = this.myMessForm.get(
      'messDetails.messImages'
    ) as FormArray;
    if (messImagesArray.length > index) {
      messImagesArray.removeAt(index);
    }

    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);

    if (this.selectedFiles.length === 0) {
      this.resetFileInput();
    }
  }

  resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getSelectedFileNames(): string {
    return this.selectedFiles.length > 0
      ? this.selectedFiles.map((file) => file.name).join(', ')
      : 'Choose file or drop here';
  }

  get messImages() {
    return this.myMessForm.get('messDetails.messImages') as FormArray;
  }

  //menu
  menuList = [
    {
      day: 'Monday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
    {
      day: 'Tuesday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
    {
      day: 'Wednesday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
    {
      day: 'Thursday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
    {
      day: 'Friday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
    {
      day: 'Saturday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
    {
      day: 'Sunday',
      morningMenu: ['chapati', 'rice', 'daal', 'papad'],
      eveningMenu: ['chapati', 'rice', 'daal', 'papad'],
      expanded: true,
    },
  ];
  day: any;
  setDefaultCheckedMenuItems() {
    this.menuList.forEach((menu) => {
      const day = menu.day;

      // Set default checked items for MORNING
      const morningArray = this.getMenuFormArray(day, 'morning');
      menu.morningMenu.forEach((item) => {
        morningArray.push(this.fb.control(item));
      });

      // Set default checked items for EVENING
      const eveningArray = this.getMenuFormArray(day, 'evening');
      menu.eveningMenu.forEach((item) => {
        eveningArray.push(this.fb.control(item));
      });
    });
  }
  expandAll() {
    this.menuList.forEach((item) => (item.expanded = true));
  }

  collapseAll() {
    this.menuList.forEach((item) => (item.expanded = false));
  }

  // Get FormArray for a specific day and time
  getMenuFormArray(day: string, time: 'morning' | 'evening'): FormArray {
    return this.myMessForm.get(`menuDetails.${time}.${day}`) as FormArray;
  }

  //addFoodItem is Menu Component
  showToFoodItem(
    day: string,
    time: 'morning' | 'evening',
    inputElement: HTMLInputElement
  ) {
    const foodVal = inputElement.value.trim();
    if (!foodVal) return;

    const menuArray = this.getMenuFormArray(day, time);
    const targetMenu = this.menuList.find((menu) => menu.day === day);

    if (targetMenu) {
      const menuItems =
        time === 'morning' ? targetMenu.morningMenu : targetMenu.eveningMenu;

      if (!menuItems.includes(foodVal)) {
        // Add to menuList
        menuItems.push(foodVal);
        // Add to form control
        menuArray.push(this.fb.control(foodVal));
        // Clear input
        inputElement.value = '';
        this.cdr.detectChanges();
      } else {
        alert(
          `${time === 'morning' ? 'Morning' : 'Evening'} food already added`
        );
      }
    }
  }
  myNewArr: any = [];
  //CheckBox Code
  toggleFoodSelection(
    day: string,
    time: 'morning' | 'evening',
    foodItem: string,
    isChecked: boolean
  ) {
    const menuArray = this.getMenuFormArray(day, time);
    const targetMenu = this.menuList.find((menu) => menu.day === day);

    if (targetMenu) {
      const menuItems =
        time === 'morning' ? targetMenu.morningMenu : targetMenu.eveningMenu;

      if (isChecked) {
        // Add item if not already in FormArray
        if (!menuArray.value.includes(foodItem)) {
          menuArray.push(this.fb.control(foodItem));
        }
      } else {
        // Remove from menuList
        const menuIndex = menuItems.indexOf(foodItem);
        if (menuIndex > -1) {
          menuItems.splice(menuIndex, 1);
        }

        // Remove from FormArray
        const formIndex = menuArray.controls.findIndex(
          (control) => control.value === foodItem
        );
        if (formIndex > -1) {
          menuArray.removeAt(formIndex);
        }
      }

      this.cdr.detectChanges();
    }
  }

  isFoodSelected(
    day: string,
    time: 'morning' | 'evening',
    foodItem: string
  ): boolean {
    const menuArray = this.getMenuFormArray(day, time);
    return menuArray.value.includes(foodItem);
  }

  onMessDetailsSubmit() {
  console.log('Submitted Payload >>>', this.myMessForm.value);

  this.messDetailsServ
    .postMessOwnerDetailsList(this.myMessForm.value)
    .subscribe({
      next: (response: any) => {
        console.log('Success:', response);
        this.router.navigate(['layout/dashbord']);
      },
      error: (error: any) => {
        console.error('Submit Error:', error);
        if (error.status === 504) {
          // ✅ Backend timeout — retry automatically
          setTimeout(() => {
            this.messDetailsServ
              .postMessOwnerDetailsList(this.myMessForm.value)
              .subscribe({
                next: (response: any) => {
                  console.log('Retry Success:', response);
                  this.router.navigate(['layout/dashbord']);
                },
                error: (err: any) => {
                  console.error('Retry failed:', err);
                  alert('Please click Submit again');
                }
              });
          }, 3000); // wait 3 seconds then retry
        } else if (error.status === 400) {
          // ✅ Data already exists — go to dashboard
          this.router.navigate(['layout/dashbord']);
        } else {
          alert('Error: ' + (error.error?.msg || 'Please try again'));
        }
      },
    });
}

  removeLicenseImage(): void {
    this.licenseImagePreview = null;
    const input = document.getElementById(
      'licenseFileInput'
    ) as HTMLInputElement;
    if (input) {
      input.value = ''; // Reset file input
    }
  }
}
