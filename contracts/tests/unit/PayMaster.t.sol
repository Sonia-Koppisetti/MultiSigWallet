// file: PaymasterTest.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../contracts/Paymaster.sol";
import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

contract PayMasterTest is Test {
    EntryPoint private entryPoint;
    PaymasterHarness private paymaster;
    address private owner;

    function setUp() external {
        owner = makeAddr("owner");
        entryPoint = new EntryPoint();

        vm.startPrank(owner);
        paymaster = new PaymasterHarness(entryPoint);
        vm.stopPrank();
    }

    function testOwnerCanAddAndRemoveAddressesFromWhitelist() public {
        address testUser = makeAddr("testUser");

        vm.prank(owner);
        paymaster.addAddress(testUser);
        assertEq(true, paymaster.checkWhitelist(testUser));

        vm.prank(owner);
        paymaster.removeAddress(testUser);
        assertEq(false, paymaster.checkWhitelist(testUser));
    }
}
