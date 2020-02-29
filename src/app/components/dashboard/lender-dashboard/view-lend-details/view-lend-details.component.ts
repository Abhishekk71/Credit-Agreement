import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { LocalStorageService } from './../../../../services/local-storage.service';
import { Web3Service } from './../../../../services/web3.service';

declare let require: any;
const usd_coin_artifacts = require('./../../../../../../build/contracts/USDCoin.json');
const credit_agreement_artifacts = require('./../../../../../../build/contracts/CreditAgreement.json');

@Component({
  selector: 'app-view-lend-details',
  templateUrl: './view-lend-details.component.html',
  styleUrls: ['./view-lend-details.component.css']
})
export class ViewLendDetailsComponent implements OnInit {

  application:any;
  userAddress = "";
  lendAmount=0;
  
  account = {};
  accountBalance = 0;

  USDCoin: any;
  CreditAgreement: any;
  accounts = [];
  id=0;
  lenders=[];
  lenderShares=[];
  sender ="";

  flag=false;

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

    //get lenders
    for(let detail of this.application.lenderDetails){
      console.log("detail.lender.address is: ");
      console.log(detail.lender.address);
      console.log(this.lenders.indexOf(detail.lender.address));
      if(this.lenders.indexOf(detail.lender.address!=-1)){
        console.log("enter push");
        this.lenders.push(detail.lender.address);
        this.lenderShares.push(0);
      }
      else{
        
        continue;
        //this.lenders.join(detail.lender.address);
      }
    }
    console.log("lender are: ");
    console.log(this.lenders);
    console.log("lenderShare are: ");
    console.log(this.lenderShares);
    
    //get user
    let userAddress = this.localStorageService.getUser();
    if (userAddress == null) {
      alert("Invalid user session, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.userAddress = userAddress;

    // get user account
    this.account =await this.web3Service.getAccountOf(userAddress);
    if (this.account == null) {
      alert("Error in fetching user account, please login again..");
      this.router.navigateByUrl('/login');
      return;
    }
    this.web3Service.artifactsToContract(usd_coin_artifacts)
      .then((USDCoinAbstraction) => {
        this.USDCoin = USDCoinAbstraction;
        this.USDCoin.deployed().then(deployed => {
          console.log("deployed USDCoin");
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
            this.getBalance();
          });
        });
      });
    await this.web3Service.getAccounts().then((accs) => {
      this.accounts = accs;
      console.log("this.accounts is: ");
      console.log(this.accounts);
      this.sender=this.accounts[0];
    });

    console.log("this.accounts[0] is: ");
    console.log(this.sender["address"]);
    

    this.web3Service.artifactsToContract(credit_agreement_artifacts)
      .then((CreditAgreementAbstraction) => {
        this.CreditAgreement = CreditAgreementAbstraction;
        console.log("before deployed");
        this.CreditAgreement.new(this.sender["address"],this.lenders,this.lenderShares,this.application.totalLoanAmount,1581035048, {from: this.accounts[0]["address"]}).then(deployed => {
          console.log("deployed CreditAgreement");
          console.log(deployed);
          this.test();
          // deployed.Transfer({}, (err, ev) => {
          //   console.log('try test');
          //   this.test();
          // });
        });
      });

    console.log("now check");
    console.log("before flag is: ", this.flag);
    this.canSign();
    console.log("flag is: ",this.flag);
  }

  logout() {
    this.localStorageService.setUser("");
    this.router.navigateByUrl("/login");
  }

  async test(){
    console.log("enter test");
    try {
      const deployedCreditAgreement = await this.CreditAgreement.new(this.sender["address"],this.lenders,this.lenderShares,this.application.totalLoanAmount,1581035048, {from: this.accounts[0]["address"]});
      console.log("deployedCreditAgreement is:");
      console.log(deployedCreditAgreement);
      const result = await deployedCreditAgreement.signAsALender.call();
      console.log("first result is: ");
      console.log(result);
      const check = await deployedCreditAgreement.hasEveryoneSigned;
      console.log("second result is: ");
      console.log(check);
    } catch (e) {
      console.log(e);
      console.log('Error getting balance; see log.');
    }
  }

  async getBalance() {
    console.log('Refreshing balance');

    try {
      const deployedUSDCoin = await this.USDCoin.deployed();
      console.log("deployedUSDCoin is: ");
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

  back(){
    this.router.navigateByUrl("dashboard");
  }

  canSign(){
    let details = this.application.lenderDetails;
    // console.log("this.account is:");
    // console.log(this.account);
    for (let detail of details){
      // console.log("detail.lender is:");
      // console.log(detail.lender);
      if (detail.lender=this.account){
        // console.log("the same");
        this.flag=true;
        return;
      }
    }
  }

  async sign(){
    try {
      console.log("enter sign");
      const deployedUSDCoin = await this.USDCoin.deployed();
      
      await deployedUSDCoin.signAsALender;
      const check = await deployedUSDCoin.hasEveryoneSigned;
      console.log("result is: ");
      console.log(check);
      
    } catch (e) {
      console.log(e);
      console.log('Error getting balance; see log.');
    }


    // let details = this.application.lenderDetails;
    // // for(let detail of details){
    // //   if(detail.lender=this.account )
    // // }
    // for (let detail of details){
    //   if(detail.lender=this.account && detail.detailStatus!="signed"){
    //     detail.detailStatus= "signed";
    //   }
    // }
    alert("all of your lender details are signed successfully!");
    // this.localStorageService.updateLoanApplication(this.application);
  }

}
