/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/documents/:path*\\.pdf",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          { key: "Content-Disposition", value: "inline" },
        ],
      },
    ];
  },
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
