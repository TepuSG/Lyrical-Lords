/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for custom server deployment
  output: 'standalone',
  
  // Fix the workspace root warning
  outputFileTracingRoot: 'C:\\Users\\sjgal\\Downloads\\School\\CS 2340\\Django Team Project\\nextjs',
  
  // Environment variables for production
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // For Socket.IO compatibility (updated config)
  serverExternalPackages: ['socket.io', 'socket.io-client']
}

module.exports = nextConfig