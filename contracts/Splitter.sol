pragma solidity ^0.4.24;

contract Splitter {
    event Deposit(address indexed sender , address indexed partyA, address indexed partyB, uint amount);
    event Withdrawal(address indexed party, uint amount);

    mapping (address => uint) public funds;

    function split(address partyA, address partyB) payable public {
        require(partyA != address(0), "partyA must be a valid address");
        require(partyB != address(0), "partyB must be a valid address");
        require(msg.value != 0, "no value to split");

        emit Deposit(msg.sender, partyA, partyB, msg.value);

        uint halfAmount = msg.value / 2;
        funds[partyA] += halfAmount;
        funds[partyB] += msg.value - halfAmount;    // when amount is odd partyB will got 1 wei plus partyA
    }

    function withdraw() public {
        uint availableFunds = funds[msg.sender];
        require(availableFunds != 0, "party has no available funds to withdraw");

        funds[msg.sender] = 0;

        emit Withdrawal(msg.sender, availableFunds);

        msg.sender.transfer(availableFunds);
    }
}