require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.22",
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 8000000000
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  }
};
