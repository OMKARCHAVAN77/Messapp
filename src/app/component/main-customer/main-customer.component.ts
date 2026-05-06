import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CustomerService } from '../../Shared/Services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FilterPageComponent } from '../filter-page/filter-page.component';
import { MenuListComponent } from '../menu-list/menu-list.component';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-main-customer',
  templateUrl: './main-customer.component.html',
  styleUrl: './main-customer.component.css'
})
export class MainCustomerComponent {
  
  locationSearch: string = '';
  cityControl = new FormControl('')
  locations: string[] = [];
  myNewMessDetailsInformationObj: { messDetails: any[]; timeDetails: any[], rating: any[], menuDetails: any[] } = { messDetails: [], timeDetails: [], rating: [], menuDetails: [] };
  isOpen: boolean = true;
  stars: number[] = [1, 2, 3, 4, 5];
  rating: number | any = 0.0;
  filteredMessDetails: any[] = []; // Holds the filtered mess list
  searchTerm: string = ''; // Holds the search term
  clickLocationCity: any[] = [];
  isNotLocationFound: boolean = false; // Flag to check if no location is found
  isNotSerachMess: boolean = false;
  star: any;
  myMessFoodType: string = '';
  myFliterRating: any;
  filteredCities: string[] = [];
  totalMessCount: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 6; // Number of items per page
  pageIndex = 0; // Current page index
  paginatedMessDetails: any[] = []; // Holds the paginated mess list
  searchQuery: any;
  storedData: any;


