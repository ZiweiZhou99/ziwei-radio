import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'content', 'blog', `${params.slug}.md`)
  if (!fs.existsSync(filePath)) notFound()

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content, data } = matter(raw)
  const html = await marked(content)

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="mb-10">
        <h1 className="text-3xl font-mono font-bold text-white mb-2">{data.title}</h1>
        <span className="font-mono text-xs text-radio-muted">{data.date ? String(data.date) : ''}</span>
      </div>
      <article
        className="prose prose-invert prose-sm max-w-none
          prose-headings:font-mono prose-headings:text-white
          prose-p:text-radio-text prose-p:leading-relaxed
          prose-a:text-radio-purple prose-code:text-radio-purple
          prose-code:bg-radio-surface prose-code:px-1 prose-code:rounded"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
