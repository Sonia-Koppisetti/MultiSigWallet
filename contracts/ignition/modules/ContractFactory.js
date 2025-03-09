const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const WalletFactoryModule = buildModule("WalletFactory", (m) => {
  const WalletFactory = m.contract("WalletFactory");

  return { WalletFactory };
});

module.exports = WalletFactoryModule;