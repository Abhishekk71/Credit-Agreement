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
  loanApplications = [];
  startingDate = 0;
  maturityDate = 0;
  expirationDate = 0;
  scheduleType = "";


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
      rateOfInterest: this.rateOfInterest,
      startingDate: this.startingDate,
      endingDate: 0,
      maturityDate: this.maturityDate,
      expirationDate: this.expirationDate,
      scheduleType:this.scheduleType,
    }
   
    console.log("out maturmaturityDate: ", this.maturityDate);
    loanApplication.startingDate = this.getTime("",this.startingDate);
    loanApplication.endingDate = this.setTime(this.startingDate);
    if (this.type == "TERM_LOAN") {
      loanApplication.maturityDate = this.getTime("",this.maturityDate);
      loanApplication.expirationDate = this.getTime("",this.expirationDate);
    }
    this.localStorageService.addLoanApplication(loanApplication);

    alert("Your application was successfully submitted");

    this.name = "";
    this.totalLoanAmount = 0;
    this.type = "REVOLVER";
    this.term = 0;
    this.rateOfInterest = 0;
  }

  view(){
    let loanApplications = this.localStorageService.getLoanApplications();
    for(let loanApplication of loanApplications)
    {
      this.viewApplications.push(loanApplication);  
      console.log(this.viewApplications);
    }
  }
  removeFromView(){
    
  }
    this.startingDate = 0;
    this.maturityDate = 0;
    this.expirationDate = 0;
    this.scheduleType = "";
  }

  getTime(_,year) {
    var str = year + _ + " 00:00:00";
    console.log("in getTime: ", str);
    var date = new Date(str);
    return date.getTime();
  }

  setTime(_) {
    var str = _ + " 00:00:00";
    var date = new Date(str);
    date.setDate(date.getFullYear() + this.term);
    return date.getTime();
  }
  

  // repayment(){
  //   this.router.navigateByUrl("repayment-dashboard");
  // }

}
