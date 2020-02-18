import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';

declare let require: any;
const usd_coin_artifacts = require('./../../../../build/contracts/USDCoin.json');

@Component({
  selector: 'app-usd-coin',
  templateUrl: './usd-coin.component.html',
  styleUrls: ['./usd-coin.component.css']
})
export class USDCoinComponent implements OnInit {

  account = {};
  accountBalance = 0;

  accounts: string[];
  USDCoin: any;

  amount = 0;
  receiver: "";

  constructor(private router: Router, private web3Service: Web3Service, private localStorageService: LocalStorageService) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit() {
    let userAddress = this.localStorageService.getUser();
    if (userAddress == null) {
      // alert("Invalid user session, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    // get user account
    this.account = this.web3Service.getAccountOf(userAddress);
    if (this.account == null) {
      // alert("Error in fetching user account, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }

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
  }

  logout() {
    this.localStorageService.setUser("");
    this.router.navigateByUrl("/login");
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
