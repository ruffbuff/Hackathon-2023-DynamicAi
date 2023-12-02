// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
contract DynamicV2 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    event NFTMinted(address to, uint256 tokenId, string marketType);
    
    mapping(uint256 => string) private _tokenURIs;

    address private dev1; // Deployer
    address private operator; // Bot-operator
    address private addressOfFirstContract;
    AggregatorV3Interface internal priceFeed;

    string private bullMarketURI;
    string private bearMarketURI;
    int256 private bearMarketThreshold = 3870000000000;

    modifier onlyDev1OrOperator() {
        require(msg.sender == dev1 || msg.sender == operator, "Caller is not authorized");
        _;
    }

    constructor(string memory _bullURI, string memory _bearURI) ERC721("DynamicAiV2", "DAV2") {
        bullMarketURI = _bullURI;
        bearMarketURI = _bearURI;
        dev1 = msg.sender;
        operator = 0x5F82dE5FCf2EacD3dD3F45ec671B4870ebb60954;
        priceFeed = AggregatorV3Interface(0x007A22900a3B98143368Bd5906f8E17e9867581b); // BTC/USD address on Mumbai
    }

    function getLatestPrice() public view returns (int256) {
        (,int256 price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function mint(address to) public {
        require(msg.sender == addressOfFirstContract, "Only first contract can mint");
        int256 currentPrice = getLatestPrice();

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(to, newTokenId);

        string memory marketType;
        if (currentPrice >= bearMarketThreshold) {
            _setTokenURI(newTokenId, bullMarketURI);
            marketType = "Bull";
        } else {
            _setTokenURI(newTokenId, bearMarketURI);
            marketType = "Bear";
        }

        emit NFTMinted(to, newTokenId, marketType);
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(tokenExists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenExists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function tokenExists(uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    function setFirstContractAddress(address _address) external onlyDev1OrOperator {
        addressOfFirstContract = _address;
    }

    function setBearMarketThreshold(int256 newThreshold) external onlyDev1OrOperator {
        bearMarketThreshold = newThreshold;
    }
}