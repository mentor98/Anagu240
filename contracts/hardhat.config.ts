import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DEPLOYER_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"; // dev default only

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },

  networks: {
    // Local Hardhat in-process network (for fast unit tests)
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 0,
      },
    },

    // Hyperledger Besu running via Docker Compose
    besu_local: {
      url: process.env.BESU_RPC_URL || "http://localhost:8545",
      chainId: 1337,
      accounts: [DEPLOYER_KEY],
      gas: "auto",
      gasPrice: 0,
      timeout: 60000,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },

  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
