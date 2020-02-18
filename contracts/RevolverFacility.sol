pragma solidity ^0.5.0;

import "./Facility.sol";

contract RevolverFacility is Facility {

    constructor(uint _amount, uint _fee, uint _maturityDate, uint _expiryDate)
        Facility(_amount, _fee, _maturityDate, _expiryDate) public {
    }

}