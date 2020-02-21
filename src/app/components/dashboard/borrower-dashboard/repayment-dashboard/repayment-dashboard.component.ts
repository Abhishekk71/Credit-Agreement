import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './../../../../services/local-storage.service';
import { Web3Service } from './../../../../services/web3.service';
import { SharedService } from './../../../../services/shared.service';

const usd_coin_artifacts = require('./../../../../../../build/contracts/USDCoin.json');

@Component({
  selector: 'app-repayment-dashboard',
  templateUrl: './repayment-dashboard.component.html',
  styleUrls: ['./repayment-dashboard.component.css']
})
export class RepaymentDashboardComponent implements OnInit {

  account = {};
  userAddress = "";
  USDCoin: any;
  accountBalance = 0;
  loanApplications = [];
  contranctToPay = [];
  Digest_show_hide_val=true;

  testList: [
    1,2,3,4,5
  ]

  constructor(private router: Router,
    private localStorageService: LocalStorageService,
    private web3Service: Web3Service,
    private sharedBalance: SharedService) {
      this.sharedBalance.balanceData.emit(this.accountBalance);
    }

  async ngOnInit() {
    console.log("inside repayment dashboard");
    this.getUserAddress();
    this.account = await this.web3Service.getAccountOf(this.userAddress);
    this.getLoanApplications();
    this.web3Service.artifactsToContract(usd_coin_artifacts)
      .then((USDCoinAbstraction) => {
        this.USDCoin = USDCoinAbstraction;
        console.log(this.USDCoin);
        this.USDCoin.deployed().then(deployed => {
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
            this.getBalance();
          });
        });
      });
    this.sharedBalance.balanceData.emit(this.accountBalance);  
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

  getLoanApplications() {
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

  async sendCoinFromTo(amount:any, fromAddress:any, toAddress:any){
    console.log('Sending coins' + amount + ' from ' + fromAddress +' to ' + toAddress);
    try{
      const deployedUSDCoin = await this.USDCoin.deployed();
      const transaction = await deployedUSDCoin.transfer.sendTransaction(toAddress, amount, { from: fromAddress });
      if (!transaction) {
        console.log('Transaction failed!');
      } else {
        console.log('Transaction complete!');
        this.getBalance();
      }
    } catch (e) {
      console.log(e);
      console.log('Error sending coin; see log.');
    }
  }

  async getBalance() {
    console.log('Refreshing balance');
    try {
      const deployedUSDCoin = await this.USDCoin.deployed();
      console.log(deployedUSDCoin);
      console.log('Account', this.account);
      const usdCoinBalance = await deployedUSDCoin.balanceOf.call(this.account['address']);
      console.log('Found balance: ' + usdCoinBalance);
      this.accountBalance = usdCoinBalance;
      this.sharedBalance.balanceData.emit(this.accountBalance); 
    } catch (e) {
      console.log(e);
      console.log('Error getting balance; see log.');
    }
  }

  async repayTo(receiver, amount){
    console.log('Sending coins' + amount + ' from ' + this.userAddress +' to ' + receiver);
    this.sendCoinFromTo(amount, this.userAddress, receiver);
  }

  testTransaction(){
    for (let application of this.loanApplications){
      if (application.borrower.address == this.userAddress){
        let receiverAddress = application.lenderDetails[0].lender.address
        console.log(receiverAddress);
        this.repayTo(receiverAddress, 1);          
        break;
      }
    }
  }

  Digest_show=function(){
      this.Digest_show_hide_val=!this.Digest_show_hide_val;
  }

  back(){
    this.router.navigateByUrl("borrower");
  }

}
