/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['p1.music.126.net', 'p2.music.126.net', 'p3.music.126.net'],
  },
  // 禁用静态预渲染，减少 build 内存占用
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // 不预渲染，全部 SSR（内存友好）
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig
