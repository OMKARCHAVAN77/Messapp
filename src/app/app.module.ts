import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentComponent } from './component/component.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { OwnerdetailsComponent } from './component/ownerdetails/ownerdetails.component';
import { DashbordComponent } from './component/dashbord/dashbord.component';
import { SidenavComponent } from './component/sidenav/sidenav.component';
import { LayoutComponent } from './component/layout/layout.component';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RatingModule } from 'primeng/rating';
import { ProfileComponent } from './component/profile/profile.component';
import { TimeComponent } from './component/time/time.component';
import { PriceComponent } from './component/price/price.component';
import { MenuComponent } from './component/menu/menu.component';
import { DetailsComponent } from './component/details/details.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { LogInComponent } from './component/log-in/log-in.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MainCustomerComponent } from './component/main-customer/main-customer.component';
import { FilterPageComponent } from './component/filter-page/filter-page.component';
import { MenuListComponent } from './component/menu-list/menu-list.component';
import { ToastrModule } from 'ngx-toastr';
import { CustomerComponent } from './component/customer/customer.component';
import { FeedBackPageComponent } from './component/customer/feed-back-page/feed-back-page.component';
import { MessInfoComponent } from './component/customer/mess-info/mess-info.component';
import { NgxUiLoaderConfig, NgxUiLoaderModule } from 'ngx-ui-loader';
import { AutoLoaderButtonDirective } from './auto-loader-button.directive';
import { MessMainDetailsComponent } from './component/mess-main-details/mess-main-details.component';

import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { LoaderInterceptor } from './interceptors/loader.interceptor';


const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsType: 'three-strings',
  fgsColor: 'rgba(82, 255, 249, 0.6)',
  fgsSize: 60,
  overlayColor: 'rgba(255, 255, 255, 0.6)',
  pbColor: 'rgba(82, 255, 249, 0.6)',
  pbDirection: 'ltr',
  pbThickness: 3,
  hasProgressBar: true,
  blur: 100
};


@NgModule({
  declarations: [
    AppComponent,
    ComponentComponent,
    OwnerdetailsComponent,
    DashbordComponent,
    SidenavComponent,
    LayoutComponent,
    ProfileComponent,
    TimeComponent,
    PriceComponent,
    MenuComponent,
    DetailsComponent,
    LogInComponent,
    SignUpComponent,
    MainCustomerComponent,
    FilterPageComponent,
    MenuListComponent,
    CustomerComponent,
    FeedBackPageComponent,
    MessInfoComponent,
    AutoLoaderButtonDirective,
    MessMainDetailsComponent,


  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatRippleModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTooltipModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    FormsModule, 
    ReactiveFormsModule,
    MatTabsModule,
    MatCheckboxModule,    
    MatExpansionModule,  
    MatFormFieldModule,   
    MatInputModule,       
    MatButtonModule ,
    CommonModule,
    ChartModule,
    CardModule,
    ButtonModule,
    ToggleButtonModule,
    RatingModule,
    CdkStepperModule,
    HttpClientModule,
    DialogModule,
    InputTextModule,
    ToastrModule.forRoot(),
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
  ],
  providers: [
      {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
