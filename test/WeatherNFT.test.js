const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WeatherNFT Contract", function () {
  let WeatherNFT;
  let weatherNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    WeatherNFT = await ethers.getContractFactory("WeatherNFT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    weatherNFT = await WeatherNFT.deploy("WeatherNFT", "WTNFT");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await weatherNFT.dev1()).to.equal(owner.address);
    });

    it("Should mint a new token and assign it to owner", async function () {
      await expect(weatherNFT.connect(owner).mint("Sunny", 0, "Spain")) // Using enum index for style
        .to.emit(weatherNFT, 'WeatherNFTMinted')
        .withArgs(owner.address, 1, "Sunny", 0, "Spain"); // Check the correct event and args

      expect(await weatherNFT.ownerOf(1)).to.equal(owner.address);
    });

    it("Should have the correct time zones for initialized countries", async function () {
      expect(await weatherNFT.countryTimeZones("Spain")).to.equal(1);
      expect(await weatherNFT.countryTimeZones("Poland")).to.equal(1);
    });
  });

  describe("Transactions", function () {
    beforeEach(async function () {
      await weatherNFT.connect(owner).mint("Sunny", 0, "Spain");
    });

    it("Should transfer tokens between accounts", async function () {
      await weatherNFT.connect(owner).transferFrom(owner.address, addr1.address, 1);
      expect(await weatherNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should fail if minting is paused", async function () {
      await weatherNFT.connect(owner).toggleMintingPause();
      await expect(weatherNFT.connect(addr1).mint("Rainy", 1, "Poland")).to.be.revertedWith("Minting is paused");
    });

    it("Should fail if an invalid country is provided", async function () {
      await expect(weatherNFT.connect(addr1).mint("Rainy", 1, "Atlantis")).to.be.revertedWith("Invalid country");
    });
  });

});
