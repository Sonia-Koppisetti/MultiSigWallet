const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const PayMasterModule = buildModule("PayMaster", (m) => {
  const PayMaster = m.contract("PayMaster");

  return { PayMaster };
});

module.exports = PayMasterModule;