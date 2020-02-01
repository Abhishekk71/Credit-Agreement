import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  account;
  accounts = [];

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private web3Service: Web3Service) { }

  ngOnInit() {
    this.web3Service.getAccounts().then((accounts) => {
      this.accounts = accounts;
    });
  }

  login() {
    if(!this.account) {
      alert("Please select an account");
    }
    console.log(this.account);
    this.localStorageService.setUser(this.account);
    this.router.navigateByUrl("dashboard");
  }

}
