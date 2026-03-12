import { defineConfig } from 'cypress'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const local = 'http://localhost:8080'
const prod = 'https://eduplanner-backend-7fdf262835f2.herokuapp.com'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    pageLoadTimeout: 120000,
    setupNodeEvents(on, config) {
      on('task', {
        async 'auth:createSession'(params) {
          const { userId, username } = params
          const { encode } = await import('next-auth/jwt')
          return encode({
            token: { userId, username, accessToken: 'mock-access-token' },
            secret: process.env.AUTH_SECRET ?? 'test-secret',
            salt: 'authjs.session-token',
          })
        },
      })
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
      config.env.DELETE_ACTIVITY_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/activities/delete`
          : `${local}/user/activities/delete`
      config.env.EDIT_ACTIVITY_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/activities/edit`
          : `${local}/user/activities/edit`
      config.env.CREATE_CARD_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/add`
          : `${local}/user/cards/add`
      config.env.ACTIVATE_CARD_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/activate`
          : `${local}/user/cards/activate`
      config.env.DELETE_CARD_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/delete`
          : `${local}/user/cards/delete`
      config.env.EDIT_USER_URL =
        process.env.CYPRESS_ENV !== 'development' ? `${prod}/user/edit` : `${local}/user/edit`
      config.env.GET_USER_URL =
        process.env.CYPRESS_ENV !== 'development' ? `${prod}/user` : `${local}/user`
      config.env.LINK_ACCOUNT_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/linked-accounts/add`
          : `${local}/user/linked-accounts/add`
      config.env.UNLINK_ACCOUNT_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/linked-accounts/delete`
          : `${local}/user/linked-accounts/delete`
      config.env.DELETE_USER_URL =
        process.env.CYPRESS_ENV !== 'development' ? `${prod}/user/delete` : `${local}/user/delete`
      config.env.EDIT_CARD_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/edit`
          : `${local}/user/cards/edit`
      config.env.EDIT_CARD_STAGE_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/edit-stage`
          : `${local}/user/cards/edit-stage`
      config.env.RESET_CARD_STAGE_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/reset-stage`
          : `${local}/user/cards/reset-stage`
      config.env.REQUEST_REVIEW_URL =
        process.env.CYPRESS_ENV !== 'development'
          ? `${prod}/user/cards/request-review`
          : `${local}/user/cards/request-review`
      config.env.SITE_URL = 'https://eduplanner-jade.vercel.app'

      return config
    },
  },
})
