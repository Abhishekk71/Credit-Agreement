import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { Web3Service } from '../../../../services/web3.service';
import { ContractService } from './../../../../services/contract.service';


declare let require: any;
const usd_coin_artifacts = require('./../../../../../../build/contracts/USDCoin.json');

@Component({
  selector: 'app-lender-contracts',
  templateUrl: './lender-contracts.component.html',
  styleUrls: ['./lender-contracts.component.css']
})
export class LenderContractsComponent implements OnInit {
  applications = [];
  userAddress = "";
  lendAmount = 0;

  account = {};
  accountBalance = 0;

  USDCoin: any;
  accounts = [];
  id = 0;

  constructor(private router: Router,
    private localStorageService: LocalStorageService,
    private web3Service: Web3Service,
    private contractService: ContractService,
    public activeRoute: ActivatedRoute) { }

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
    var deployedContract;
    var deployedFacility;
    for (let application of loanApplications) {
      for (let detail of application.lenderDetails) {
        if (detail.lender.address == this.userAddress) {
          await this.contractService.getDeployedContract('CreditAgreement', application.aggreementAddress)
            .then(async (_deployedContract) => {
              deployedContract = _deployedContract;
              var facilityAddress = await deployedContract.getFacility(this.userAddress, { from: this.userAddress });
              console.log(" facilityAddress is: ", facilityAddress);
              await this.contractService.getDeployedContract('Facility', facilityAddress)
                .then(async (_deployedFacility) => {
                  deployedFacility = _deployedFacility;
                  console.log("deployedFacility is: ");
                  console.log(deployedFacility);
                  const value = await deployedFacility.getInfo({ from: this.userAddress });
                  application['maturityDate'] = this.timestampToTime(value[2]);
                  application['expiryDate'] = this.timestampToTime(value[3]);
                });
            });
          this.applications.push(application);
        }
      }
    }
  }

  timestampToTime(timestamp) {
    var date = new Date(1398250549490);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds(); 
    console.log(Y + M + D + h + m + s);
    return (Y + M + D + h + m + s);
  }

  sum(application) {
    let sum = 0;
    for (let detail of application.lenderDetails) {
      if (detail.lender.address == this.userAddress) {
        sum += detail.amount;
      }
    }
    return sum;
  }
}
