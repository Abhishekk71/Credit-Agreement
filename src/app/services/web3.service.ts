import { Injectable } from '@angular/core';
import contract from 'truffle-contract';
import { async } from '@angular/core/testing';
declare let require: any;
const Web3 = require('web3');


declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts = [];
  public ready = false;

  private organizations = ["ADMIN", "BOSTON SPORTS CLUB", "HOME GOODS", "BANK OF AMERICA", "FIRST MARK CAPITAL", "SANTANDER BANK", "JP MORGAN CHASE", "MORGAN STANLEY", "CITI BANK", "GOLDMAN SACHS"];

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public async bootstrapWeb3() {
    if (typeof window.web3 !== 'undefined') {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    await this.configureAccounts();
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  public async getAccounts() {
    if(this.ready==false){
      await this.bootstrapWeb3();
    }
    return this.accounts;
  }

  public async getAccountOf(address) {
    if(this.ready==false){
      await this.bootstrapWeb3();
    }
    for (let account of this.accounts) {
      if (account.address == address) {
        return account;
      }
    }
    return null;
  }

  private async configureAccounts() {
    await this.web3.eth.getAccounts(async (err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      if (this.accounts.length == 0) {
        for (let i = 0; i < accs.length; i++) {
          if (i == 0) {
            this.accounts.push({
              address: accs[i],
              name: this.organizations[i],
              type: 'ADMIN'
            });
          }
          else if (i < 3) {
            this.accounts.push({
              address: accs[i],
              name: this.organizations[i],
              type: 'BORROWER'
            });
          } else {
            this.accounts.push({
              address: accs[i],
              name: this.organizations[i],
              type: 'LENDER'
            });
          }
        }
      }
      this.ready = true;
    });
  }
}
