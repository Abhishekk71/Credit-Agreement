import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from './../../../services/local-storage.service';
import { Web3Service } from './../../../services/web3.service';
import { SharedService } from './../../../services/shared.service';
import { from } from 'rxjs';

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
  amountToAll = 0;
  accountBalance = 0;
  receiver:"";


  constructor(private localStorageService : LocalStorageService,
     private web3Service: Web3Service,
     private sharedBalance: SharedService ) {    
       this.sharedBalance.balanceData.emit(this.accountBalance); 
     }
  
  async ngOnInit() {
    let userAddress = this.localStorageService.getUser();
    this.account = await this.web3Service.getAccountOf(userAddress);
    console.log("this.account: ");
    console.log(this.account);
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
    await this.web3Service.getAccounts().then((accs) => {
      this.accounts = accs;
      console.log("later this.accounts are:");
      console.log(this.accounts);
    });
    this.sharedBalance.balanceData.emit(this.accountBalance); 
    this.refresh();
  }
  
  async refresh() {
    let loanApplications = this.localStorageService.getLoanApplications();
    for(let loanApplication of loanApplications) {
      let borrowerAccount =await  this.web3Service.getAccountOf(loanApplication.borrower);
      loanApplication['borrower'] = borrowerAccount;
      this.loanApplications.push(loanApplication);
    }
  }
  
  approveLoanApplication(application) {
    application["status"] = "APPROVED";
    application["lenderDetails"] = [];
    application["coveredAmount"] = 0;
    this.localStorageService.updateLoanApplication(application);
    this.refresh();
  }
  
  rejectLoanApplication(application) {
    application["status"] = "REJECTED";
    this.localStorageService.updateLoanApplication(application);
    this.refresh();
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
        const fromAccount = await this.web3Service.getAccountOf(fromAddress);
        const toAccount = await this.web3Service.getAccountOf(toAddress);
        let trans = {
          time: Date.now(),
          from: fromAccount,
          to: toAccount,
          amount:amount,
          txHash: transaction.tx,
        }
        this.localStorageService.addTransactions(trans);
        this.getBalance();
      }
    } catch (e) {
      console.log(e);
      console.log('Error sending coin; see log.');
    }
  }

  async sendCoin() {
    if (!this.USDCoin) {
      alert('USDCoin is not loaded, unable to send transaction');
      return;
    }
    const amount = this.amount;
    const receiver = this.receiver;
    this.sendCoinFromTo(amount, this.account['address'], receiver);
  }

  async sendCoinsToAllLenders(){
    const amount = this.amountToAll;
    let allAccounts = await this.web3Service.getAccounts();
    for (let receiver of allAccounts) {
      if (receiver.type=='LENDER'){
        this.sendCoinFromTo(amount, this.account['address'], receiver.address);
      }

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

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.receiver = e.target.value;
  }
}