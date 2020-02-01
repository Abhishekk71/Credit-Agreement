import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from './../../../services/local-storage.service';
import { Web3Service } from './../../../services/web3.service';

declare let require: any;
const usd_coin_artifacts = require('./../../../../../build/contracts/USDCoin.json');

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
  loanApplications = [];
  account = {};
  accounts : string[];
  USDCoin: any;
  amount = 0;
  accountBalance = 0;
  receiver:"";


  constructor(private localStorageService : LocalStorageService, private web3Service: Web3Service) { }
  
  ngOnInit() {
    let userAddress = this.localStorageService.getUser();
    this.account = this.web3Service.getAccountOf(userAddress);
    this.web3Service.artifactsToContract(usd_coin_artifacts)
      .then((USDCoinAbstraction) => {
        this.USDCoin = USDCoinAbstraction;
        this.USDCoin.deployed().then(deployed => {
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
            this.getBalance();
          });
        });
      });
    this.web3Service.getAccounts().then((accs) => {
      this.accounts = accs;
    });
    this.refresh();
  }
  
  refresh() {
    let loanApplications = this.localStorageService.getLoanApplications();
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

  async sendCoin() {
    if (!this.USDCoin) {
      alert('USDCoin is not loaded, unable to send transaction');
      return;
    }

    const amount = this.amount;
    const receiver = this.receiver;

    console.log('Sending coins' + amount + ' to ' + receiver);

    console.log('Initiating transaction... (please wait)');
    try {
      const deployedUSDCoin = await this.USDCoin.deployed();
      const transaction = await deployedUSDCoin.transfer.sendTransaction(receiver, amount, { from: this.account['address'] });

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

  async sendCoinsToAllLenders(){
    
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
    } catch (e) {
      console.log(e);
      console.log('Error getting balance; see log.');
    }
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.receiver = e.target.value;
  }
}