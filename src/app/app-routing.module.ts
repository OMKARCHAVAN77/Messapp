import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OwnerdetailsComponent } from './component/ownerdetails/ownerdetails.component';
import { DashbordComponent } from './component/dashbord/dashbord.component';
import { SidenavComponent } from './component/sidenav/sidenav.component';
import { LayoutComponent } from './component/layout/layout.component';
import { ProfileComponent } from './component/profile/profile.component';
import { DetailsComponent } from './component/details/details.component';
import { MenuComponent } from './component/menu/menu.component';
import { PriceComponent } from './component/price/price.component';
import { TimeComponent } from './component/time/time.component';
import { LogInComponent } from './component/log-in/log-in.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { MainCustomerComponent } from './component/main-customer/main-customer.component';
import { CustomerComponent } from './component/customer/customer.component';
import { MessInfoComponent } from './component/customer/mess-info/mess-info.component';
import { MessMainDetailsComponent } from './component/mess-main-details/mess-main-details.component';


const routes: Routes = [
  {path:'',redirectTo:'mainCustomer',pathMatch:'full'},
  { path: 'ownerdetails', component: OwnerdetailsComponent },
  { path: 'messinfo/:id', component: MessInfoComponent },
    { path: 'messmaindetails/:id', component: MessMainDetailsComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'login', component: LogInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'mainCustomer', component: MainCustomerComponent },
  {
    path: 'layout',
    component: LayoutComponent,
    children: [
      { path: 'sidenav', component: SidenavComponent },
      { path: 'dashbord', component: DashbordComponent },
      { path: 'feedback', component: ProfileComponent },
      { path: 'details', component: DetailsComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'price', component: PriceComponent },
      { path: 'time', component: TimeComponent },
      { path: 'logout', component: DashbordComponent },
    ],
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
