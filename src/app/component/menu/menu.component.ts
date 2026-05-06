import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface MenuItem {
  day: string;
  morningMenu: string[];
  eveningMenu: string[];
  expanded: boolean
}

interface MenuResponse {
  success: boolean;
  msg: string;
  data: {
    morning: { [key: string]: string[] };
    evening: { [key: string]: string[] };
    userId: string;
    _id: string;
    __v: number;
    
  };
}
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
onLogoutButton() {
  this.router.navigate(['login'])
}
 mymenulist:any
  MenuDetailsForm!: FormGroup;
  myMenuDetailsArr: any[] = [];
 menuList: MenuItem[] = [
  { day: 'Monday', morningMenu: [], eveningMenu: [], expanded: true },
  { day: 'Tuesday', morningMenu: [], eveningMenu: [], expanded: true },
  { day: 'Wednesday', morningMenu: [], eveningMenu: [], expanded: true },
  { day: 'Thursday', morningMenu: [], eveningMenu: [], expanded: true },
  { day: 'Friday', morningMenu: [], eveningMenu: [], expanded: true },
  { day: 'Saturday', morningMenu: [], eveningMenu: [], expanded: true },
  { day: 'Sunday', morningMenu: [], eveningMenu: [], expanded: true },
]


  constructor( private fb: FormBuilder,private tostrServ: ToastrService,private messDashboardServ:MessDashboardService,private router :Router) { }

  ngOnInit(): void {
    this.initialMessDetailsForm();
    this.getMenuDetails()
    this.setValue(  )
  }


  
  initialMessDetailsForm() {
    this.MenuDetailsForm = this.fb.group({
      menuDetails: this.fb.group({
        userId: localStorage.getItem('userId'),
        morning: this.fb.group({
          Monday: this.fb.array<string>([], Validators.required),
          Tuesday: this.fb.array<string>([], Validators.required),
          Wednesday: this.fb.array<string>([], Validators.required),
          Thursday: this.fb.array<string>([], Validators.required),
          Friday: this.fb.array<string>([], Validators.required),
          Saturday: this.fb.array<string>([], Validators.required),
          Sunday: this.fb.array<string>([], Validators.required),
        }),
        evening: this.fb.group({
          Monday: this.fb.array<string>([], Validators.required),
          Tuesday: this.fb.array<string>([], Validators.required),
          Wednesday: this.fb.array<string>([], Validators.required),
          Thursday: this.fb.array<string>([], Validators.required),
          Friday: this.fb.array<string>([], Validators.required),
          Saturday: this.fb.array<string>([], Validators.required),
          Sunday: this.fb.array<string>([], Validators.required),
        }),
      }),
    });
  }
  

  

  // Helper method to get FormArray
  getFormArray(day: string, time: 'morning' | 'evening'): FormArray {
    return this.MenuDetailsForm.get(`menuDetails.${time}.${day}`) as FormArray;
  }

  showToFoodItem(day: string, time: 'morning' | 'evening', inputElement: HTMLInputElement) {
    const foodVal = inputElement.value.trim();
    if (!foodVal) return;

    const formArray = this.getFormArray(day, time);
    const menu = this.menuList.find(m => m.day === day);

    if (menu) {
      const menuItems = time === 'morning' ? menu.morningMenu : menu.eveningMenu;
      
      if (!menuItems.includes(foodVal)) {
        // Update menuList
        if (time === 'morning') {
          menu.morningMenu = [...menu.morningMenu, foodVal];
        } else {
          menu.eveningMenu = [...menu.eveningMenu, foodVal];
        }
        
        // Update form control
        formArray.push(this.fb.control(foodVal));
      } else {
        alert(`${time === 'morning' ? 'Morning' : 'Evening'} food already added`);
      }
    }

    inputElement.value = '';
  }

  toggleFoodSelection(day: string, time: 'morning' | 'evening', foodItem: string, isChecked: boolean) {
    const formArray = this.getFormArray(day, time);
    const menu = this.menuList.find(item => item.day === day);

    if (menu) {
      if (isChecked) {
        // Add item to both menuList and form control
        if (time === 'morning') {
          if (!menu.morningMenu.includes(foodItem)) {
            menu.morningMenu.push(foodItem);
            formArray.push(this.fb.control(foodItem));
          }
        } else {
          if (!menu.eveningMenu.includes(foodItem)) {
            menu.eveningMenu.push(foodItem);
            formArray.push(this.fb.control(foodItem));
          }
        }
      } else {
        // Remove item from both menuList and form control
        if (time === 'morning') {
          menu.morningMenu = menu.morningMenu.filter(food => food !== foodItem);
        } else {
          menu.eveningMenu = menu.eveningMenu.filter(food => food !== foodItem);
        }

        // Remove from form array
        const index = formArray.controls.findIndex(control => control.value === foodItem);
        if (index > -1) {
          formArray.removeAt(index);
        }
      }
    }
  }

  isFoodSelected(day: string, time: 'morning' | 'evening', foodItem: string): boolean {
    const formArray = this.getFormArray(day, time);
    return formArray.controls.some(control => control.value === foodItem);
  }

