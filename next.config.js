/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_SITE_URL: process.env.NEXT_SITE_URL,
        NEXT_GET_USER_URL: process.env.NEXT_GET_USER_URL,
        NEXT_EDIT_USER_URL: process.env.NEXT_EDIT_USER_URL,
        NEXT_DELETE_USER_URL: process.env.NEXT_DELETE_USER_URL,
        NEXT_LOGIN_USER_URL: process.env.NEXT_LOGIN_USER_URL,
        NEXT_REGISTER_USER_URL: process.env.NEXT_REGISTER_USER_URL,
        NEXT_ADD_LINKED_ACCOUNT_URL: process.env.NEXT_ADD_LINKED_ACCOUNT_URL,
        NEXT_DELETE_LINKED_ACCOUNT_URL: process.env.NEXT_DELETE_LINKED_ACCOUNT_URL,
        CI: false
    },
}

module.exports = nextConfig
