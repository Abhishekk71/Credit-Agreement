import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './../../../../services/local-storage.service';
// import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-repayment-dashboard',
  templateUrl: './repayment-dashboard.component.html',
  styleUrls: ['./repayment-dashboard.component.css']
})
export class RepaymentDashboardComponent implements OnInit {

  userAddress = "";
  loanApplications = [];
  contranctToPay = [];
  Digest_show_hide_val=true;

  testList: [
    1,2,3,4,5
  ]

  constructor(private router: Router,
    private localStorageService: LocalStorageService) { }
  // private localStorageService: LocalStorageService,
  // private web3Service: Web3Service

  ngOnInit() {
    console.log("inside repayment dashboard");
    this.getUserAddress();
    this.getApplications();
  }

  getUserAddress(){
    let userAddress = this.localStorageService.getUser();
    if (userAddress == null) {
      alert("Invalid user session, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.userAddress = userAddress;
  }

  getApplications() {
    if(this.localStorageService.getLoanApplications()){
      let loanApplications = this.localStorageService.getLoanApplications();
      for (let application of loanApplications){
        if (application.borrower.address == this.userAddress){
          console.log(application.name);          
          this.loanApplications.push(application)
        }
      }
    }
    else{
      alert("cannot find local storage file");
      this.router.navigateByUrl('/login');
      return;
    }
  }

  Digest_show=function(){
      this.Digest_show_hide_val=!this.Digest_show_hide_val;
  }

  back(){
    this.router.navigateByUrl("borrower");
  }

}
