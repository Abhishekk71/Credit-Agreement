pragma solidity ^0.5.0;

import "./Facility.sol";

contract CreditAgreement {

    address owner;

    address borrower;
    bool hasBorrowerSigned;
    uint intrestMax;
    uint intrestMin;
           

    struct Lender {
        address lender;
        uint share;
        uint interest;
        bool hasSigned;
    }
    Lender[] lenders;

    uint amount;

    uint agreementDate;
    uint closingDate;

    Facility[] facilities;

    constructor(address _borrower, address[] memory _lenders, uint[] memory _lenderShares, uint _amount, uint _closingDate, uint _intrestMax, uint _intrestMin) public {
        owner = msg.sender;
        borrower = _borrower;
        intrestMax = _intrestMax;
        intrestMin = _intrestMin;
        for(uint i = 0; i < lenders.length; i++) {
            lenders.push(Lender({lender: _lenders[i], share: _lenderShares[i],interest: intrestMin, hasSigned: false}));
        }
        amount = _amount;
        closingDate = _closingDate;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is allowed to perform this action");
        _;
    }

    modifier onlyBorrower() {
        require(msg.sender == borrower, "Only borrower is allowed to perform this action");
        _;
    }

    modifier onlyLender() {
        bool isLender = false;
        for(uint i = 0; i < lenders.length; i++) {
            if(msg.sender == lenders[i].lender) {
                isLender = true;
                break;
            }
        }
        require(isLender == true, "Only lender is allowed to perform this action");
        _;
    }

    function addFacility(address facilityAddress) public onlyOwner {
        facilities.push(Facility(facilityAddress));
    }

    function signAsABorrower() public onlyBorrower {
        hasBorrowerSigned = true;
        if(hasEveryoneSigned() == true) {
            agreementDate = now;
        }
    }
    

    function signAsALender() public returns(bool){
    //function signAsALender() public oblyBorrower {
        for(uint i = 0; i < lenders.length; i++) {
            if(msg.sender == lenders[i].lender) {
                lenders[i].hasSigned = true;
                if(hasEveryoneSigned() == true) {
                    agreementDate = now;
                }
            }
        }
    }

    function hasEveryoneSigned() public view returns(bool) {
        if(hasBorrowerSigned == false) {
            return false;
        }
        for(uint i = 0; i < lenders.length; i++) {
            if(lenders[i].hasSigned == false) {
                return false;
            }
        }
        return true;
    }

}