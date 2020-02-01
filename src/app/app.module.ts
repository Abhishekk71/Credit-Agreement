import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';

import { Web3Service } from './services/web3.service';
import { USDCoinComponent } from './components/usd-coin/usd-coin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { BorrowerDashboardComponent } from './components/dashboard/borrower-dashboard/borrower-dashboard.component';
import { LenderDashboardComponent } from './components/dashboard/lender-dashboard/lender-dashboard.component';
import { PartLendComponent } from './components/dashboard/lender-dashboard/part-lend/part-lend.component';
import { ViewLendDetailsComponent } from './components/dashboard/lender-dashboard/view-lend-details/view-lend-details.component';

const routes = [
  { path: "home", component: LoginComponent }, 
  { path: "dashboard", component: DashboardComponent }, 
  { path: "lendpart", component: PartLendComponent},
  { path: "viewlend", component: ViewLendDetailsComponent},
  { path: "usdcoin", component: USDCoinComponent }, 
  { path: '**', component: LoginComponent },
  
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    USDCoinComponent,
    DashboardComponent,
    AdminDashboardComponent,
    BorrowerDashboardComponent,
    LenderDashboardComponent,
    PartLendComponent,
    ViewLendDetailsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [Web3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
