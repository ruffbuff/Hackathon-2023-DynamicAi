# Chainlink Hackathon
## Dynamic WeatherAi NFT Collection

```bash
Wallet1: 0x5CEe0e6D261dA886aa4F02FB47f45E1E9fa4991b
Wallet2: 0x5F82dE5FCf2EacD3dD3F45ec671B4870ebb60954

TeamMember1: @RuffBuff
TeamMember2: @Ambientiumim

Email1: ruffgreenw@gmai.com 
Email2: yatadcd@gmail.com
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
```

## To open backend:

```bash
cd backend
npm install
npx hardhat compile
npx hardhat test (not ready)
npx hardhat run scripts/deploy.js --network "network-name-here"
npx hardhat verify --network "network-name-here" "constructor variables if they are "exist"
```