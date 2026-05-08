export const dynamic = 'force-dynamic'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'

export default function BlogPage() {
  const blogDir = path.join(process.cwd(), 'content', 'blog')
  const files = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter(f => f.endsWith('.md')) : []

  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
    const { data } = matter(raw)
    return {
      slug: file.replace('.md', ''),
      title: data.title || file,
      date: data.date ? String(data.date) : '',
      description: data.description || '',
    }
  }).sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-mono font-bold text-white mb-10">blog</h1>
      <div className="space-y-8">
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <div className="border border-radio-border rounded-lg p-5 hover:border-radio-purple/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-mono text-white group-hover:text-radio-purple transition-colors">
                  {post.title}
                </h2>
                <span className="font-mono text-xs text-radio-muted">{post.date}</span>
              </div>
              {post.description && (
                <p className="text-radio-muted text-sm">{post.description}</p>
              )}
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-radio-muted font-mono text-sm">还没有文章</p>
        )}
      </div>
    </div>
  )
}