expandAll() {
  this.menuList.forEach(item => {
    item.expanded = true;
    // Trigger change detection if needed
  });
}

collapseAll() {
  this.menuList.forEach(item => {
    item.expanded = false;
    // Trigger change detection if needed
  });
}

   getMenuDetails() {
    this.messDashboardServ.getMenuDetailsList().subscribe({
      next:(_response:any)=>{
        console.log('menu Details Information >>>>',_response);
        
        this.mymenulist = _response.data;
        this.setValue(); 
      },
      error:(_error:any)=>{
        console.log(_error);
      }
    })
  }

  setValue(){
    if (!this.mymenulist) return;

    const morningData = this.mymenulist.morning;
    const eveningData = this.mymenulist.evening;
  
    Object.keys(morningData).forEach(day => {
      const control = this.getFormArray(day, 'morning');
      morningData[day]?.forEach((food: string) => {
        control.push(this.fb.control(food));
  
        const menuDay = this.menuList.find(m => m.day === day);
        if (menuDay && !menuDay.morningMenu.includes(food)) {
          menuDay.morningMenu.push(food);
        }
      });
    });
  
    Object.keys(eveningData).forEach(day => {
      const control = this.getFormArray(day, 'evening');
      eveningData[day]?.forEach((food: string) => {
        control.push(this.fb.control(food));
  
        const menuDay = this.menuList.find(m => m.day === day);
        if (menuDay && !menuDay.eveningMenu.includes(food)) {
          menuDay.eveningMenu.push(food);
        }
      });
    });
  
    console.log('✅ Morning and Evening menu patched to checkboxes!');
      
  }

  mySetMenuDetails() {
    this.myMenuDetailsArr?.forEach((menuDetails: any) => {
      // Morning
      Object.keys(menuDetails.morning).forEach(day => {
        const control = this.getFormArray(day, 'morning');
        menuDetails.morning[day].forEach((item: string) => {
          control.push(this.fb.control(item));
        });
      });

      // Evening
      Object.keys(menuDetails.evening).forEach(day => {
        const control = this.getFormArray(day, 'evening');
        menuDetails.evening[day].forEach((item: string) => {
          control.push(this.fb.control(item));
        });
      });
    });
  }
  onMenuDetailsSubmit(){
      const formData = this.MenuDetailsForm.value;

      console.log(formData);
         this.messDashboardServ.patchMenuDetailsList(formData).subscribe({
      next: (response: any) => {
      

      this.tostrServ.success('updated successfully');
        // this.getMessDetails();
      },
      error: (error: any) => {
        console.error('Error updating mess details:', error);
        console.error('Backend message:', error.error);
        this.tostrServ.error('Error in updating ');
      }
    });
  } 

  toggleDay(day: string) {
  const menuItem = this.menuList.find(item => item.day === day);
  if (menuItem) {
    menuItem.expanded = !menuItem.expanded;
  }
}

isExpanded(day: string): boolean {
  const menuItem = this.menuList.find(item => item.day === day);
  return menuItem ? menuItem.expanded : false;
}
  
}
 


