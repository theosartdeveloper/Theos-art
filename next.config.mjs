/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: '/programs', destination: '/learning', permanent: true },
      { source: '/training', destination: '/trainings', permanent: false },
      { source: '/e-learning', destination: '/learning', permanent: false },
      { source: '/art-gallery', destination: '/library', permanent: false },
      { source: '/art-gallery/:path*', destination: '/library/:path*', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
