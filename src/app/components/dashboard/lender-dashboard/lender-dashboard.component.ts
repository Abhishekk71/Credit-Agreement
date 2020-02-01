import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './../../../services/local-storage.service';
import { Web3Service } from './../../../services/web3.service';


@Component({
  selector: 'app-lender-dashboard',
  templateUrl: './lender-dashboard.component.html',
  styleUrls: ['./lender-dashboard.component.css']
})
export class LenderDashboardComponent implements OnInit {

  userAddress = "";

  constructor(private router: Router, 
    private localStorageService : LocalStorageService, 
    private web3Service: Web3Service) { }

  loanApplications = [];
  lenderlist=[];

  ngOnInit() {
    this.refresh();
    
    // get user
    let userAddress = this.localStorageService.getUser();
    if (userAddress == null) {
      alert("Invalid user session, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.userAddress = userAddress;
  }

  refresh() {
    if(this.localStorageService.getLoanApplications()){
      let loanApplications = this.localStorageService.getLoanApplications();
      this.loanApplications=loanApplications;
    }
    else{
      alert("cannot find local storage file");
      this.router.navigateByUrl('/login');
      return;
    }
    
  }

  async lendAllLoanApplication(application) {
    //first check the status
    if (application["status"] == "LendCompleted"){
      alert("This application get enough lend. You cannot lend more.")
      return;
    }

    //if the application has lend detail record, click this button only can lend the rest amount
    let currentAmount=this.calculateAmount(application);
    let lendDetail = {
      ID: Date.now(),
      lender:await this.web3Service.getAccountOf(this.userAddress),
      amount: application.totalLoanAmount - currentAmount,
    }
    application["status"] = "LendCompleted";
    application["lenderDetails"].push(lendDetail);
    this.localStorageService.updateLoanApplication(application);
    alert("Lend successfully. This application got enough money.");

    this.refresh();
  }

  lendPartLoanApplication(application) {
    //first check the status
    if (application["status"] == "LendCompleted"){
      alert("This application get enough lend. You cannot lend more.")
      return;
    }

    this.localStorageService.setUser(this.userAddress);
    this.localStorageService.setApplication(application);
  }

  //calculate the exsiting lend detail records
  calculateAmount(application){
    let sum=0;
    if(application.lenderDetails){
      for(let lendDetail of application.lenderDetails){
        sum = sum + lendDetail.amount;
      }
    }
    return sum;
  }

  view(application){
    this.localStorageService.setUser(this.userAddress);
    this.localStorageService.setApplication(application);
  }

}
