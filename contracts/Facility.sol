pragma solidity ^0.5.0;
import "./USDCoin.sol";

contract Facility {

    // enum EscrewStatus { Pending, Completed, Refunded };

    // event PaymentCreation(uint indexed orderId, address indexed customer, uint value);
    // event PaymentCompletion(uint indexed orderId, address indexed customer, uint value, PaymentStatus status);

    address owner;

    uint amount;
    uint balance;
    uint fee;
    uint interest;

    uint maturityDate;
    uint expiryDate;

    struct Repayment {
        address borrower;
        uint value;
        bool refundApproved;
    }

    struct Payment {
        address borrower;
        uint value;
    }

    mapping(uint => Payment) public payments;
    mapping(uint => Repayment) public repayments;
    uint paymentID;
    uint repaymentID;
    USDCoin public currency;

    constructor(uint _amount, uint _fee, uint _maturityDate, uint _expiryDate) public {
        owner = msg.sender;
        amount = _amount;
        balance = 0;
        paymentID = 0;
        fee = _fee;
        maturityDate = _maturityDate;
        expiryDate = _expiryDate;
    }

    function getInfo() public view returns(uint, uint, uint, uint) {
        return (amount, fee, maturityDate, expiryDate);
    }

    function addBalance(uint _value) public{
        balance+=_value;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function createRepayment(address _borrower, uint _value) public onlyOwner{
        repayments[now] = Repayment(_borrower, _value, false);
        repaymentID+=1;
        // _borrower.transfer(address(this), _value);????
        // emit PaymentCreation(_orderId, _customer, _value);
    }

    function getRepayment(uint _id) public view returns(address, uint, bool){
        return(repayments[_id].borrower, repayments[_id].value, repayments[_id].refundApproved);
    }

    function getRepaymentID() public view returns(uint){
        return(repaymentID);
    }

    function createPayment(address _borrower, uint _value) public{
        require(msg.sender == _borrower);
        require(_value <= balance);
        paymentID += 1;
        payments[paymentID] = Payment(_borrower, _value);
    }

    function getPayment(uint _id) public view returns(address, uint){
        return(payments[_id].borrower, payments[_id].value);
    }

    function getPaymentID() public view returns(uint){
        return(paymentID);
    }
}