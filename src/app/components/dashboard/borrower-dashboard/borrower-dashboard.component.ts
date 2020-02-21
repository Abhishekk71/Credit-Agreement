import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './../../../services/local-storage.service';

@Component({
  selector: 'app-borrower-dashboard',
  templateUrl: './borrower-dashboard.component.html',
  styleUrls: ['./borrower-dashboard.component.css']
})
export class BorrowerDashboardComponent implements OnInit {

  userAddress = "";

  name = "";
  totalLoanAmount = 0;
  type = "REVOLVER";
  term = 0;
  rateOfInterest = 0;
  loanApplications=[];

  constructor(private router: Router,
    private localStorageService: LocalStorageService, ) { }

  async ngOnInit() {
    let userAddress = await this.localStorageService.getUser();
    if (userAddress == null) {
      alert("Invalid user session, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.userAddress = userAddress;

    let loanApplications = this.localStorageService.getLoanApplications();
    for(let application of loanApplications){
      if( application.borrower.address == this.userAddress){
        this.loanApplications.push(application);
      }
    }
  }

  async submit() {
    let loanApplication = {
      id: Date.now(),
      name: this.name,
      borrower: await this.userAddress,
      totalLoanAmount: this.totalLoanAmount,
      type: this.type,
      term: this.term,
      rateOfInterest: this.rateOfInterest
    }

    this.localStorageService.addLoanApplication(loanApplication);

    alert("Your application was successfully submitted");

    this.name = "";
    this.totalLoanAmount = 0;
    this.type = "REVOLVER";
    this.term = 0;
    this.rateOfInterest = 0;
  }

  // repayment(){
  //   this.router.navigateByUrl("repayment-dashboard");
  // }

}
