/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/products/pac-clad-panels",
        destination: "/consultation",
        permanent: true,
      },
      {
        source: "/products/pac-clad-panels/consultation",
        destination: "/consultation",
        permanent: true,
      },
      {
        source: "/products/pac-clad-panels/estimate",
        destination: "/consultation",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
