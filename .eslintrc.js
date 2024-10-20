module.exports = {
  extends: ["@cruk", "next/core-web-vitals"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    // It's ok to have dev dependencies imported for test files
  },
  ignorePatterns: ["*.config.js", "node_modules"],
};
