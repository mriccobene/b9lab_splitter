pragma solidity ^0.4.24;

contract Splitter {
    event Deposit(uint amount);
    event Withdrawal(address indexed party, uint amount);

    address public owner;
    address public partyA;
    address public partyB;
    uint public unsplittedFunds;
    uint public remainingAFunds;
    uint public remainingBFunds;
    uint public withdrawnFunds;

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

    function remainingFunds() public view returns (uint) {
        return remainingAFunds + remainingBFunds + unsplittedFunds;
    }

    function receivedFunds() public view returns (uint) {
        return withdrawnFunds + remainingFunds();
    }

    function deposit() public payable onlyOwner {   // onlyOwner assure fair play
        unsplittedFunds += msg.value;               // minimum gas usage
        emit Deposit(msg.value);
    }

    function() public payable onlyOwner {   // onlyOwner assure fair play
        deposit();
    }

    function split() internal {
        if (unsplittedFunds == 0)
            return;

        uint aPart = unsplittedFunds / 2;
        uint bPart = unsplittedFunds - aPart;
        assert(aPart + bPart == unsplittedFunds);
        remainingAFunds += aPart;
        remainingBFunds += bPart;
    }

    function withdraw() public onlyOneParty {
        split();

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

        withdrawnFunds += amount;

        assert(remainingAFunds + remainingBFunds + amount == presentFunds);     // invariant

        msg.sender.transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
}