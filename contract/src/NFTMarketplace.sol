// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// internal & private view & pure functions
// external & public view & pure functions

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {console} from "forge-std/console.sol";

/**
 * @title NFT Marketplace contract
 * @author Ike Uzoma
 *
 * The contract allows users to mint and list nfts to the marketplace
 * When a user puts an NFT for sale, the ownership of the item will be transferred from the creator to the marketplace contract.
 *
 * When a user purchases an NFT, the purchase price will be transferred from the buyer to the seller and the item will be transferred from the marketplace to the buyer.
 *
 * @notice This is a contract for an NFT market place
 */
contract NFTMarketplace is ERC721URIStorage, Ownable {
    ///////////////////////////
    /////// Errors      ///////
    ///////////////////////////
    error NFTMarketplace__MoreThanZero();
    error NFTMarketplace__TokeURIEmpty();
    error NFTMarketplace__MustBeEqualToListingPrice();
    error NFTMarketplace__InvalidItemOwner();
    error NFTMarketplace__MustBeEqualToAskingPrice();
    error NFTMarketplace__TransferFailed();

    ////////////////////////////////////
    /////// Type Declarations    ///////
    ///////////////////////////////////
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    ////////////////////////////////////
    /////// State Variables     ///////
    ///////////////////////////////////
    uint256 private s_tokenIds;
    uint256 private s_itemsSold;
    uint256 listingPrice = 0.0001 ether;
    address payable immutable i_owner;
    mapping(uint256 => MarketItem) private s_idToMarketItem;

    ///////////////////////////
    /////// Events      ///////
    ///////////////////////////
    event MarketItemCreated(
        uint256 indexed tokenId, address indexed seller, address owner, uint256 indexed price, bool sold
    );

    event MarketItemUpdated(
        uint256 indexed tokenId, address indexed seller, address owner, uint256 indexed price, bool sold
    );

    event MarketItemSold(uint256 indexed tokenId, address indexed newOwner, uint256 indexed price, bool sold);

    //////////////////////
    // Modifiers    /////
    /////////////////////
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert NFTMarketplace__MoreThanZero();
        }
        _;
    }

    modifier mustBeEqualToListingPrice(uint256 price) {
        if (listingPrice != price) {
            revert NFTMarketplace__MustBeEqualToListingPrice();
        }
        _;
    }

    constructor() ERC721("Metaverse Tokens", "METT") Ownable(msg.sender) {
        i_owner = payable(msg.sender);
    }

    /////////////////////////////
    /////// Functions    ////////
    ////////////////////////////

    ///////////////////
    // Public Functions
    ///////////////////

    /**
     * @notice This updates the listing fee. This fee will be taken from the seller and transferred to the contract owner upon completion of any sale
     * @param _listingPrice The new listing fee
     */
    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner moreThanZero(_listingPrice) {
        listingPrice = _listingPrice;
    }

    /**
     * Mints a token and lists it in the marketplace
     * @param tokenURI The nft token URI
     * @param price The NFT price set by the seller
     */
    function createToken(string memory tokenURI, uint256 price) public payable moreThanZero(price) returns (uint256) {
        if (bytes(tokenURI).length == 0) {
            //check for empty uri
            revert NFTMarketplace__TokeURIEmpty();
        }

        s_tokenIds += 1;
        uint256 newTokenId = s_tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _createMarketItem(newTokenId, price);
        return newTokenId;
    }

    /**
     * Allows a user to resell a token they have purchased
     * @param tokenId The token id
     * @param price The token price
     */
    function resellToken(uint256 tokenId, uint256 price) public payable mustBeEqualToListingPrice(msg.value) {
        if (s_idToMarketItem[tokenId].owner != msg.sender) {
            revert NFTMarketplace__InvalidItemOwner();
        }

        s_idToMarketItem[tokenId].sold = false;
        s_idToMarketItem[tokenId].price = price;
        s_idToMarketItem[tokenId].seller = payable(msg.sender);
        s_idToMarketItem[tokenId].owner = payable(address(this));
        s_itemsSold -= 1;

        emit MarketItemUpdated(tokenId, msg.sender, address(this), price, false);

        _transfer(msg.sender, address(this), tokenId);
    }

    /**
     * Creates the sale of a marketplace item
     * Transfers ownership of the item, as well as funds between parties
     * @param tokenId The id of token about to be traded
     */
    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = s_idToMarketItem[tokenId].price;
        address seller = s_idToMarketItem[tokenId].seller;

        if (msg.value != price) {
            revert NFTMarketplace__MustBeEqualToAskingPrice();
        }

        s_idToMarketItem[tokenId].owner = payable(msg.sender);
        s_idToMarketItem[tokenId].sold = true;
        s_idToMarketItem[tokenId].seller = payable(address(0));
        s_itemsSold += 1;

        emit MarketItemSold(tokenId, msg.sender, price, false);

        _transfer(address(this), msg.sender, tokenId);
        bool success = false;
        (success,) = i_owner.call{value: listingPrice}("");
        if (!success) {
            revert NFTMarketplace__TransferFailed();
        }

        (success,) = seller.call{value: msg.value}("");
        if (!success) {
            revert NFTMarketplace__TransferFailed();
        }
    }

    function createMarketItem(uint256 tokenId, uint256 price) public payable {
        _createMarketItem(tokenId, price);
    }

    ///////////////////
    // Private Functions
    ///////////////////
    /**
     * Creates a Market item for the newly minted NFT
     * @param tokenId The token id
     * @param price The token price
     */
    function _createMarketItem(uint256 tokenId, uint256 price)
        private
        moreThanZero(price)
        mustBeEqualToListingPrice(msg.value)
    {
        s_idToMarketItem[tokenId] = MarketItem(tokenId, payable(msg.sender), payable(address(this)), price, false);

        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);

        _transfer(msg.sender, address(this), tokenId);
    }

    ///////////////////
    // Public View Functions
    ///////////////////
    /**
     * Returns all unsold market items
     *
     */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = s_tokenIds;
        uint256 unsoldItemCount = s_tokenIds - s_itemsSold;
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 1; i < itemCount + 1; i++) {
            if (s_idToMarketItem[i].owner == address(this)) {
                MarketItem storage currentItem = s_idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
     * Returns only items that a user has purchased
     */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = s_tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < totalItemCount + 1; i++) {
            if (s_idToMarketItem[i].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i < totalItemCount + 1; i++) {
            if (s_idToMarketItem[i].owner == msg.sender) {
                MarketItem storage currentItem = s_idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
     * Returns only items a user has listed
     */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = s_tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < totalItemCount + 1; i++) {
            if (s_idToMarketItem[i].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i < totalItemCount + 1; i++) {
            if (s_idToMarketItem[i].seller == msg.sender) {
                MarketItem storage currentItem = s_idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
     * @return The current listing price
     */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /**
     * Gets a MarketItem using the tokenId
     * @param _tokenId The token id
     * @return The MarketItem
     */
    function getMarketItem(uint256 _tokenId) public view returns (MarketItem memory) {
        return s_idToMarketItem[_tokenId];
    }

    function getOwner() public view returns (address payable) {
        return i_owner;
    }

    function getTokenIds() public view returns (uint256) {
        return s_tokenIds;
    }
}
