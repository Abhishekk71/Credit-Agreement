import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './../../../../services/local-storage.service';
import { Web3Service } from './../../../../services/web3.service';
import { SharedService } from './../../../../services/shared.service';
import {ContractService} from './../../../../services/contract.service';
import { componentFactoryName } from '@angular/compiler';

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
  deployedContracts = [];
  deployedApplications = [];
  applications = [];
  contranctToPay = [];
  repaymentList = [];

  Digest_show_hide_val=true;

  agrAddr: any;
  repayLender: any;
  repayLenderList: any;
  facilityAddress: any;
  repayRate = 0;
  selectedRepayment: any;
  singleRepayAmount:number;
  totalRepayAmount = 0;

  constructor(private router: Router,
    private localStorageService: LocalStorageService,
    private web3Service: Web3Service,
    private sharedBalance: SharedService,
    private contractService: ContractService,) {
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
    this.getRepaymentList();
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

  async getRepaymentList(){
    if(this.localStorageService.getLoanApplications()){
      let loanApplications = this.localStorageService.getLoanApplications();
      for (let application of loanApplications){
        if (application.borrower.address == this.userAddress){
          console.log(application.name);          
          this.loanApplications.push(application);
          let contractName = "CreditAgreement";
          let contractAddress = application.aggreementAddress;
          var deployedContract;
          await this.contractService.getDeployedContract(contractName, contractAddress)
          .then((dContract)=>{
            deployedContract = dContract;
            console.log("deployed agreement contract found");
          });
          let _contractName = application.name;
          let _dueAmount = this.getDueAmount(application.address);
          let _limitation = application.totalLoanAmount;
          let _dueDate = this.getDueDate(application.address);
          let _rate = application.rateOfInterest;
          let _allLenders = application.lenderDetails;
          let _type = application.type;
          let _agreementAddress = application.aggreementAddress;
          let rp = new repayment(_contractName,_dueAmount, _limitation, _dueDate,_rate,_allLenders,_type,_agreementAddress);        
          this.repaymentList.push(rp);
        }
      }
    }
    else{
      alert("cannot find local storage file");
      this.router.navigateByUrl('/login');
      return;
    }
  }

  getDueAmount(address:any){
    return 10;
  }

  getDueDate(address:any){
    var thisDate = new Date();
    return thisDate.getDate();
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

  async getDeployedContracts(contractName:string, contractAddress:any){//contractName:any, contractAddress:any
    console.log(this.loanApplications);
    // let contractAddress = this.loanApplications[0].aggreementAddress;
    var deployedContract;
    console.log("get deployed contract");
    await this.contractService.getDeployedContract(contractName, contractAddress)
    .then((dContract) => {
      deployedContract = dContract;
      console.log("deployed agreement contract found");
      console.log(deployedContract);
    });
    return(deployedContract);
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

  async repay(){
    let _creditAmount = this.singleRepayAmount;
    let _interestAmount:number;
    console.log("interest amount is: ",~~(_creditAmount*this.repayRate));
    if ( ~~(_creditAmount*this.repayRate/100)>1){
      _interestAmount=~~(_creditAmount*this.repayRate);
    }else{
      _interestAmount = 1;
    }
    this.repayTo(this.repayLender, _interestAmount);
    // this.getFacilityAddress(this.agrAddr, this.repayLender);
    var deployedContract;
    await this.contractService.getDeployedContract('CreditAgreement',this.agrAddr)
      .then(async (_deployedContract) => {
        deployedContract = _deployedContract;
        await deployedContract.getFacility(this.repayLender, {from: this.userAddress})
        .then(async (_facilityAddress) => {
          let facilityAddress = _facilityAddress;
          console.log(facilityAddress);
          this.repayTo(facilityAddress,_creditAmount);
        });
        // console.log(facilityAddress);
        // this.repayTo(facilityAddress,_creditAmount);
      });
    // console.log(this.facilityAddress);
    
    // this.repayTo(this.facilityAddress,_creditAmount);
    
    let type:any;
    for (let loanApplication of this.loanApplications){
      if (loanApplication.aggreementAddress==this.agrAddr){
        type = loanApplication.type;
        break;
      }
    }
    let deployedFacility :any;
    if (type=="REVOLVER"){
      deployedFacility = await this.contractService.getDeployedContract("RevolverFacility", this.facilityAddress);
    }else if (type=="TERMLOAN"){
      deployedFacility = await this.contractService.getDeployedContract("TermLoanFacility", this.facilityAddress);
    }else{
      console.log("No type has found!");
    }
    await deployedFacility.createRepayment(this.userAddress, _creditAmount);
    const _getRepaymentRes = deployedFacility.getRepayment(0);
    console.log(_getRepaymentRes);
    console.log("Repayment Success!");
  }

  // async getFacilityAddress(agreementAddress:any, lenderAddress: any){
  //   var deployedContract;
  //   await this.contractService.getDeployedContract('CreditAgreement',agreementAddress)
  //     .then(async (_deployedContract) => {
  //       deployedContract = _deployedContract;
  //       this.facilityAddress = await deployedContract.getFacility(lenderAddress, {from: this.userAddress});
  //     });
    // let deployedContract:any;
    // deployedContract = this.getDeployedContracts("CreditAgreement",agreementAddress);
    // console.log(deployedContract);
    // let facilityAddress = deployedContract.getFacility(lenderAddress, {from: this.userAddress});
    // console.log(facilityAddress);
    // return(facilityAddress);
  // }

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

  Digest_show=function(){
      this.Digest_show_hide_val=!this.Digest_show_hide_val;
  }

  parseAgreement($event){
    console.log($event.target.parentElement.parentElement.id);
    this.agrAddr = $event.target.parentElement.parentElement.id
    if(this.localStorageService.getLoanApplications()){
      let loanApplications = this.localStorageService.getLoanApplications();
      for (let application of loanApplications){
        if (application.aggreementAddress == this.agrAddr){
          this.repayLenderList = application.lenderDetails;
          this.repayRate = application.rateOfInterest;
        }
      }
    }
    console.log(this.repayLenderList);
  }

  calculateTotalAmount(){
    let _interestAmount:number;
    if ( ~~(this.singleRepayAmount*this.repayRate/100)>1){
      _interestAmount=~~(this.singleRepayAmount*this.repayRate);
    }else{
      _interestAmount = 1;
    }
    this.totalRepayAmount = this.singleRepayAmount+_interestAmount;
  }
}

class repayment {
  contractName: string;
  dueAmount: number;
  limitation: number;
  dueDate: string;
  rate: number;
  allLenders: any;
  type : string;
  agreementAddress: any;

  constructor(_contractName,_dueAmount,_limitation,_dueDate,_rate,_allLenders,_type,_agreementAddress) {
    this.contractName = _contractName;
    this.dueAmount = _dueAmount;
    this.limitation = _limitation;
    this.dueDate = _dueDate;
    this.rate = _rate;
    this.allLenders = _allLenders;
    this.type = _type;
    this.agreementAddress = _agreementAddress;
  }
}
