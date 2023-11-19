// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
contract WeatherNFT is AutomationCompatibleInterface, ERC721Enumerable, VRFConsumerBaseV2, ConfirmedOwner {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    event WeatherNFTMinted(address minter, uint256 tokenId, string animal, string name, string country, string style);
    event RandomnessRequested(uint256 tokenId, uint256 requestId);
    event RandomnessFulfilled(uint256 tokenId, uint256[] randomNumbers);
    event URIBatchAdded(uint256 indexed tokenId, string[4] uris);
    event UpkeepPerformed(uint256 tokenId, string newURI);
    event TokenURIUpdated(uint256 tokenId, string newURI);
    event Burned(address operator, uint256 tokenId);
    event TokenShouldBeBurned(uint256 tokenId);

    struct WeatherToken {
        string animal;
        string name;
        string country;
        string style;
    }

    struct RequestStatus {
        bool fulfilled;
        uint256[] randomWords;
    }

    struct TokenTimeData {
        uint256 nextUpdateTime;
        uint256 expirationTime;
        bool burnEventEmitted;
    }

    bool public mintingPaused = false;
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256[]) public tokenIdToRandomNumbers;
    mapping(uint256 => uint256) private requestIdToTokenId;
    mapping(uint256 => RequestStatus) private requestStatuses;
    mapping(uint256 => WeatherToken) public weatherTokens;
    mapping(uint256 => TokenTimeData) private tokenTimes;

    mapping(string => int8) public countryTimeZones;
    mapping(string => bool) private validAnimals;
    mapping(string => bool) private validStyles;
    mapping(uint256 => bool) private burnEventEmitted;

    mapping(uint256 => string[4]) private uriBatches;
    mapping(uint256 => uint256) private nextURIIndex;
    mapping(uint256 => uint256) private nextUpdateTime;
    mapping(uint256 => uint256) public expirationTimes;

    address public dev1;
    address public operator;
    VRFCoordinatorV2Interface COORDINATOR;

    address linkTokenAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint64 s_subscriptionId;
    uint32 numWords = 2;

    modifier onlyDev1() {
        require(msg.sender == dev1, "Caller is not dev1");
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

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
        dev1 = msg.sender;
        operator = 0x5F82dE5FCf2EacD3dD3F45ec671B4870ebb60954; // Bot-operator address
        s_subscriptionId = 6385;
         _tokenIdCounter.increment(); // Set NFT ID to 1
        countryTimeZones["Estonia"] = 2;
        countryTimeZones["Spain"] = 1;
        countryTimeZones["Poland"] = 1;
        countryTimeZones["USA"] = -5;
        countryTimeZones["Japan"] = 9;
        validAnimals["Cat"] = true;
        validAnimals["Dog"] = true;
        validAnimals["Horse"] = true;
        validAnimals["Fox"] = true;
        validAnimals["Turtle"] = true;
        validStyles["Cartoon"] = true;
        validStyles["Free"] = true;
        validStyles["Minecraft"] = true;
        validStyles["Retro"] = true;
        validStyles["Cyberpunk"] = true;
    }

    function mint(string memory animal, string memory name, string memory country, string memory style) public whenNotPaused {
        require(validAnimals[animal], "This animal is not available for minting.");
        require(validStyles[style], "This style is not available for minting.");
        require(countryTimeZones[country] != 0, "Invalid country");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);

        _approve(dev1, tokenId); // remove, that only operator will be approved for Burning NFTs
        _approve(operator, tokenId);

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        weatherTokens[tokenId] = WeatherToken(animal, name, country, style);
        requestIdToTokenId[requestId] = tokenId;
        emit WeatherNFTMinted(msg.sender, tokenId, animal, name, country, style);
        emit RandomnessRequested(tokenId, requestId);
    }

    function burn(uint256 tokenId) public {
        require(msg.sender == dev1 || msg.sender == operator, "Caller is not authorized"); // remove, that only operator will be approved for Burning NFTs
        require(_exists(tokenId), "ERC721: burn of nonexistent token");

        delete weatherTokens[tokenId];
        delete uriBatches[tokenId];
        delete expirationTimes[tokenId];
        _burn(tokenId);
        emit Burned(msg.sender, tokenId);
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory tokensToUpdate = new uint256[](totalSupply());
        uint256 counter = 0;
        for (uint256 i = 1; i <= totalSupply(); i++) {
            if (block.timestamp >= tokenTimes[i].nextUpdateTime) {
                tokensToUpdate[counter] = i;
                counter++;
            } else if (block.timestamp >= tokenTimes[i].expirationTime && !tokenTimes[i].burnEventEmitted) {
                tokensToUpdate[counter] = i;
                counter++;
            }
        }
        if (counter > 0) {
            upkeepNeeded = true;
            performData = abi.encode(tokensToUpdate);
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory tokensToUpdate = abi.decode(performData, (uint256[]));
        for (uint256 i = 0; i < tokensToUpdate.length; i++) {
            uint256 tokenId = tokensToUpdate[i];

            if (block.timestamp >= tokenTimes[tokenId].nextUpdateTime) {
                updateTokenURI(tokenId);
            }

            if (block.timestamp >= tokenTimes[tokenId].expirationTime && !tokenTimes[tokenId].burnEventEmitted) {
                emitBurnEvent(tokenId);
            }
        }
    }

    function emitBurnEvent(uint256 tokenId) internal {
        burnEventEmitted[tokenId] = true;
        emit TokenShouldBeBurned(tokenId);
    }

    function updateTokenURI(uint256 tokenId) internal {
        if (nextURIIndex[tokenId] < uriBatches[tokenId].length) {
            setTokenURI(tokenId, uriBatches[tokenId][nextURIIndex[tokenId]]);
            nextURIIndex[tokenId] = (nextURIIndex[tokenId] + 1) % uriBatches[tokenId].length;

            int8 timeZone = countryTimeZones[weatherTokens[tokenId].country];
            nextUpdateTime[tokenId] = block.timestamp + calculateNextUpdateTime(timeZone);
        }
    }

    function calculateNextUpdateTime(int8 timeZone) private view returns (uint256) {
        uint256 adjustedTime;
        if (timeZone < 0) {
            uint256 positiveOffset = uint256(int256(timeZone) * -1);
            adjustedTime = block.timestamp - positiveOffset * 1 hours;
        } else {
            uint256 positiveOffset = uint256(int256(timeZone));
            adjustedTime = block.timestamp + positiveOffset * 1 hours;
        }

        uint256 dayStart = adjustedTime - (adjustedTime % 1 days);
        uint256[4] memory updateTimes = [dayStart + 6 hours, dayStart + 12 hours, dayStart + 18 hours, dayStart + 24 hours];

        for (uint i = 0; i < 4; i++) {
            if (updateTimes[i] > adjustedTime) {
                return updateTimes[i] - block.timestamp;
            }
        }

        return updateTimes[0] + 1 days - block.timestamp;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        
        requestStatuses[requestId] = RequestStatus({
            fulfilled: true,
            randomWords: randomWords
        });

        tokenIdToRandomNumbers[tokenId] = randomWords;
        emit RandomnessFulfilled(tokenId, randomWords);

        uint256 expirationPeriod = 5 minutes + (randomWords[0] + randomWords[1]) % 5 minutes;
        tokenTimes[tokenId].expirationTime = block.timestamp + expirationPeriod;
        expirationTimes[tokenId] = tokenTimes[tokenId].expirationTime;
    }

    function toggleMintingPause() public onlyDev1 {
        mintingPaused = !mintingPaused;
    }

    function addURIBatch(uint256 tokenId, string[4] memory uris) public {
        require(msg.sender == dev1 || msg.sender == operator, "Caller is not authorized");
        require(tokenExists(tokenId), "Token ID does not exist");
        uriBatches[tokenId] = uris;
        int8 timeZone = countryTimeZones[weatherTokens[tokenId].country];
        uint256 index = calculateInitialURIIndex(timeZone);
        setTokenURI(tokenId, uriBatches[tokenId][index]);
        nextURIIndex[tokenId] = (index + 1) % uriBatches[tokenId].length;
        nextUpdateTime[tokenId] = block.timestamp + calculateNextUpdateTime(timeZone);
        emit URIBatchAdded(tokenId, uris);
    }

    function calculateInitialURIIndex(int8 timeZone) private view returns (uint256) {
        uint256 localTime = calculateLocalTime(block.timestamp, timeZone);
        uint256 timeOfDay = localTime % 1 days;

        if (timeOfDay < 6 hours) {
            return 3;
        } else if (timeOfDay < 12 hours) {
            return 0;
        } else if (timeOfDay < 18 hours) {
            return 1;
        } else {
            return 2;
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

    function tokenExists(uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length > 0, "ERC721URIStorage: URI query for nonexistent token");
        return uri;
    }

    function addAnimal(string memory animal) public onlyDev1 {
        validAnimals[animal] = true;
    }

    function addStyle(string memory style) public onlyDev1 {
        validStyles[style] = true;
    }

    function setTokenURI(uint256 tokenId, string memory uri) public {
        require(msg.sender == dev1 || msg.sender == operator, "Caller is not authorized");
        require(_exists(tokenId), "ERC721: URI set of nonexistent token");

        _tokenURIs[tokenId] = uri;
    }

    function transferFromOverride(address from, address to, uint256 tokenId) public {
        require(msg.sender == dev1 || msg.sender == operator, "Caller is not authorized");
        require(_exists(tokenId), "ERC721: transfer of nonexistent token");

        _transfer(from, to, tokenId);
    }

    function setUpOperator(address _operator) external onlyDev1 {
        operator = _operator;
    }
}