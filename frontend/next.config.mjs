import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  // Views own WebGL contexts and animation loops; a dev-only double mount would create extra contexts.
  reactStrictMode: false,
  // The dev badge sits over the rail's avatar button and trips the overlap tests.
  devIndicators: false,
  async redirects() {
    return [
      { source: '/solutions', destination: '/solutions/energy', permanent: false },
      { source: '/settings', destination: '/settings/profile', permanent: false },
    ];
  },
};

export default nextConfig;
