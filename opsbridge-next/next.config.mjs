/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load Google Fonts via <link> tag in layout.js instead of next/font,
  // avoiding build failures in environments without internet access.
  optimizeFonts: false,
}

export default nextConfig
