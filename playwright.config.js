export default {
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:8080",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npm run serve",
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
};

