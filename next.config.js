/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'localhost',
            'nyc.cloud.appwrite.io',
            'loremflickr.com',
            'www.svgrepo.com',
        ],
    },
}

module.exports = nextConfig
