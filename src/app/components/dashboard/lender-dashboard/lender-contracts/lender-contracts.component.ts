import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { Web3Service } from '../../../../services/web3.service';


declare let require: any;
const usd_coin_artifacts = require('./../../../../../../build/contracts/USDCoin.json');

@Component({
  selector: 'app-lender-contracts',
  templateUrl: './lender-contracts.component.html',
  styleUrls: ['./lender-contracts.component.css']
})
export class LenderContractsComponent implements OnInit {
  applications=[];
  userAddress = "";
  lendAmount=0;
  
  account = {};
  accountBalance = 0;

  USDCoin: any;
  accounts = [];
  id=0;
 
  constructor(private router: Router, 
    private localStorageService : LocalStorageService, 
    private web3Service: Web3Service,
    public activeRoute:ActivatedRoute) { }

  async ngOnInit() {

    

    
    
    //get user
    let userAddress = this.localStorageService.getUser();
    if (userAddress == null) {
      alert("Invalid user session, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.userAddress = userAddress;

    // get user account
    this.account = await this.web3Service.getAccountOf(userAddress);
    if (this.account == null) {
      alert("Error in fetching user account, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.web3Service.getAccounts().then((accs) => {
      this.accounts = accs;
    });

    //get applications
    let loanApplications = this.localStorageService.getLoanApplications();
    for (let application of loanApplications) {
      for (let detail of application.lenderDetails) {
        if (detail.lender.address == this.userAddress) {
          console.log("in the loop");
          console.log(application);
          this.applications.push(application);
        }
      }
    }

    console.log("applications are");
    console.log(this.applications);
  }

  


}