  constructor(public dialog: MatDialog, private customerServ: CustomerService, private router: Router, private activeRoute: ActivatedRoute, private cdRef: ChangeDetectorRef, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getMessDetailsInCustomer();
    this.getFilterRatingInMyApi();
    this.paginatedMessDetails = [];
    this.filteredMessDetails = [];
    // this.getCityName();
    this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value || ''))
    ).subscribe(filtered => {
      this.filteredCities = filtered;
      // Also filter the mess list based on the city input
      this.onLocationChange(this.cityControl.value || '');
    });
  }

  private _filterCities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(location =>
      location.toLowerCase().includes(filterValue)
    );
  }






  // In your FilterPageComponent, make sure foodTypes match your backend data
  foodTypes = ['veg', 'non-veg']; // or whatever values your backend uses
  selectedFoodType: string = 'all'; // default value

  // In your main component where you handle filtering:

  // Combined filter method
  applyFilters(): void {
    if (!this.myNewMessDetailsInformationObj?.messDetails) {
      this.filteredMessDetails = [];
      this.updatePaginatedData();
      return;
    }

    let filtered = [...this.myNewMessDetailsInformationObj.messDetails];

    // Apply food type filter if not 'all'
    if (this.myMessFoodType && this.myMessFoodType !== 'all') {
      filtered = filtered.filter(mess => mess.foodType === this.myMessFoodType);
    }

    // Apply rating filter if not 'Any'
    if (this.myFliterRating && this.myFliterRating !== 'Any') {
      const minRating = parseFloat(this.myFliterRating);
      filtered = filtered.filter(mess => {
        const messRatings = this.myNewMessDetailsInformationObj.rating
          ?.filter(rating => rating.messUserId === mess.userId)
          ?.map(rating => rating.rating) || [];

        if (messRatings.length === 0) return false;

        const averageRating = messRatings.reduce((sum, rating) => sum + rating, 0) / messRatings.length;
        return averageRating >= minRating;
      });
    }

    this.filteredMessDetails = filtered;
    this.updatePaginatedData();
  }




  filterMessDetails() {
    const query = this.searchQuery?.toLowerCase() || '';

    this.filteredMessDetails = this.storedData?.messDetails?.filter((mess: { messName: string; address: { city: string; }; }) =>
      mess?.messName?.toLowerCase().includes(query) ||
      mess?.address?.city?.toLowerCase().includes(query)
    ) || [];

    this.filteredMessDetails.forEach(mess => {
      const ratings = this.storedData?.rating
        .filter((r: { messUserId: any; }) => r.messUserId === mess.userId)
        .map((r: { rating: any; }) => r.rating);

      const averageRating = ratings.length
        ? ratings.reduce((sum: any, r: any) => sum + r, 0) / ratings.length
        : 0;

      mess.averageRating = parseFloat(averageRating.toFixed(1));
      mess.stars = this.generateStars(mess.averageRating);
      mess.totalRatings = ratings.length;
    });
  }
  generateStars(averageRating: any): any {
    throw new Error('Method not implemented.');
  }
  // Modify your dialog handler to use the combined filter
  openMyFilter(): void {
    const dialogRef = this.dialog.open(FilterPageComponent, {
        width: '350px',
        data: { name: 'Dialog' },
        panelClass: 'custom-filter-dialog',
        backdropClass: 'custom-transparent-backdrop',
        position: {
          top: '70px',
          right: '10px'
        },
        hasBackdrop: true, // Optional: set to false if you don’t want any backdrop
        disableClose: false // Optional: allow closing on outside click or ESC
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.myFliterRating = result.rating;
        this.myMessFoodType = result.foodType;
        this.applyFilters();
      }
    });
  }



  getMessDetailsInCustomer(): void {
    this.customerServ.getCustomerInMessDetails().subscribe({
      next: (resp: any) => {
        console.log('API Response:', resp);
        if (resp) {
          this.myNewMessDetailsInformationObj = resp;
          this.filteredMessDetails = [...resp.messDetails];
          this.updatePaginatedData();
          this.totalMessCount = this.filteredMessDetails.length;
          console.log('91 filterMessDetails >>>>>', this.filteredMessDetails)
          if (this.paginator) {
            this.paginator.firstPage();
          }
          console.log('myNewMessDetailsInformationObj >>>>>', this.myNewMessDetailsInformationObj);
          this.getCityName(this.myNewMessDetailsInformationObj);
          // console.log('rating show in console',this.myNewMessDetailsInformationObj.rating);
        }
      },
      error: (error: any) => {
        console.error('API Error:', error);
      }
    });
  }

  mobileMenuVisible: boolean = false;

  onclick() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
  }


  getFilterFoodTypeInMyApi() {
    // Check if messDetails exists and is an array
    if (!this.myNewMessDetailsInformationObj?.messDetails || !Array.isArray(this.myNewMessDetailsInformationObj.messDetails)) {
      console.error("Invalid or missing mess details data.", this.myNewMessDetailsInformationObj);
      this.filteredMessDetails = [];
      return;
    }

    // Log mess details before filtering
    console.log("Original Mess Details:", this.myNewMessDetailsInformationObj.messDetails);

    // Log selected food type
    console.log("Selected Food Type:", this.myMessFoodType);

    this.filteredMessDetails = this.myMessFoodType
      ? this.myNewMessDetailsInformationObj.messDetails.filter((foodchoose: any) => {
        console.log("Checking Food Type:", foodchoose.foodType, "vs", this.myMessFoodType);
        return foodchoose.foodType === this.myMessFoodType;
      })
      : this.myNewMessDetailsInformationObj.messDetails;

    // Log filtered results
    console.log("Filtered Mess Details:", this.filteredMessDetails);
    this.updatePaginatedData();
  }

  //choose to the my rating in filter
  getFilterRatingInMyApi() {
    // First filter by food type if needed
    let filteredByFood = this.myMessFoodType
      ? this.myNewMessDetailsInformationObj.messDetails.filter(mess => mess.foodType === this.myMessFoodType)
      : this.myNewMessDetailsInformationObj.messDetails;

    // Then filter by rating
    this.filteredMessDetails = filteredByFood.filter(mess => {
      // Find all ratings for this mess
      const messRatings = this.myNewMessDetailsInformationObj.rating
        .filter(rating => rating.messUserId === mess.userId)
        .map(rating => rating.rating);
      console.log(messRatings)

      if (messRatings.length === 0) return false; // No ratings available

      const averageRating = messRatings.reduce((sum, rating) => sum + rating, 0) / messRatings.length;
      return averageRating >= this.myFliterRating;

    });

    console.log(this.filteredMessDetails)
    this.updatePaginatedData();
  }

    getRelatedDetails(userId: any): any {
      return this.myNewMessDetailsInformationObj.timeDetails.find(detail => detail.userId === userId) || null;
    }

  // Add this method to your CustomerComponent class
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
  getRatingDetails(messUserId: any) {
    if (!this.myNewMessDetailsInformationObj?.rating) return 0;

    const ratings = this.myNewMessDetailsInformationObj.rating
      .filter((rating: any) => rating?.messUserId === messUserId)
      .map((rating: any) => Number(rating?.rating) || 0);

    if (!ratings.length) return 0;

    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
    return totalRating / ratings.length;
  }

  // Update the return type to be an object with specific properties
  getStarDisplay(rating: number): { full: number[], half: boolean, empty: number[] } {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return {
      full: Array(fullStars).fill(0),
      half: halfStar,
      empty: Array(emptyStars).fill(0)
    };
  }


  toggleStatus(): void {
    this.isOpen = !this.isOpen;
  }

  navigateToShowMessInfo(id: any) {
    console.log(id);
    this.router.navigate(['/messmaindetails/', id], { relativeTo: this.activeRoute });
    this.customerServ.postViewInCustomerList(id).subscribe({
      next: (_resp: any) => {
        console.log(_resp);
        // this.tostrServ.success('Mess Information Viewed Successfully');
      },
      error: (_error: any) => {
        console.log(_error);
        //  this.tostrServ.error('Error in viewing mess information');
      }
    })
  }





  // pagination method part 
  // Add this method to handle page changes
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
    window.scrollTo(0, 0);
  }

  // Add this method to update paginated data
  updatePaginatedData(): void {
    if (!this.filteredMessDetails) {
      this.paginatedMessDetails = [];
      return;
    }

    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedMessDetails = this.filteredMessDetails.slice(startIndex, endIndex);
  }

  filterMessList(): void {
    this.pageIndex = 0; // Always reset to first page when filtering

    const messDetails = this.myNewMessDetailsInformationObj?.messDetails || [];

    if (!this.searchTerm?.trim()) {
      this.filteredMessDetails = [...messDetails];
      this.isNotSerachMess = false;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.filteredMessDetails = messDetails.filter((mess: any) =>
        mess?.messName?.toLowerCase().includes(searchTermLower) ||
        mess?.address?.city?.toLowerCase().includes(searchTermLower) ||
        mess?.address?.area?.toLowerCase().includes(searchTermLower)
      );

      this.isNotSerachMess = this.filteredMessDetails.length === 0;
    }

    this.totalMessCount = this.filteredMessDetails.length;
    this.updatePaginatedData();

    if (this.paginator) {
      this.paginator.firstPage();
    }

  }


  //onLoction 

  onLocationChange(location: string): void {
    this.pageIndex = 0; // Reset pagination

    const messDetails = this.myNewMessDetailsInformationObj?.messDetails || [];

    if (!location?.trim()) {
      this.filteredMessDetails = [...messDetails];
      this.isNotSerachMess = false;
    } else {
      const locationLower = location.toLowerCase().trim();

      this.filteredMessDetails = messDetails.filter((mess: any) =>
        mess?.address?.city?.toLowerCase().includes(locationLower) ||
        mess?.address?.area?.toLowerCase().includes(locationLower)
      );

      this.isNotSerachMess = this.filteredMessDetails.length === 0;
    }

    this.totalMessCount = this.filteredMessDetails.length;
    this.updatePaginatedData();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  onCitySelected(event: MatAutocompleteSelectedEvent): void {
    const selectedCity = event.option.value;
    this.cityControl.setValue(selectedCity);
    this.onLocationChange(selectedCity);
  }

  // Open / Closed / Closing Soon or apply to the style in code 
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


  // menulist show to dialog box
  onMenuShowList(userId: any) {
    this.dialog.open(MenuListComponent, {
      width: '100%', // Adjusted width for better responsiveness
      maxWidth: 'auto',
      data: { messOwnerUserId: userId }
    });
  }

  //log out button
  onLoginPage() {
    this.router.navigate(['login']);
  }
  onRegisterPage() {
    this.router.navigate(['signup']);
  }

  //pagination method;

  getCityName(myNewMessDetailsInformationObj: any) {
    myNewMessDetailsInformationObj.messDetails.forEach((mess: any) => {
      const city = mess.address.city.trim();
      const myCityName = city.toLowerCase();
      // Check if city doesn't already exist in the array (case insensitive)
      if (!this.locations.find(loc => loc.toLowerCase() === myCityName)) {
        this.locations.push(mess.address.city);
      }
    });
  }





}

