pragma solidity ^0.4.24;

contract Splitter {
    event LogDeposited(address indexed sender , address indexed partyA, address indexed partyB, uint amount);
    event LogWithdrawn(address indexed party, uint amount);

    mapping (address => uint) public funds;

    function split(address partyA, address partyB) payable public {
        require(partyA != address(0), "partyA must be a valid address");
        require(partyB != address(0), "partyB must be a valid address");
        require(msg.value != 0, "no value to split");

        uint halfAmount = msg.value / 2;
        funds[partyA] += halfAmount;
        funds[partyB] += msg.value - halfAmount;    // when amount is odd partyB will got 1 wei plus partyA

        /* Other ways to handle the odd values:
        1. funds[contractOwner] += remainder;
        2. funds[msg.sender] += remainder;
        3. msg.sender.transfer(remainder);, this is sort of ok because you talk to the msg.sender.
        4. keep the remainder in-contract, and add it to msg.value on the next split.
        */

        emit LogDeposited(msg.sender, partyA, partyB, msg.value);
    }

    function withdraw() public {
        uint availableFunds = funds[msg.sender];
        require(availableFunds != 0, "party has no available funds to withdraw");

        funds[msg.sender] = 0;

        emit LogWithdrawn(msg.sender, availableFunds);

        msg.sender.transfer(availableFunds);
    }
}