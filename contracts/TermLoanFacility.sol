pragma solidity ^0.5.0;

import "./Facility.sol";

contract TermLoanFacility is Facility {

    enum AMORTIZATION_SCHEDULE {
        MONTHLY, QUARTERLY, SEMI_ANNUALLY, ANNUALLY
    }

    AMORTIZATION_SCHEDULE amortizationSchedule;

    uint closingDate;

    constructor(uint _amount, uint _fee, uint _maturityDate, uint _expiryDate, AMORTIZATION_SCHEDULE _amortizationSchedule, uint _closingDate)
    Facility(_amount, _fee, _maturityDate, _expiryDate) public {
        amortizationSchedule = _amortizationSchedule;
        closingDate = _closingDate;
    }

}