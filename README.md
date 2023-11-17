## Hackathon:

```bash
Wallet1: ...
Wallet2: ...
Wallet3: ...

TeamMember1: @RuffBuff
TeamMember2: @yatadcd

Email1: ...
Email2: ...
```

## How to start:

```bash
mkdir clone
cd clone
git clone https://github.com/RuffBuff/weather_test_DNFT-ERC-721.git
cd weather_test_DNFT-ERC-721
npm install
```

## To open frontend:

```bash
cd frontend
npm start
```

## To open backend:

```bash
cd backend
npx hardhat compile
npx hardhat test (not ready)
npx hardhat run scripts/deploy.js --network "network-name-here"
npx hardhat verify --network "network-name-here" "constructor variables if they are "exist"
```