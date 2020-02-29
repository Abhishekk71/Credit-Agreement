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

  constructor(
    private router: Router, 
    private localStorageService : LocalStorageService, 
    private web3Service: Web3Service,
    ) { }

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

  canSign(application) {
    if (application.status != "Pending") {
      return false;
    }
    let details = application["lenderDetails"];
    for(let detail of details){
      if(detail.lender["address"]==this.userAddress){
        return true;
      }
    }
    return  false;
  }
  

}
