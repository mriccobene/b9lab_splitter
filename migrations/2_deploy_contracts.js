const Splitter = artifacts.require("Splitter");

module.exports = function(deployer, network, accounts) {
    const MAX_GAS = 4700000;

    let owner = accounts[0];
    let partyA= accounts[1];
    let partyB = accounts[2];
    if (network == "ropsten") {
        owner = "0x";
    }

    /*
    // CLASSIC deploy pattern
    deployer.deploy(Splitter, partyA, partyB, { from: owner, gas: MAX_GAS })
        .then(instance => {return web3.eth.getTransactionReceipt(instance.transactionHash);})
        .then(receipt => console.log('  Splitter gasUsed: ' + receipt.gasUsed))
    */


    /*
    // FLEXIBLE deploy pattern
    deployer.then(() => {
        return deployer.deploy(Splitter, partyA, partyB, { from: owner, gas: MAX_GAS })
    }).then((instance) => {
        return web3.eth.getTransactionReceipt(instance.transactionHash);
    }).then((receipt) => {
        console.log('  Splitter gasUsed: ' + receipt.gasUsed);
    });
    */

    // CLEAR deploy pattern
    deployer.then(async () => {

        let splitter = await deployer.deploy(Splitter, partyA, partyB, { from: owner, gas: MAX_GAS });
        let receipt = web3.eth.getTransactionReceipt(splitter.transactionHash);
        console.log('  Splitter deployment gasUsed: ' + receipt.gasUsed);
    });

};