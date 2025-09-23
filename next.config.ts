import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Environment variables are automatically loaded from .env.local
  // No need to manually specify them in next.config.js
  
  // Enable server components
  serverExternalPackages: ['@react-google-maps/api', 'react-google-maps'],
  
  // Configure image domains
  images: {
    domains: [
      'images.unsplash.com',
      'maps.googleapis.com',
      'maps.gstatic.com',
      'lh3.googleusercontent.com',
      'maps.google.com',
      'csi.gstatic.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enable CORS for Google Maps API
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
