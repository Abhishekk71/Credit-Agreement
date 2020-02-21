import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { Web3Service } from '../../../../services/web3.service';

@Component({
  selector: 'app-repayment',
  templateUrl: './repayment.component.html',
  styleUrls: ['./repayment.component.css']
})
export class RepaymentComponent implements OnInit {
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
    this.web3Service.getAccounts().then((accs) => {
      this.accounts = accs;
    });

  }

  back(){
    this.router.navigateByUrl("dashboard");
  }
}

