/** @type {import('next').NextConfig} */
const nextConfig = {
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      child_process: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

module.exports = nextConfig;
