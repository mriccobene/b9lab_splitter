"use strict";

const promise = require("bluebird");

// Promisify web3
if (typeof web3.eth.getBlockPromise !== "function") {
    promise.promisifyAll(web3.eth, { suffix: "Promise" });
}
if (typeof web3.version.getNodePromise !== "function") {
    promise.promisifyAll(web3.version, { suffix: "Promise" });
}

const Splitter = artifacts.require("Splitter");

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
        it("should consume <= 2300 gas", async function() {
            let tx =  await instance.sendTransaction({from: owner, gas: MAX_GAS, value: 1*10**18});
             assert(tx.receipt.gasUsed <= 2300, `fallback function use ${tx.receipt.gasUsed}`);
        });

        // TODO
    });

    // TODO
});