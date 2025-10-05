/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DUB_API_KEY: process.env.NEXT_PUBLIC_DUB_API_KEY || '',
  },
  // Vercel deployment optimizations
  images: {
    domains: ['localhost'],
  },
  // Enable static exports if needed for Vercel
  // output: 'export',
  // trailingSlash: true,
}

module.exports = nextConfig