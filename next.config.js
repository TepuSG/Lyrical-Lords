/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for custom server deployment
  output: 'standalone',
  
  // Fix the workspace root warning
  outputFileTracingRoot: '.',
  
  // Environment variables for production
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // For Socket.IO compatibility
  experimental: {
    serverComponentsExternalPackages: ['socket.io', 'socket.io-client']
  }
}

module.exports = nextConfig