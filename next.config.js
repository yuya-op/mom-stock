/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  // 問題のあるディレクトリを除外
  experimental: {
    outputFileTracingExcludes: {
      "*": ["supabase/**", "**/*.sql", "scripts/**", "sql/**"],
    },
  },
}

module.exports = nextConfig
