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
  cityControl = new FormControl('');
  locations: string[] = [];
  myNewMessDetailsInformationObj: { messDetails: any[]; timeDetails: any[], rating: any[], menuDetails: any[] } = { messDetails: [], timeDetails: [], rating: [], menuDetails: [] };
  isOpen: boolean = true;
  stars: number[] = [1, 2, 3, 4, 5];
  rating: number | any = 0.0;
  filteredMessDetails: any[] = [];
  searchTerm: string = '';
  clickLocationCity: any[] = [];
  isNotLocationFound: boolean = false;
  isNotSerachMess: boolean = false;
  star: any;
  myMessFoodType: string = 'all';
  myFliterRating: string = 'Any';
  filteredCities: string[] = [];
  totalMessCount: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 6;
  pageIndex = 0;
  paginatedMessDetails: any[] = [];
  searchQuery: any;
  storedData: any;

  constructor(
    public dialog: MatDialog,
    private customerServ: CustomerService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getMessDetailsInCustomer();
    this.paginatedMessDetails = [];
    this.filteredMessDetails = [];
    this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value || ''))
    ).subscribe(filtered => {
      this.filteredCities = filtered;
      this.onLocationChange(this.cityControl.value || '');
    });
  }

  private _filterCities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(location =>
      location.toLowerCase().includes(filterValue)
    );
  }

  // ✅ FIXED — exact database values used for comparison
  applyFilters(): void {
    if (!this.myNewMessDetailsInformationObj?.messDetails) {
      this.filteredMessDetails = [];
      this.updatePaginatedData();
      return;
    }

    let filtered = [...this.myNewMessDetailsInformationObj.messDetails];

    console.log('Before filter:', filtered.length, 'items');
    console.log('foodType filter:', this.myMessFoodType);
    console.log('rating filter:', this.myFliterRating);

    // ✅ Food type filter — exact match with database value
    if (this.myMessFoodType && this.myMessFoodType !== 'all') {
      filtered = filtered.filter(mess => {
        console.log('mess.foodType:', mess.foodType, '=== filter:', this.myMessFoodType);
        return mess.foodType === this.myMessFoodType;
      });
    }

    // ✅ Rating filter
    if (this.myFliterRating && this.myFliterRating !== 'Any') {
      const minRating = parseFloat(this.myFliterRating);
      filtered = filtered.filter(mess => {
        const messRatings = this.myNewMessDetailsInformationObj.rating
          ?.filter((rating: any) => rating.messUserId === mess.userId)
          ?.map((rating: any) => Number(rating.rating)) || [];

        // ✅ Include mess with no ratings when rating filter applied
        if (messRatings.length === 0) return false;

        const averageRating = messRatings.reduce((sum: number, r: number) => sum + r, 0) / messRatings.length;
        console.log('mess:', mess.messName, 'avg rating:', averageRating, '>= minRating:', minRating);
        return averageRating >= minRating;
      });
    }

    console.log('After filter:', filtered.length, 'items');

    this.filteredMessDetails = filtered;
    this.isNotSerachMess = this.filteredMessDetails.length === 0;
    this.totalMessCount = this.filteredMessDetails.length;
    this.pageIndex = 0;
    this.updatePaginatedData();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

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
      hasBackdrop: true,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.myFliterRating = result.rating;
        this.myMessFoodType = result.foodType;
        this.applyFilters();
      } else {
        // ✅ Reset when dialog closed with X button
        this.myFliterRating = 'Any';
        this.myMessFoodType = 'all';
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
          if (this.paginator) {
            this.paginator.firstPage();
          }
          this.getCityName(this.myNewMessDetailsInformationObj);
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

  getRelatedDetails(userId: any): any {
    return this.myNewMessDetailsInformationObj.timeDetails.find(detail => detail.userId === userId) || null;
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

  getRatingDetails(messUserId: any) {
    if (!this.myNewMessDetailsInformationObj?.rating) return 0;
    const ratings = this.myNewMessDetailsInformationObj.rating
      .filter((rating: any) => rating?.messUserId === messUserId)
      .map((rating: any) => Number(rating?.rating) || 0);
    if (!ratings.length) return 0;
    const totalRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0);
    return totalRating / ratings.length;
  }

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
    this.router.navigate(['/messmaindetails/', id], { relativeTo: this.activeRoute });
    this.customerServ.postViewInCustomerList(id).subscribe({
      next: (_resp: any) => { console.log(_resp); },
      error: (_error: any) => { console.log(_error); }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
    window.scrollTo(0, 0);
  }

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
    this.pageIndex = 0;
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

  onLocationChange(location: string): void {
    this.pageIndex = 0;
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
        if (currentTimeInMinutes >= (morningClose - 30)) return 'Closing Soon';
        return 'Open';
      }
      if (currentTimeInMinutes >= (morningOpen - 30) && currentTimeInMinutes < morningOpen) return 'Opening Soon';
    }

    if (timeInfo?.evening?.from && timeInfo?.evening?.to) {
      const [eveningFromHours, eveningFromMinutes] = timeInfo.evening.from.split(':').map(Number);
      const [eveningToHours, eveningToMinutes] = timeInfo.evening.to.split(':').map(Number);
      const eveningOpen = eveningFromHours * 60 + eveningFromMinutes;
      const eveningClose = eveningToHours * 60 + eveningToMinutes;
      if (currentTimeInMinutes >= eveningOpen && currentTimeInMinutes <= eveningClose) {
        if (currentTimeInMinutes >= (eveningClose - 30)) return 'Closing Soon';
        return 'Open';
      }
      if (currentTimeInMinutes >= (eveningOpen - 30) && currentTimeInMinutes < eveningOpen) return 'Opening Soon';
    }

    return 'Closed';
  }

  onMenuShowList(userId: any) {
    this.dialog.open(MenuListComponent, {
      width: '100%',
      maxWidth: 'auto',
      data: { messOwnerUserId: userId }
    });
  }

  onLoginPage() { this.router.navigate(['login']); }
  onRegisterPage() { this.router.navigate(['signup']); }

  getCityName(myNewMessDetailsInformationObj: any) {
    myNewMessDetailsInformationObj.messDetails.forEach((mess: any) => {
      const city = mess.address.city.trim();
      const myCityName = city.toLowerCase();
      if (!this.locations.find(loc => loc.toLowerCase() === myCityName)) {
        this.locations.push(mess.address.city);
      }
    });
  }

  filterMessDetails() {}
  generateStars(averageRating: any): any { return []; }
  getFilterFoodTypeInMyApi() {}
  getFilterRatingInMyApi() {}
}
