pragma solidity ^0.4.24;

contract Splitter {
    event FundsReceived(uint amount); 
    event FundsClaimed(address indexed party, uint amount); 
    
    address owner;
    address partyA;
    address partyB;
    uint percentageA;
    uint percentageB;
    uint receivedFunds;
    uint remainingAFunds;
    uint remainingBFunds;
    uint claimedAFunds;
    uint claimedBFunds;
    
    modifier onlyOwner() { 
        require(msg.sender == owner);    
        _;
    }

    constructor(address _partyA, uint _percentageA, address _partyB, uint _percentageB) public {
        require(_partyA != address(0), "partyA must be a valid address");
        require(_partyB != address(0), "partyB must be a valid address");
        require(_percentageA < 100, "percentageB must be less than 100");
        require(_percentageB < 100, "percentageB must be less than 100");
        require(_percentageA + _percentageB == 100, "percentageA + percentageB must be equal to 100");
        
        owner = msg.sender;
        partyA = _partyA;
        partyB = _partyB;
        percentageA = _percentageA;
        percentageB = _percentageB;
    }
    
    function() public payable onlyOwner {   // onlyOwner assure fairness
        uint aPart = msg.value * percentageA / 100;
        uint bPart = msg.value - aPart;
        assert(aPart + bPart == msg.value);
        remainingAFunds += aPart;
        remainingBFunds += bPart;
        receivedFunds += msg.value;
        emit FundsReceived(msg.value);
    }
    
    function claimFundsForA() public {      // no need to restrict access
        require(remainingAFunds != 0, "no remaining funds for party A");
        uint fundsToSend = remainingAFunds;
        remainingAFunds = 0;
        partyA.transfer(fundsToSend);
        emit FundsClaimed(partyA, fundsToSend);
    }
    
    function claimFundsForB() public {
        require(remainingBFunds != 0, "no remaining funds for party B");
        uint fundsToSend = remainingBFunds;
        remainingBFunds = 0;
        partyB.transfer(fundsToSend);
        emit FundsClaimed(partyB, fundsToSend);
    }
}