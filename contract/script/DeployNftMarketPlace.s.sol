// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";

contract DeployNtfMarketPlace is Script {

    function run() external returns (NFTMarketplace) {
        vm.startBroadcast();
        NFTMarketplace nftMarketplace = new NFTMarketplace();
        vm.stopBroadcast();
        return nftMarketplace;
    }
}