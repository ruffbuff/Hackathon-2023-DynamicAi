// contracts/weather.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WeatherNFT is ERC721Enumerable {
    using Strings for uint256;

    // Custom structure for NFT metadata
    struct WeatherToken {
        string name;
        Style style;
        string country;
    }

    // Enum for styles
    enum Style { Classic, Modern, Abstract, Realistic, Surreal }

    // Event for minting
    event WeatherNFTMinted(address minter, uint256 tokenId, string name, Style style, string country);

    bool public mintingPaused = false;
    mapping(uint256 => WeatherToken) public weatherTokens;
    mapping(uint256 => string) private _tokenURIs;
    mapping(string => int8) public countryTimeZones;

    // Roles
    address public dev1;
    address public dev2;
    address public operator;

    // Modifiers
    modifier onlyDev1() {
        require(msg.sender == dev1, "Caller is not dev1");
        _;
    }

    modifier onlyDev2() {
        require(msg.sender == dev2, "Caller is not dev2");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "Caller is not operator");
        _;
    }

    modifier whenNotPaused() {
        require(!mintingPaused, "Minting is paused");
        _;
    }

    // Initial list of countries and their time zones
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        dev1 = msg.sender; // Assign the deployer as the first developer
        // Initialize countries with their UTC time zones
        countryTimeZones["Spain"] = 1; // UTC+1
        countryTimeZones["Poland"] = 1; // UTC+1
        countryTimeZones["Japan"] = 9; // UTC+9
        countryTimeZones["Brazil"] = -3; // UTC-3
        countryTimeZones["Canada"] = -5; // UTC-5
    }

    // Public functions
    function mint(string memory name, Style style, string memory country) public whenNotPaused {
        require(countryTimeZones[country] != 0, "Invalid country");
        
        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);
        
        weatherTokens[tokenId] = WeatherToken(name, style, country);
        emit WeatherNFTMinted(msg.sender, tokenId, name, style, country);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length > 0, "ERC721URIStorage: URI query for nonexistent token");
        return uri;
    }

    function toggleMintingPause() public onlyDev1 {
        mintingPaused = !mintingPaused;
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyOperator {
        _tokenURIs[tokenId] = uri;
    }

    function setupRoles(address _dev2, address _operator) external onlyDev1 {
        dev2 = _dev2;
        operator = _operator;
    }

    function setCountryTimeZone(string memory country, int8 timeZone) public onlyDev1 {
        countryTimeZones[country] = timeZone;
    }

}
