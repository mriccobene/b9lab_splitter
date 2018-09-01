pragma solidity ^0.4.24;

contract Splitter {
    event Deposit(uint amount);
    event Withdrawal(address indexed party, uint amount);

    address public owner;
    address public partyA;
    address public partyB;
    uint public receivedFunds;
    uint public remainingAFunds;
    uint public remainingBFunds;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyOneParty() {
        require(msg.sender == partyA || msg.sender == partyB);
        _;
    }

    constructor(address _partyA, address _partyB) public {
        require(_partyA != address(0), "partyA must be a valid address");
        require(_partyB != address(0), "partyB must be a valid address");

        owner = msg.sender;
        partyA = _partyA;
        partyB = _partyB;
    }

    function deposit() public payable onlyOwner {   // onlyOwner assure fair play
        uint aPart = msg.value / 2;
        uint bPart = msg.value - aPart;
        assert(aPart + bPart == msg.value);
        remainingAFunds += aPart;
        remainingBFunds += bPart;
        receivedFunds += msg.value;
        emit Deposit(msg.value);
    }

    function() public payable onlyOwner {   // onlyOwner assure fair play
        deposit();
    }

    function withdraw() public onlyOneParty {
        uint presentFunds = remainingAFunds+remainingBFunds;
        require(presentFunds != 0, "no remaining funds to withdraw");

        uint amount = 0;
        if (msg.sender == partyA) {
            amount = remainingAFunds;
            remainingAFunds = 0;
        }
        else {
            assert(msg.sender == partyB);   // assured by onlyOneParty modifier

            amount = remainingBFunds;
            remainingBFunds = 0;
        }

        assert(remainingAFunds + remainingBFunds + amount == presentFunds);     // invariant

        msg.sender.transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
}