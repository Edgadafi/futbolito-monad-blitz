// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GameCredits.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        GameCredits gc = new GameCredits();
        console.log("GameCredits desplegado en:", address(gc));
        console.log("Owner:", gc.owner());
        vm.stopBroadcast();
    }
}
