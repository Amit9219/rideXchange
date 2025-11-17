// File: next.config.mjs (Final Corrected Structure)

/** @type {import('next').NextConfig} */
const nextConfig = {

  // Images from Supabase storage
  images: {
    // Simple allow-list for the Supabase image host
    // NOTE: hostname must exactly match the one used in your image URLs.
    domains: ["nontrippjsrdnxthllmv.supabase.co"],
    // Optional: keep remotePatterns for more specific matching
    remotePatterns: [
      {
        protocol: "https",
        // Allow images from Supabase storage bucket used for car images
        hostname: "nontrippjsrdnxthllmv.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // CSP for the embedded waitlist form
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://roadsidecoder.created.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
