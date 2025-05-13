/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep output: "export" for static exports used by Electron
  output: "export",
  
  // Disable image optimization since we're using static files in Electron
  images: {
    unoptimized: true,
  },
  
  // Disable treating /pages/api as API Routes
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

module.exports = nextConfig;
