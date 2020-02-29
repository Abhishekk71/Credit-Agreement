import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
    if (localStorage.getItem("user") == null) {
      localStorage.setItem("user", "");
    }
    if (localStorage.getItem("loanApplications") == null) {
      localStorage.setItem("loanApplications", "[]");
    }
    if (localStorage.getItem("transactions") == null) {
      localStorage.setItem("transactions", "[]");
    }
  }

  setUser(user) {
    localStorage.setItem("user", user);
  }

  getUser() {
    let userAddress = localStorage.getItem("user");
    if (!userAddress || userAddress == "") {
      return null;
    }
    return userAddress;
  }

  getLoanApplications() {
    return JSON.parse(localStorage.getItem("loanApplications"))
  }

  addLoanApplication(application) {
    let loanApplications = this.getLoanApplications();
    loanApplications.push(application);
    localStorage.setItem("loanApplications", JSON.stringify(loanApplications));
    console.log(loanApplications);
  }

  updateLoanApplication(application) {
    //console.log(application);
    let loanApplications = this.getLoanApplications();
    for (let i = 0; i < loanApplications.length; i++) {
      if (loanApplications[i].id == application.id) {
        loanApplications[i] = application;
      }
    }
    //console.log(loanApplications);
    localStorage.setItem("loanApplications", JSON.stringify(loanApplications));
  }

  getTransactions() {
    return JSON.parse(localStorage.getItem("transactions"))
  }

  addTransactions(transaction) {
    let transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    console.log(transactions);
  }

  updateTransactions(transaction) {
    //console.log(application);
    let transactions = this.getLoanApplications();
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].txHash == transaction.txHash) {
        transactions[i] = transaction;
      }
    }
    //console.log(loanApplications);
    localStorage.setItem("loanApplications", JSON.stringify(transactions));
  }

}
