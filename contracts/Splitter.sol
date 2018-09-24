pragma solidity ^0.4.24;

contract Splitter {
    event Deposit(uint amount);
    event Withdrawal(address indexed party, uint amount);

    address public owner;
    address public partyA;
    address public partyB;
    uint public remainingAFunds;

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

        assert(remainingFunds() == 0);              // prevents creation with funds
    }

    function remainingFunds() public view returns (uint) {
        return address(this).balance;
    }

    function remainingBFunds() public view returns (uint) {
        return address(this).balance - remainingAFunds;
    }

    function deposit() public payable onlyOwner {   // onlyOwner assures fair play
        remainingAFunds += msg.value / 2;
        emit Deposit(msg.value);                    // minimum gas usage
    }

    function() public payable onlyOwner {           // onlyOwner assures fair play
        deposit();
    }

    function withdraw() public onlyOneParty {
        require(remainingFunds() != 0, "no remaining funds to withdraw");

        uint amount = 0;
        if (msg.sender == partyA) {
            amount = remainingAFunds;
            remainingAFunds = 0;
        }
        else if (msg.sender == partyB) {
            amount = remainingBFunds();
        }
        else // made impossible by onlyOneParty modifier
            revert("only an admitted party can withdraw");

        emit Withdrawal(msg.sender, amount);
        msg.sender.transfer(amount);
    }
}