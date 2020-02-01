import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { LocalStorageService } from './../../../../services/local-storage.service';
import { Web3Service } from './../../../../services/web3.service';


declare let require: any;
const usd_coin_artifacts = require('./../../../../../../build/contracts/USDCoin.json');

@Component({
  selector: 'app-part-lend',
  templateUrl: './part-lend.component.html',
  styleUrls: ['./part-lend.component.css']
})
export class PartLendComponent implements OnInit {
  application:any;
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

    this.activeRoute.params.subscribe((params: Params) => {
      const id = params['id'];
      this.id=id;
      console.log('id==>', id);
    });

    //get application
    let loanApplications = this.localStorageService.getLoanApplications();
    for(let application of loanApplications){
      if (application.id == this.id){
        this.application = application;
        break;
      }
    }
    
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

  submit() {
    //first check if the new total lend amount will larger than the total loan amount
    if(this.calculateAmount()>this.application.totalLoanAmount){
      alert("the amout is larger than the total amount of this application.");
      return;
    }

    //create lend detail record
    let lendDetail = {
      ID: Date.now(),
      lender:this.web3Service.getAccountOf(this.userAddress),
      amount: this.lendAmount,
    }
    this.application["lenderDetails"].push(lendDetail);
    this.localStorageService.updateLoanApplication(this.application);

    //then check if the new total lend amount equals to the total loan amount
    if(this.calculateAmount() == this.application.totalLoanAmount){
      this.application["status"] = "LendCompleted";
    }

    alert("submit successfully");
  }
  
  //calculate the exsiting lend detail records
  calculateAmount(){
    let sum=0;
    if(this.application.lenderDetails){
      for(let lendDetail of this.application.lenderDetails){
        sum = sum + lendDetail.amount;
      }
    }
    return sum;
  }

  back(){
    this.router.navigateByUrl("dashboard");
  }

}


