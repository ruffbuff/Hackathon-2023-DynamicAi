/*
    ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██
    █                                                            █
    █   RRRRR   U   U  FFFFF  FFFFF  B   B  U   U  FFFFF  FFFFF  █
    █   R   R   U   U  F      F      B   B  U   U  F      F      █
    █   RRRRR   U   U  FFFF   FFFF   BBBBB  U   U  FFFF   FFFF   █
    █   R  R    U   U  F      F      B   B  U   U  F      F      █
    █   R   R   UUUUU  F      F      B   B  UUUUU  F      F      █
    █                                                            █
    ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██

#Wallet: 0xruffbuff.eth
#Discord: chain.eth | 0xRuffBuff#8817
*/
// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
interface VRFCoordinatorV2Interface {
    function getRequestConfig() external view returns (uint16, uint32, bytes32[] memory);
    function requestRandomWords(bytes32 keyHash, uint64 subId, uint16 minimumRequestConfirmations, uint32 callbackGasLimit, uint32 numWords) external returns (uint256 requestId);
    function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers);
}
interface IDynamicV2 {
    function mint(address to) external;
}
contract Dynamic is AutomationCompatibleInterface, ERC721Enumerable, VRFConsumerBaseV2, ConfirmedOwner {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    event WeatherNFTMinted(address minter, uint256 tokenId, string animal, string name, string country, string style);
    event RandomnessRequested(uint256 tokenId, uint256 requestId);
    event RandomnessFulfilled(uint256 tokenId, uint256[] randomNumbers);
    event URIBatchAdded(uint256 indexed tokenId, string[4] uris, uint256 burnInSeconds, string imageURL);
    event UpkeepPerformed(uint256 tokenId, string newURI);

    struct WeatherToken {
        string animal;
        string name;
        string country;
        string style;
    }

    struct TokenBurnData {
        uint256 burnTime;
        bool isSet;
    }

    mapping(uint256 => string) public _tokenURIs;
    mapping(string => int8) public countryTimeZones;

    mapping(string => bool) private validAnimals;
    mapping(string => bool) private validStyles;
    
    mapping(uint256 => bool) public hasURIBatch;

    mapping(uint256 => WeatherToken) public weatherTokens;
    mapping(uint256 => TokenBurnData) public tokenBurnTimes;
    
    mapping(uint256 => uint256) public requestIdToTokenId;
    mapping(uint256 => uint256[]) public tokenIdToRandomNumbers;
    mapping(uint256 => string[4]) public uriBatches;
    mapping(uint256 => uint256) public nextURIIndex;
    mapping(uint256 => uint256) public nextUpdateTime;

    address private dev1; // Deployer
    address private operator; // Bot-operator
    address private secondContractAddress;
    VRFCoordinatorV2Interface COORDINATOR;

    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint64 s_subscriptionId;
    uint32 numWords = 2;

    modifier onlyDev1OrOperator() {
        require(msg.sender == dev1 || msg.sender == operator, "Caller is not authorized");
        _;
    }

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
        dev1 = msg.sender;
        operator = 0x5F82dE5FCf2EacD3dD3F45ec671B4870ebb60954;
        s_subscriptionId = 6385;
        countryTimeZones["Estonia"] = 2;
        countryTimeZones["Bangladesh"] = 6;
        countryTimeZones["Poland"] = 1;
        countryTimeZones["SaudiArabia"] = 3;
        countryTimeZones["Japan"] = 9;
        validAnimals["Cat"] = true;
        validAnimals["Dog"] = true;
        validAnimals["Horse"] = true;
        validAnimals["Fox"] = true;
        validAnimals["Turtle"] = true;
        validStyles["Cartoon"] = true;
        validStyles["Nature"] = true;
        validStyles["Surreal"] = true;
        validStyles["Pokemon"] = true;
        validStyles["Minecraft"] = true;
        validStyles["Retro"] = true;
        validStyles["Cyberpunk"] = true;
    }

    // Automation checks if next update time is needed.
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < totalSupply(); i++) {
            uint256 tokenId = tokenByIndex(i);
            if (block.timestamp >= nextUpdateTime[tokenId] && nextURIIndex[tokenId] < uriBatches[tokenId].length) {
                upkeepNeeded = true;
                performData = abi.encode(tokenId);
                break;
            }
        }
    }

    // Automation changed next Token URI every 6 hours, 4 times a day.
    function performUpkeep(bytes calldata performData) external override {
        uint256 tokenId = abi.decode(performData, (uint256));
        if (tokenExists(tokenId) && nextURIIndex[tokenId] < uriBatches[tokenId].length) {
            updateTokenURI(tokenId);
            nextUpdateTime[tokenId] = block.timestamp + calculateNextUpdateTime(tokenId);
            emit UpkeepPerformed(tokenId, _tokenURIs[tokenId]);
        }
    }

    // VRF random words are used to set random period for NFT Deadline.
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        require(tokenExists(tokenId), "Token does not exist");

        tokenIdToRandomNumbers[tokenId] = randomWords;
        emit RandomnessFulfilled(tokenId, randomWords);
    }

    // Mint first NFT collection for free, and give approve for Operator && Deployer
    // (This was set for show-case only, in production it's better to set only for bot-operator or Chainlink Functions)
    function mint(string memory animal, string memory name, string memory country, string memory style) public {
        require(validAnimals[animal], "This animal is not available for minting.");
        require(validStyles[style], "This style is not available for minting.");
        require(countryTimeZones[country] != 0, "Invalid country");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, tokenId);

        // ONLY FOR SHOW CASE!!!
        _approve(dev1, tokenId, msg.sender);
        _approve(operator, tokenId, msg.sender);

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        weatherTokens[tokenId] = WeatherToken(animal, name, country, style);
        requestIdToTokenId[requestId] = tokenId;
        hasURIBatch[tokenId] = false;
        emit WeatherNFTMinted(msg.sender, tokenId, animal, name, country, style);
        emit RandomnessRequested(tokenId, requestId);
    }

    // Bot-operator set's batch uris for NFT, and calculates next update time.
    // Bot also check's for what country have set in mint.
    function addURIBatch(uint256 tokenId, string[4] memory uris, uint256 burnInSeconds, string memory imageURL) public onlyDev1OrOperator {
        require(tokenExists(tokenId), "Token does not exist");
        require(!hasURIBatch[tokenId], "URI batch already added for this token");
        require(uris.length == 4, "URI array must contain exactly 4 URIs");
        require(!tokenBurnTimes[tokenId].isSet, "Token is burned");

        for(uint i = 0; i < uris.length; i++) {
            require(bytes(uris[i]).length > 0, "URI cannot be empty");
        }

        uriBatches[tokenId] = uris;
        uint256 index = calculateInitialURIIndex(tokenId, countryTimeZones[weatherTokens[tokenId].country]);
        _setTokenURI(tokenId, uriBatches[tokenId][index]);
        nextURIIndex[tokenId] = (index + 1) % uriBatches[tokenId].length;

        nextUpdateTime[tokenId] = block.timestamp + calculateNextUpdateTime(tokenId);
        tokenBurnTimes[tokenId] = TokenBurnData(block.timestamp + burnInSeconds, true);

        hasURIBatch[tokenId] = true;
        emit URIBatchAdded(tokenId, uris, burnInSeconds, imageURL);
    }

    // Bot-operators updates Token URI.
    function updateTokenURI(uint256 tokenId) internal {
        _setTokenURI(tokenId, uriBatches[tokenId][nextURIIndex[tokenId]]);
        nextURIIndex[tokenId] = (nextURIIndex[tokenId] + 1) % uriBatches[tokenId].length;
        nextUpdateTime[tokenId] = block.timestamp + calculateNextUpdateTime(tokenId);
    }

    // Bot-operator calculates next upate time.
    function calculateNextUpdateTime(uint256 tokenId) private view returns (uint256) {
        int8 timeZone = countryTimeZones[weatherTokens[tokenId].country];
        uint256 countryTime = calculateCountryTime(block.timestamp, timeZone);
        uint256 dayStart = countryTime - (countryTime % 1 days);
        uint256[4] memory updateTimes = [
            dayStart + 6 hours,  // 6:00
            dayStart + 12 hours, // 12:00
            dayStart + 18 hours, // 18:00
            dayStart + 23 hours + 59 minutes // 23:59
        ];

        for (uint i = 0; i < 4; i++) {
            if (countryTime < updateTimes[i]) {
                return updateTimes[i] - countryTime;
            }
        }

        return updateTimes[0] + 1 days - countryTime;
    }

    function calculateInitialURIIndex(uint256 tokenId, int8 timeZone) private view returns (uint256) {
        uint256 localTime = calculateLocalTime(block.timestamp, timeZone);
        uint256 timeOfDay = (localTime % 1 days);
        uint256 index = timeOfDay / (6 hours);
        return index % uriBatches[tokenId].length;
    }

    function calculateCountryTime(uint256 timestamp, int8 timeZone) private pure returns (uint256) {
        if (timeZone < 0) {
            uint256 negativeOffset = uint256(int256(timeZone) * -1);
            return timestamp - (negativeOffset * 1 hours);
        } else {
            uint256 positiveOffset = uint256(int256(timeZone));
            return timestamp + (positiveOffset * 1 hours);
        }
    }

    function calculateLocalTime(uint256 timestamp, int8 timeZone) private pure returns (uint256) {
        if (timeZone < 0) {
            uint256 positiveOffset = uint256(int256(-timeZone));
            return timestamp - positiveOffset * 1 hours;
        } else {
            uint256 positiveOffset = uint256(int256(timeZone));
            return timestamp + positiveOffset * 1 hours;
        }
    }

    // Only Bot-operator or Dev, can Burn NFTs.
    function burnToken(uint256 tokenId) public onlyDev1OrOperator {
        require(tokenExists(tokenId), "Token ID does not exist");
        
        address owner = ownerOf(tokenId);

        weatherTokens[tokenId] = WeatherToken("", "", "", "");
        tokenBurnTimes[tokenId] = TokenBurnData(0, false);
        uriBatches[tokenId] = ["", "", "", ""];
        nextURIIndex[tokenId] = 0;
        nextUpdateTime[tokenId] = 0;

        _burn(tokenId);
        IDynamicV2(secondContractAddress).mint(owner);
    }

    // Read function for Bot-operator script.
    // You can see list of holders + nft ids + time left for burn.
    function getAllTokenBurnTimes() public view returns (address[] memory, uint256[] memory, uint256[] memory) {
        uint256 tokenCount = totalSupply();
        uint256 activeTokenCount = 0;

        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (ownerOf(tokenId) != address(0)) {
                activeTokenCount++;
            }
        }

        address[] memory owners = new address[](activeTokenCount);
        uint256[] memory ids = new uint256[](activeTokenCount);
        uint256[] memory burnTimes = new uint256[](activeTokenCount);

        uint256 counter = 0;
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (ownerOf(tokenId) != address(0)) {
                owners[counter] = ownerOf(tokenId);
                ids[counter] = tokenId;
                burnTimes[counter] = tokenBurnTimes[tokenId].burnTime;
                counter++;
            }
        }

        return (owners, ids, burnTimes);
    }

    // Retur Token Uri.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length > 0, "ERC721URIStorage: URI query for nonexistent token");
        return uri;
    }

    // Is owner of the NFT.
    function tokenExists(uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    // Add-on function to add new options for promt.
    function addAnimal(string memory animal) public onlyDev1OrOperator {
        validAnimals[animal] = true;
    }

    function addStyle(string memory style) public onlyDev1OrOperator {
        validStyles[style] = true;
    }

    // Set new Bot-operator.
    function setUpOperator(address _operator) external onlyDev1OrOperator {
        operator = _operator;
    }

    // Set second NFT contract address.
    function setSecondContractAddress(address _secondContract) external onlyDev1OrOperator {
        secondContractAddress = _secondContract;
    }
}