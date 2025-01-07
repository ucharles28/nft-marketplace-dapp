// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {DeployNtfMarketPlace} from "../script/DeployNftMarketPlace.s.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketPlaceTest is Test {
    DeployNtfMarketPlace deployer;
    NFTMarketplace nftMarketPlace;
    address SELLER = makeAddr("seller");
    uint256 constant STARTING_BALANCE = 10 ether;
    uint256 constant LISTING_PRICE = 0.025 ether;

    function setUp() public {
        deployer = new DeployNtfMarketPlace();
        nftMarketPlace = deployer.run();
        vm.deal(SELLER, STARTING_BALANCE);
    }

    /////////////////////////////
    //// Update Listing Price
    /////////////////////////////

    function testReverIfInvalidOwnerUpdateListingPrice() public {
        uint256 newListingPrice = 0.5 ether;

        vm.startPrank(SELLER);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                SELLER
            )
        );
        nftMarketPlace.updateListingPrice(newListingPrice);
        vm.stopPrank();
    }

    function testRevertIfListingPriceEqualsZero() public {
        uint256 newListingPrice = 0;
        address contractOwner = nftMarketPlace.owner();

        vm.startPrank(address(contractOwner));
        vm.expectRevert(NFTMarketplace.NFTMarketplace__MoreThanZero.selector);
        nftMarketPlace.updateListingPrice(newListingPrice);
        vm.stopPrank();
    }

    function testCanUpdateListingPrice() public {
        uint expectedListingPrice = 0.5 ether;
        address contractOwner = nftMarketPlace.owner();

        vm.startPrank(address(contractOwner));
        nftMarketPlace.updateListingPrice(expectedListingPrice);
        uint256 actualListingPrice = nftMarketPlace.getListingPrice();
        vm.stopPrank();

        assertEq(expectedListingPrice, actualListingPrice);
    }

    function testCreateTokenFailsWhenPriceIsZero() public {
        vm.expectRevert(NFTMarketplace.NFTMarketplace__MoreThanZero.selector);
        nftMarketPlace.createToken("testURI", 0);
    }

    function testCreateTokenFailsWhenURIIsEmpty() public {
        vm.prank(SELLER);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__TokeURIEmpty.selector);
        nftMarketPlace.createToken{value: LISTING_PRICE}("", 1 ether);
    }

    function testCreateTokenSuccessfully() public {
        string memory tokenURI = "testURI";
        uint256 price = 1 ether;

        vm.prank(SELLER);
        uint256 newTokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            price
        );

        assertEq(newTokenId, 1);
        NFTMarketplace.MarketItem memory marketItem = nftMarketPlace
            .getMarketItem(newTokenId);

        assertEq(marketItem.tokenId, newTokenId);
        assertEq(marketItem.seller, SELLER);
        assertEq(marketItem.owner, address(nftMarketPlace));
        assertEq(marketItem.price, price);
        assertEq(marketItem.sold, false);
    }

    function testCreateMarketItemFailsWhenPriceIsZero() public {
        vm.startPrank(SELLER);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__MoreThanZero.selector);
        nftMarketPlace.createMarketItem(1, 0);
        vm.stopPrank();
    }

    function testCreateMarketItemFailsWhenMsgValueNotEqualToListingPrice()
        public
    {
        vm.startPrank(SELLER);

        vm.expectRevert(
            NFTMarketplace.NFTMarketplace__MustBeEqualToListingPrice.selector
        );
        nftMarketPlace.createMarketItem{value: 0.01 ether}(1, 1 ether);

        vm.stopPrank();
    }

    function testResellTokenFailsWhenListingPriceIsIncorrect() public {
        string memory tokenURI = "testURI";
        uint256 initialPrice = 1 ether;
        uint256 tokenId;

        // Create a token
        vm.startPrank(SELLER);
        tokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            initialPrice
        );
        vm.stopPrank();

        address buyer = makeAddr("buyer");
        // Buy the token
        vm.startPrank(buyer);
        vm.deal(buyer, 2 ether);
        nftMarketPlace.createMarketSale{value: initialPrice}(tokenId);
        vm.stopPrank();

        // Attempt to resell the token with incorrect listing price
        vm.startPrank(buyer);
        vm.expectRevert(
            NFTMarketplace.NFTMarketplace__MustBeEqualToListingPrice.selector
        );
        nftMarketPlace.resellToken{value: 0.01 ether}(tokenId, 2 ether); // Incorrect `msg.value`
        vm.stopPrank();
    }

    function testResellTokenFailsWhenCallerIsNotOwner() public {
        string memory tokenURI = "testURI";
        uint256 initialPrice = 1 ether;
        uint256 tokenId;

        // Create a token
        vm.startPrank(SELLER);
        tokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            initialPrice
        );
        vm.stopPrank();

        address buyer = makeAddr("buyer");
        // Buy the token
        vm.startPrank(buyer);
        vm.deal(buyer, 2 ether);
        nftMarketPlace.createMarketSale{value: initialPrice}(tokenId);
        vm.stopPrank();

        // Attempt to resell the token by a non-owner
        vm.startPrank(SELLER); // Not the owner of the token
        vm.expectRevert(
            NFTMarketplace.NFTMarketplace__InvalidItemOwner.selector
        );
        nftMarketPlace.resellToken{value: LISTING_PRICE}(tokenId, 2 ether);
        vm.stopPrank();
    }

    function testResellTokenSuccessfully() public {
        string memory tokenURI = "testURI";
        uint256 initialPrice = 1 ether;
        uint256 resalePrice = 2 ether;
        uint256 tokenId;

        // Create a token
        vm.startPrank(SELLER);
        tokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            initialPrice
        );
        vm.stopPrank();

        address buyer = makeAddr("buyer");
        // Buy the token
        vm.deal(buyer, 2 ether);
        vm.startPrank(buyer);
        nftMarketPlace.createMarketSale{value: initialPrice}(tokenId);
        vm.stopPrank();

        // Resell the token
        vm.startPrank(buyer);
        // vm.deal(buyer, 0.025 ether);
        nftMarketPlace.resellToken{value: LISTING_PRICE}(tokenId, resalePrice);

        NFTMarketplace.MarketItem memory marketItem = nftMarketPlace
            .getMarketItem(tokenId);

        assertEq(marketItem.sold, false);
        assertEq(marketItem.price, resalePrice);
        assertEq(marketItem.seller, buyer);
        assertEq(marketItem.owner, address(nftMarketPlace));
        vm.stopPrank();
    }

    function testCreateMarketSaleFailsWhenPriceDoesNotMatch() public {
        string memory tokenURI = "testURI";
        uint256 initialPrice = 1 ether;
        uint256 tokenId;

        // Create a token
        vm.startPrank(SELLER);
        tokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            initialPrice
        );
        vm.stopPrank();

        address buyer = makeAddr("buyer");
        // Attempt to purchase the token with incorrect price
        vm.startPrank(buyer);
        vm.deal(buyer, 2 ether);
        vm.expectRevert(
            NFTMarketplace.NFTMarketplace__MustBeEqualToAskingPrice.selector
        );
        nftMarketPlace.createMarketSale{value: 0.5 ether}(tokenId);
        vm.stopPrank();
    }

    /*function testCreateMarketSaleFailsWhenTransferFails() public {
        string memory tokenURI = "testURI";
        uint256 initialPrice = 1 ether;
        uint256 tokenId;

        // Create a token
        vm.startPrank(SELLER);
        tokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            initialPrice
        );
        vm.stopPrank();

        // Mock a scenario where the contract owner's call fails
        vm.mockCall(
            address(nftMarketPlace.getOwner()),
            abi.encodeWithSelector(nftMarketPlace.getOwner().call.selector),
            abi.encode(false)
        );

        address buyer = makeAddr("buyer");
        // Attempt to purchase the token
        vm.startPrank(buyer);
        vm.deal(buyer, 2 ether);
        vm.expectRevert(NFTMarketplace.NFTMarketplace__TransferFailed.selector);
        nftMarketPlace.createMarketSale{value: 1 ether}(tokenId);
        vm.stopPrank();
    }*/

    function testCreateMarketSaleSuccessfully() public {
        string memory tokenURI = "testURI";
        uint256 initialPrice = 1 ether;
        uint256 tokenId;

        // Create a token
        vm.startPrank(SELLER);
        tokenId = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI,
            initialPrice
        );
        vm.stopPrank();

        address buyer = makeAddr("buyer");
        // Buyer purchases the token
        vm.startPrank(buyer);
        vm.deal(buyer, 2 ether);
        nftMarketPlace.createMarketSale{value: initialPrice}(tokenId);
        vm.stopPrank();

        NFTMarketplace.MarketItem memory marketItem = nftMarketPlace
            .getMarketItem(tokenId);

        // Validate the state after sale
        assertEq(marketItem.owner, buyer);
        assertEq(marketItem.sold, true);
        assertEq(marketItem.seller, address(0));

        // Validate that the seller received the funds
        assertEq(
            SELLER.balance,
            (STARTING_BALANCE - LISTING_PRICE) + initialPrice
        );
    }

    function testFetchMarketItems() public {
        string memory tokenURI1 = "testURI1";
        string memory tokenURI2 = "testURI2";
        uint256 price = 1 ether;

        // Create two tokens
        vm.startPrank(SELLER);
        uint256 tokenId1 = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI1,
            price
        );
        uint256 tokenId2 = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI2,
            price
        );
        vm.stopPrank();

        // Buyer purchases one token
        vm.startPrank(address(2));
        vm.deal(address(2), 2 ether);
        nftMarketPlace.createMarketSale{value: price}(tokenId1);
        vm.stopPrank();

        // Fetch unsold market items
        NFTMarketplace.MarketItem[] memory items = nftMarketPlace
            .fetchMarketItems();

        // Validate the returned items
        assertEq(items.length, 1);
        assertEq(items[0].tokenId, tokenId2);
        assertEq(items[0].owner, address(nftMarketPlace));
        assertEq(items[0].sold, false);
    }

    function testFetchMyNFTs() public {
        string memory tokenURI1 = "testURI1";
        string memory tokenURI2 = "testURI2";
        uint256 price = 1 ether;

        // Create two tokens
        vm.startPrank(SELLER);
        uint256 tokenId1 = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI1,
            price
        );
        uint256 tokenId2 = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI2,
            price
        );
        vm.stopPrank();

        // Buyer purchases one token
        vm.startPrank(address(2));
        vm.deal(address(2), 2 ether);
        nftMarketPlace.createMarketSale{value: price}(tokenId1);
        vm.stopPrank();

        // Fetch NFTs owned by the buyer
        vm.startPrank(address(2));
        NFTMarketplace.MarketItem[] memory items = nftMarketPlace.fetchMyNFTs();
        vm.stopPrank();

        // Validate the returned items
        assertEq(items.length, 1);
        assertEq(items[0].tokenId, tokenId1);
        assertEq(items[0].owner, address(2));
        assertEq(items[0].sold, true);
    }

    function testFetchItemsListed() public {
        string memory tokenURI1 = "testURI1";
        string memory tokenURI2 = "testURI2";
        uint256 price = 1 ether;

        // Create two tokens
        vm.startPrank(SELLER);
        uint256 tokenId1 = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI1,
            price
        );
        uint256 tokenId2 = nftMarketPlace.createToken{value: LISTING_PRICE}(
            tokenURI2,
            price
        );
        vm.stopPrank();

        // Fetch items listed by the creator
        vm.startPrank(SELLER);
        NFTMarketplace.MarketItem[] memory items = nftMarketPlace
            .fetchItemsListed();
        vm.stopPrank();

        // Validate the returned items
        assertEq(items.length, 2);
        assertEq(items[0].tokenId, tokenId1);
        assertEq(items[1].tokenId, tokenId2);
        assertEq(items[0].seller, SELLER);
        assertEq(items[1].seller, SELLER);
        assertEq(items[0].owner, address(nftMarketPlace));
        assertEq(items[1].owner, address(nftMarketPlace));
    }
}
