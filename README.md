# Constellation: A Chainlink Hackathon, "DynamicAi" NFTs
Project was created by: "@Ambientiumim" && "@RuffBuff",
Idea is about Burnable-Dynamic NFT postcard/mail, or a NFTs for web3 game like: DND, Magic: The Gathering Arena and other cool similar games, where you are able to use items or stuff, playing with character design or/and collect rare game collectibles.

```bash
R: @RuffBuff
A: @Ambientiumim

R: ruffgreenw@gmai.com 
A: yatadcd@gmail.com

R: 0x5CEe0e6D261dA886aa4F02FB47f45E1E9fa4991b
A: 0x5F82dE5FCf2EacD3dD3F45ec671B4870ebb60954
```

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

## To open Dockerfile:
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

and etc.
```
image python = 3.11.6 with python-dotenv, Web3 , openai==0.28

## To open backend:
```bash
cd backend
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network "network-name-here"
npx hardhat verify --network "network-name-here" "constructor variables if they are "exist"
```

![ProjectLogo](https://github.com/ruffbuff/weather_test_DNFT-ERC-721/blob/main/frontend/src/log.png)
Image was generatd by: Dall-E