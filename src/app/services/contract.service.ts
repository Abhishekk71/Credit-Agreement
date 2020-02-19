import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import contract from 'truffle-contract';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(private web3Service: Web3Service) { }

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
