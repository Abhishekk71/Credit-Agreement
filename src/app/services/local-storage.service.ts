import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

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
    console.log(application);
    let loanApplications = this.getLoanApplications();
    for(let i = 0; i< loanApplications.length; i ++) {
      if(loanApplications[i].id == application.id) {
        loanApplications[i] = application;
      }
    }
    console.log(loanApplications);
    localStorage.setItem("loanApplications", JSON.stringify(loanApplications));
  }

  setApplication(application) {
    localStorage.setItem("application", JSON.stringify(application));
  }

  getApplication() {
    return JSON.parse(localStorage.getItem("application"));
  }

  // getLendDetails(){
  //   return JSON.parse(localStorage.getItem("lendDetails"));
  // }

  // addLendDetail(lendDetail){
  //   let lendDetails = this.getLendDetails();
  //   lendDetails.push(lendDetail);
  //   localStorage.setItem("lendDetails", JSON.stringify(lendDetails));
  //   console.log("in addLendDetail, lendDetails is: ");
  //   console.log(lendDetails);
  // }
}
