import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    DEV: {
      LOGIN_USER_URL: "http://localhost:8080/user/login",
      REGISTER_USER_URL: "http://localhost:8080/user/register",
    },
    PROD: {
      LOGIN_USER_URL: "https://eduplanner-backend-7fdf262835f2.herokuapp.com/user/login",
      REGISTER_USER_URL: "https://eduplanner-backend-7fdf262835f2.herokuapp.com/user/register",
      SITE_URL: "https://eduplanner-jade.vercel.app"
    }
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      
    },
  },
});
