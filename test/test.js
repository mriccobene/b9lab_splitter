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
        instance = await Splitter.new({ from: owner, gas: MAX_GAS });
    });

    describe("#split function", async function() {

        it("should split funds correctly", async function() {
            let amount = web3.toBigNumber(web3.toWei(0.1, "ether"));

            let tx =  await instance.split(user1, user2, {from: owner, gas: MAX_GAS, value: amount});

            let halfAmount = amount.div(2);
            let user1AvailableFunds = await instance.funds(user1);
            let user2AvailableFunds = await instance.funds(user2);

            assert(user1AvailableFunds.toString() == halfAmount.toString(),
                `available funds for user1 are wrong, expected ${halfAmount}, actual ${user1AvailableFunds}`);
            assert(user2AvailableFunds.toString() == amount.sub(halfAmount).toString(),
                `available funds for user2 are wrong, expected ${amount - halfAmount}, actual ${user2AvailableFunds}`);
        });

        it("should emit event correctly", async function() {

            let amount = web3.toBigNumber(web3.toWei(0.1, "ether"));

            let tx =  await instance.split(user1, user2, {from: owner, gas: MAX_GAS, value: amount});

            //assert.equal(tx.logs.length, 1);    // can fail for extra events
            assert.equal(tx.receipt.logs.length, 1);

            let rawEventLog = tx.receipt.logs[0];

            assert.equal(rawEventLog.topics.length, 4);
            assert.equal(rawEventLog.topics[0], web3.sha3("LogDeposited(address,address,address,uint256)"));

            //using formatted logs...

            //let eventLog = tx.logs[0];
            let eventLog = instance.LogDeposited().formatter(rawEventLog);

            assert.equal(eventLog.event, 'LogDeposited');
            assert.equal(eventLog.args.sender, owner);
            assert.equal(eventLog.args.partyA, user1);
            assert.equal(eventLog.args.partyB, user2);
            assert.equal(eventLog.args.amount.toString(), amount.toString());

        });

    });

    describe("#withdraw function", async function() {

        let funds, user1InitialBalance, user2InitialBalance;
        beforeEach("read initial balances and send funds", async function() {
            funds = web3.toBigNumber(web3.toWei(0.1, "ether")).plus(1);

            user1InitialBalance = await web3.eth.getBalancePromise(user1);
            user2InitialBalance = await web3.eth.getBalancePromise(user2);

            let tx = await instance.split(user1, user2, {from: owner, gas: MAX_GAS, value: funds});
        });

        it("should transfer funds correctly", async function() {
            const tx = await instance.withdraw({from: user1, gas: MAX_GAS});
            const withdrawCost = await txCost(tx.receipt);

            const user1FinalBalance = await web3.eth.getBalancePromise(user1);
            const user2FinalBalance = await web3.eth.getBalancePromise(user2);

            let halfFunds = funds.dividedToIntegerBy(2);

            const user1FinalBalance_estimated = user1InitialBalance.add(halfFunds).sub(withdrawCost);

            assert(user1FinalBalance.toString() == user1FinalBalance_estimated.toString(),
                `user1 end balance doesn't match, expected ${user1FinalBalance_estimated.toString()}, actual ${user1FinalBalance.toString()}`);
            assert(user2FinalBalance.toString() == user2InitialBalance.toString(),
                `user2 end balance doesn't match, expected ${user2InitialBalance.toString()}, actual ${user2FinalBalance.toString()}`);

            const user1RemainingFunds = await instance.funds(user1);
            const user2RemainingFunds = await instance.funds(user2);

            const user2RemainingFunds_estimated = funds.sub(halfFunds);

            assert(user1RemainingFunds.toString() == "0", "user1 remaining funds are not zero");
            assert(user2RemainingFunds.toString() == user2RemainingFunds_estimated.toString(), "user2 remaining funds are wrong");
        });

        it("should emit event correctly", async function() {
            const tx = await instance.withdraw({from: user1, gas: MAX_GAS});
            const withdrawCost = await txCost(tx.receipt);

            assert.equal(tx.logs.length, 1);

            let eventLog = tx.logs[0];

            assert.equal(eventLog.event, 'LogWithdrawn');
            assert.equal(eventLog.args.party, user1);
            assert.equal(eventLog.args.amount.toString(), funds.dividedToIntegerBy(2).toString(10));
        });
    });

});