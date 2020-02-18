var USDCoin = artifacts.require("./USDCoin.sol");

module.exports = function(deployer) {
    deployer.deploy(USDCoin, "USD Coin", "USD", 2, 1000000000);
};