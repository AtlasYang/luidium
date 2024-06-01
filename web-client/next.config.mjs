/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-storage.lighterlinks.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
