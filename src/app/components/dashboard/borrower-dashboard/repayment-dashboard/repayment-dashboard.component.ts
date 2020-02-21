import { Component, OnInit } from '@angular/core';
// import { LocalStorageService } from 'src/app/services/local-storage.service';
// import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-repayment-dashboard',
  templateUrl: './repayment-dashboard.component.html',
  styleUrls: ['./repayment-dashboard.component.css']
})
export class RepaymentDashboardComponent implements OnInit {

  userAddress = "";

  contranctToPay = [];
  Digest_show_hide_val=true;

  testList: [
    1,2,3,4,5
  ]

  constructor() { }
  // private localStorageService: LocalStorageService,
  // private web3Service: Web3Service

  ngOnInit() {
    console.log("inside repayment dashboard");
    
  }

  Digest_show=function(){
      this.Digest_show_hide_val=!this.Digest_show_hide_val;
  }

}
