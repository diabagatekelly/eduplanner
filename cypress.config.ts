import { defineConfig } from 'cypress'

const local = 'http://localhost:8080'
const prod = 'https://eduplanner-backend-7fdf262835f2.herokuapp.com'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      config.env.REGISTER_USER_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/register`
          : `${local}/user/register`
      config.env.LOGIN_USER_URL =
        process.env.CYPRESS_ENV !== 'development' ? `${prod}/user/login` : `${local}/user/login`
      config.env.ADD_ACTIVITY_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/activities/add`
          : `${local}/user/activities/add`
      config.env.SITE_URL = 'https://eduplanner-jade.vercel.app'

      return config
    },
  },
})
