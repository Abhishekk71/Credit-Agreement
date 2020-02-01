import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from './../../../services/local-storage.service';
import { Web3Service } from './../../../services/web3.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  loanApplications = [];

  constructor(private localStorageService : LocalStorageService, private web3Service: Web3Service) { }

  ngOnInit() {
    this.refresh();
  }

  async refresh() {
    let loanApplications = await this.localStorageService.getLoanApplications();
    for(let loanApplication of loanApplications) {
      let borrowerAccount = this.web3Service.getAccountOf(loanApplication.borrower);
      loanApplication['borrower'] = borrowerAccount;
      this.loanApplications.push(loanApplication);
    }
  }

  approveLoanApplication(application) {
    application["status"] = "APPROVED";
    //ADD!! application["lenderDetails"] = [];
    application["lenderDetails"] = [];
    this.localStorageService.updateLoanApplication(application);
    this.refresh();
  }

  rejectLoanApplication(application) {
    application["status"] = "REJECTED";
    this.localStorageService.updateLoanApplication(application);
    this.refresh();
  }

}
