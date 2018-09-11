/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!

    networks: {
        development: {       // This one is optional and reduces the scope for failing fast
            host: "localhost",
            port: 8546,
            network_id: "*", // Match any network id
            gas: 500000
        },
        ropsten: {       // This one is optional and reduces the scope for failing fast
            host: "localhost",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 500000
        },
        net42: {
            host: "localhost",
            port: 8547,
            network_id: 42,
            gas: 500000
        }
    }

};
