/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_GET_USER_URL: process.env.NEXT_GET_USER_URL,
        NEXT_USER_LOGIN_URL: process.env.NEXT_USER_LOGIN_URL,
        CI: false
    },
}

module.exports = nextConfig
