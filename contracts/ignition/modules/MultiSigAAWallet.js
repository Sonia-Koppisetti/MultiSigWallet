const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MultiSigAAWallet = buildModule("MultiSigAAWallet", (m) => {
  const MultiWallet = m.contract("MultiSigAAWallet");

  return { MultiWallet };
});

module.exports = MultiSigAAWallet;