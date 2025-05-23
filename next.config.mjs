import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  experimental: {
    reactCompiler: false,
  },
  // Enable static exports for better PWA performance
  // output: 'export', // Uncomment if you want static export

  // Image optimization for PWA
  images: {
    unoptimized: false, // Keep optimization for better performance
    formats: ['image/webp', 'image/avif'],
  },

  // Compression for better performance
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Headers for PWA and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

// Simple PWA Configuration following standards
const withPWA = (await import('next-pwa')).default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

export default withPayload(withPWA(nextConfig), { devBundleServerPackages: false })
