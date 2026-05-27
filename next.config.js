/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        // Supabase Storage — reemplazá con tu project ref
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
