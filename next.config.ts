import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Environment variables are automatically loaded from .env.local
  // No need to manually specify them in next.config.js
  
  // Enable server components
  serverExternalPackages: ['@react-google-maps/api', 'react-google-maps'],
  
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.google.com',
      },
      {
        protocol: 'https',
        hostname: 'csi.gstatic.com',
      },
    ],
  },
  
  // Note: CORS headers are handled by Vercel's built-in configuration
  // Removing custom CORS headers to avoid conflicts with Vercel deployment
};

export default nextConfig;
