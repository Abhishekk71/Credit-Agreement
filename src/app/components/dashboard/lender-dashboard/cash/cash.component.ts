import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { Web3Service } from '../../../../services/web3.service';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.css']
})
export class CashComponent implements OnInit {
  userAddress = "";
  account = {};
  accounts = [];
  incomes = [];

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
    await this.web3Service.getAccounts().then((accs) => {
      this.accounts = accs;
      console.log("admin account is: ", this.accounts[0]);
    });

    this.getIncome();
    console.log("this.incomes is:");
    console.log(this.incomes);

  }

  async getIncome() {
    let transactions = this.localStorageService.getTransactions();
    for (let transaction of transactions) {
      console.log("in getincome, transaction is: ");
      console.log(transaction);
      if (transaction.from.address == this.accounts[0].address) {
        if (transaction.to.address == this.userAddress) {
          this.incomes.push(transaction);
        }
      }
    }
  }
}

