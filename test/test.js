"use strict";

// >truffle.cmd test ./test/test.js --network net42

const promise = require("bluebird");

// Promisify web3
if (typeof web3.eth.getBlockPromise !== "function") {
    promise.promisifyAll(web3.eth, { suffix: "Promise" });
}
if (typeof web3.version.getNodePromise !== "function") {
    promise.promisifyAll(web3.version, { suffix: "Promise" });
}

const Splitter = artifacts.require("Splitter");

async function txCost(txReceipt) {
    let txDetails = await web3.eth.getTransaction(txReceipt.transactionHash);
    //console.log(txDetails);

    let txCost = txDetails.gasPrice.mul(txReceipt.gasUsed);
    //console.log(txCost);

    return txCost;
}

// Test
contract("Splitter", function(accounts) {
    const MAX_GAS = 4700000;

    let owner, user1, user2;
    before("check accounts", async function() {
        assert.isAtLeast(accounts.length, 3, "not enough accounts");
        [owner, user1, user2] = accounts;
    });

    let instance;
    beforeEach("create a new Splitter instance", async function() {
        //let instance = await Splitter.deployed();     // prefer to create a fresh instance before each test
        instance = await Splitter.new(user1, user2, { from: owner, gas: MAX_GAS });
    });

    describe("#constructor", async function() {
        it("should correctly store owner, partyA, partyB (input parameters)", async function() {
            const _owner = await instance.owner();
            assert.equal(_owner, owner, "stored owner doesn't match desired one");
            const partyA = await instance.partyA();
            assert.equal(partyA, user1, "stored partyA doesn't match desired one");
            const partyB = await instance.partyB();
            assert.equal(partyB, user2, "stored partyB doesn't match desired one");
        });

        // TODO
    });

    describe("#fallback function", async function() {
        it.skip("should consume <= 2300 gas", async function() {        // this is no longer a requirement

            // from Yellow paper
            const Gtx = 21000;          // tx cost
            const GcallStipend = 2300;  // exec cost
            const SEND_TX_GAS = Gtx + GcallStipend;
            const TX_SUCCESS = "0x1";

            let tx =  await instance.sendTransaction({from: owner, gas: MAX_GAS, value: 1*10**18});
            console.log("      Splitter fallback function gasUsed:",tx.receipt.gasUsed - Gtx);
            assert(tx.receipt.gasUsed <= SEND_TX_GAS, `fallback function use ${tx.receipt.gasUsed}`);
        });

        // TODO
    });

    describe("#withdraw function", async function() {

        let funds, user1BalanceStart, user2BalanceStart;
        beforeEach("send funds", async function() {
            funds = web3.toWei(0.1, "ether");
            user1BalanceStart = await web3.eth.getBalancePromise(user1);
            user2BalanceStart = await web3.eth.getBalancePromise(user2);

            const receipt = await instance.sendTransaction({from: owner, gas: MAX_GAS, value: funds});
        });

        it("should split funds correctly", async function() {
            const tx = await instance.withdraw({from: user1, gas: MAX_GAS});
            const withdrawCost = await txCost(tx.receipt);

            const user1BalanceEnd = await web3.eth.getBalancePromise(user1);
            const user2BalanceEnd = await web3.eth.getBalancePromise(user2);
            const user1RemainingFunds = await instance.remainingAFunds();
            const user2RemainingFunds = await instance.remainingBFunds();

            const user1BalanceEnd_estimated = user1BalanceStart.add(funds / 2).sub(withdrawCost);

            assert(user1BalanceEnd.toString() == user1BalanceEnd_estimated.toString(), "user1 end balance doesn't match");
            assert(user2BalanceEnd.toString() == user2BalanceStart.toString(), "user2 end balance doesn't match");

            assert(user1RemainingFunds == 0, "user1 remaining funds are not zero");
            assert(user2RemainingFunds == funds / 2, "user2 remaining funds are not correct");
        });
    });

    // TODO
});