import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.jest.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!react-native" +
      "|react-native-toast-message" + 
      ")"
  ],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/index.ts"],
};

export default config;

