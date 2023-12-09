# Constellation: A Chainlink Hackathon, "DynamicAi" NFTs
Project was created by: "@Ambientiumim" && "@RuffBuff",
Idea is about Burnable-Dynamic NFT postcard/mail, or a NFTs for web3 game like: DND, Magic: The Gathering Arena and other cool similar games, where you are able to use items or stuff, playing with character design or/and collect rare game collectibles.
> Demo Dapp: https://dynamic-ai.vercel.app/
>
> Demo Tutorial/Guid: https://vimeo.com/892814613?share=copy
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/Why.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/Start.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/Mid.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/End.jpg)

![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/hackathonn5.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/hackathonn4.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/hackathonn3.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/hackathonn2.jpg)
![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/hackathonn.jpg)
```bash
R: @RuffBuff
A: @Ambientiumim

R: ruffgreenw@gmai.com 
A: yatadcd@gmail.com

R: 0x5CEe0e6D261dA886aa4F02FB47f45E1E9fa4991b
A: 0x5F82dE5FCf2EacD3dD3F45ec671B4870ebb60954
```

## Demo:
- [VRF subscription](https://vrf.chain.link/mumbai/6385) :game_die:
- [Automation](https://automation.chain.link/mumbai/23104568745556896409274835808211757805780096452881858554117652458904576237493) :joystick:
- [Data Feeds: BTC/USD, Mumbai Polygon](https://mumbai.polygonscan.com/address/0x007A22900a3B98143368Bd5906f8E17e9867581b) :chart:
- [DynamicAi First NFT Collection](https://mumbai.polygonscan.com/address/0xc1ba35D68B3B951FFaDbC264041A0868B70B01c0) :art:
- [DynamicAi Final NFT Collection](https://mumbai.polygonscan.com/address/0x71708CFC7c8dBcDeaC10043C9e50Bf7d22222037) :framed_picture:
- [Demo Vercel Dapp](https://dynamic-ai.vercel.app/) :tada:

## Supported by:
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [Chakra-Ui](https://chakra-ui.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Web3 js](https://web3js.readthedocs.io/en/v1.10.0/)
- [Web3 py](https://web3py.readthedocs.io/en/stable/)
- [Ethers](https://docs.ethers.org/v6/)
- [Hardhat](https://hardhat.org/)
- [Docker](https://www.docker.com/)
- [Vercel](https://vercel.com/)
- [Thirdweb](https://thirdweb.com/)
- [IPFS](https://ipfs.tech/)
- [Openzeppelin](https://www.openzeppelin.com/)
- [OpenAi](https://openai.com/)
- [Chainlink Hackathon](https://chain.link/hackathon?utm_medium=referral&utm_source=chainlink&utm_campaign=constellation-hackathon&agid=0s477xp3xv6v)

## How to start:
```bash
mkdir clone
cd clone
git clone https://github.com/RuffBuff/weather_test_DNFT-ERC-721.git
cd weather_test_DNFT-ERC-721
```

## To open frontend:
```bash
cd frontend
npm install
npm start
or
npm build
and then start
```

## DynNFT BOT you can run dynnft_bot.py  or docker image for it:
At first please fill `.env` file at `backend/docker/...`
```bash
cd backend
cd docker

docker pull ambientiumim/dynnft:3

docker run -it -d \
    -v ${PWD}:/usr/src/app \
    --restart=always \
    --name dynnft \
    ambientiumim/dynnft:3

Or just use 'make' 

for start :
make start

for stop :
make stop

for log :
make log
```
image python = 3.11.6 with python-dotenv, Web3 , openai==0.28

## NOTE!
Here we use approve for Deployer and Bot-operator when we mint NFT.
DON'T DO THAT IN PRODUCTION! APPROVING NFTS TO OWNERS/ELSE IS BAD!
DEVELOP PROPER LOGIC AND IDEA FOR PRODUCTION!
```solidity
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
```
Here we are using the Chainlink VRF random numbers, and from two numbers we make random period for Deadline:
```solidity
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        require(tokenExists(tokenId), "Token does not exist");

        tokenIdToRandomNumbers[tokenId] = randomWords;
        emit RandomnessFulfilled(tokenId, randomWords);
    }
```
Here we are using Chainlink Automation, to automate the process of the Token Uri sweep.
NFT Uris are switching every 6 hours, 4 times a day.
```solidity
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

    function performUpkeep(bytes calldata performData) external override {
        uint256 tokenId = abi.decode(performData, (uint256));
        if (tokenExists(tokenId) && nextURIIndex[tokenId] < uriBatches[tokenId].length) {
            updateTokenURI(tokenId);
            nextUpdateTime[tokenId] = block.timestamp + calculateNextUpdateTime(tokenId);
            emit UpkeepPerformed(tokenId, _tokenURIs[tokenId]);
        }
    }
```
Here we are using Chainlink Data Feeds, the get the actual price of BTC/USD, and set one from 2 Base URIs.
```solidity
    function getLatestPrice() public view returns (int256) {
        (,int256 price,,,) = priceFeed.latestRoundData();
        return price;
    }
```

## To open backend:
```bash
cd backend
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network "network-name-here"
npx hardhat verify --network "network-name-here" "constructor variables if they are "exist"
```

![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/images/log.png)
Image was generatd by: Dall-E
