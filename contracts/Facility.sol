pragma solidity ^0.5.0;

contract Facility {

    address owner;

    uint amount;
    uint fee;

    uint maturityDate;
    uint expiryDate;

    constructor(uint _amount, uint _fee, uint _maturityDate, uint _expiryDate) public {
        owner = msg.sender;
        amount = _amount;
        fee = _fee;
        maturityDate = _maturityDate;
        expiryDate = _expiryDate;
    }

    function getInfo() public view returns(uint, uint, uint, uint) {
        return (amount, fee, maturityDate, expiryDate);
    }

}