import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
const contract = require('truffle-contract');

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(private web3Service: Web3Service) { }

  async deployAgreementContract(_application, _lenders, _lenderShares, _from) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("enter contract.service.ts");
        let contractArtifacts = require(`./../../../build/contracts/CreditAgreement.json`);
        let _contract = contract(contractArtifacts);
        _contract.setProvider(this.web3Service.getWeb3().currentProvider);
        //console.log(Date.parse(new Date().toString()));
        await _contract.new(_application.borrower["address"], _lenders, _lenderShares, _application.totalLoanAmount, Date.parse(new Date().toString()), { from: _from })
          .then((deployedAgreementContract) => {
            resolve(deployedAgreementContract);
            console.log("deployedAgreementContract is:");
            console.log(deployedAgreementContract);
          }).catch((e) => {
            throw e;
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  async deployFacilityContract(_amount, _fee, _maturityDate, _expiryDate, _from) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("enter contract.service.ts");
        let contractArtifacts = require(`./../../../build/contracts/Facility.json`);
        let _contract = contract(contractArtifacts);
        _contract.setProvider(this.web3Service.getWeb3().currentProvider);
        await _contract.new(_amount, _fee, _maturityDate, _expiryDate, Date.parse(new Date().toString()), { from: _from})
          .then((deployedFacilityContract) => {
            resolve(deployedFacilityContract);
            console.log("deployedAgreementContract is:");
            console.log(deployedFacilityContract);
          }).catch((e) => {
            throw e;
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getDeployedContract(contractName, contractAddress) {
    return new Promise(async (resolve, reject) => {
      try {
        let contractArtifacts = require(`./../../../build/contracts/${contractName}.json`);
        let _contract = contract(contractArtifacts);
        _contract.setProvider(this.web3Service.getWeb3().currentProvider);
        await _contract.at(contractAddress).then((deployedContract) => {
          resolve(deployedContract);
        }).catch((e) => {
          throw e;
        });
      } catch (e) {
        reject(e);
      }
    });
  }


}
