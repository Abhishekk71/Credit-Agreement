import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { LocalStorageService } from './../../../../services/local-storage.service';
import { Web3Service } from './../../../../services/web3.service';
import { ContractService } from './../../../../services/contract.service';

declare let require: any;
const usd_coin_artifacts = require('./../../../../../../build/contracts/USDCoin.json');

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
  buttonName="";

  flag=false;

  constructor(private router: Router, 
    private localStorageService : LocalStorageService, 
    private web3Service: Web3Service,
    private contractService: ContractService,
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
      this.sender=this.accounts[0];
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


  async submit() {
    //first check if the new total lend amount will larger than the total loan amount
    if(this.calculateAmount()>this.application.totalLoanAmount){
      alert("the amout is larger than the total amount of this application.");
      return;
    }

    //create lend detail record
    let lendDetail = {
      ID: Date.now(),
      lender:await this.web3Service.getAccountOf(this.userAddress),
      amount: this.lendAmount,
      detailStatus:"",
    }
    
    this.application["lenderDetails"].push(lendDetail);
    this.application["coveredAmount"]+=this.lendAmount;
    this.localStorageService.updateLoanApplication(this.application);

    //then check if the new total lend amount equals to the total loan amount
    if(this.calculateAmount() == this.application.totalLoanAmount){
      this.application["status"] = "Pending";
    }

    alert("submit successfully");
  }

  calculateAmount(){
    let sum=0;
    if(this.application.lenderDetails){
      for(let lendDetail of this.application.lenderDetails){
        sum = sum + lendDetail.amount;
      }
    }
    return sum;
  }

  async lendAllLoanApplication(application) {
    //first check the status
    if (application["status"] == "LendCompleted"){
      alert("This application get enough lend. You cannot lend more.")
      return;
    }

    //if the application has lend detail record, click this button only can lend the rest amount
    let currentAmount=this.calculateAmount();
    let lendDetail = {
      ID: Date.now(),
      lender:await this.web3Service.getAccountOf(this.userAddress),
      amount: application.totalLoanAmount - currentAmount,
      detailStatus:"",
    }
    application["status"] = "Pending";
    application["coveredAmount"]=application.totalLoanAmount;
    application["lenderDetails"].push(lendDetail);
    this.localStorageService.updateLoanApplication(application);
    alert("Lend successfully. This application got enough money.");
  }

  canSign() {
    let details = this.application["lenderDetails"];
    for(let detail of details){
      if(detail.lender["address"]==this.userAddress){
        return true;
      }
    }
    return  false;
  }

  async sign() {
    var deployedAgreementContract;
    await this.contractService.getDeployedContract('CreditAgreement', this.application.aggreementAddress)
      .then(async (deployedContract) => {
        deployedAgreementContract = deployedContract;
        console.log("deployedAgreementContract is:");
        console.log(deployedAgreementContract);
        console.log("test sign from: ", this.userAddress);
        await deployedAgreementContract.signAsALender({ from: this.userAddress }).then(data => console.log(data));
        console.log("check sign! ", await deployedAgreementContract.check({ from: this.userAddress }));
        console.log("check everyontsigned: ", await deployedAgreementContract.hasEveryoneSigned({ from: this.userAddress }));
        for (let detail of this.application.lenderDetails) {
          if (detail.lender["address"] == this.userAddress) {
            detail.detailStatus = "SIGNED";
          }
        }
        if (await deployedAgreementContract.hasEveryoneSigned({ from: this.userAddress })) {
          this.application.status = "SIGNED";
          this.application["facilityAddresses"] = [];
          this.localStorageService.updateLoanApplication(this.application);
          for (let detail of this.application.lenderDetails) {
            const deployedFacilityContract = await this.contractService.deployFacilityContract
            (detail.amount, 0, this.application.id, this.application.id, this.accounts[0]["address"]);
            console.log("deployedFacilityContract is: ");
            console.log(deployedFacilityContract);
            this.application.facilityAddresses.push(deployedFacilityContract["address"]);
          }
          
        }
      })
    this.localStorageService.updateLoanApplication(this.application);
    alert("Signed successfully!");
  }

  async signAsBorrower() {
    const _borrower = this.application.borrower["address"];
    var deployedAgreementContract;
    await this.contractService.getDeployedContract('CreditAgreement', this.application.aggreementAddress)
      .then(async (deployedContract) => {
        deployedAgreementContract = deployedContract;
        console.log("deployedAgreementContract is:");
        console.log(deployedAgreementContract);
        console.log("test sign from: ", this.userAddress);
        await deployedAgreementContract.signAsABorrower({ from: _borrower }).then(data => console.log(data));
        //console.log("check sign! ", await deployedAgreementContract.check({ from: this.userAddress }));
        console.log("check everyont sign: ",await deployedAgreementContract.hasEveryoneSigned({ from: this.userAddress }));
      })
    
    alert("Signed successfully!");
  }

  async deploy() {
    console.log("enter deploy");

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
      }
    }
    
    const deployedAgreementContract = await this.contractService.deployAgreementContract
      (this.application, this.lenders, this.lenderShares, this.accounts[0]["address"]);
    this.application["aggreementAddress"] = deployedAgreementContract["address"];
    this.localStorageService.updateLoanApplication(this.application);
  }
}
