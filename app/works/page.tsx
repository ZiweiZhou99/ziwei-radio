'use client'
import { useEffect, useState } from 'react'

interface Work {
  id: string
  title: string
  description: string
  url?: string
  github?: string
  tags: string[]
  date: string
}

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([])

  useEffect(() => {
    fetch('/api/works').then(r => r.json()).then(d => setWorks(d.works || []))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-mono font-bold text-white mb-2">works</h1>
      <p className="text-radio-muted font-mono text-sm mb-10">vibe coding experiments</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {works.map(work => (
          <a
            key={work.id}
            href={work.url || '#'}
            target={work.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="block border border-radio-border rounded-lg p-5 transition-all duration-200 group cursor-pointer hover:border-radio-purple/50"
            style={{ textDecoration: 'none' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = '0 0 20px #7B68EE22'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = ''
              el.style.transform = ''
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-mono text-white group-hover:text-radio-purple transition-colors">
                {work.title}
              </h2>
              <span className="font-mono text-xs text-radio-muted ml-2 shrink-0">{work.date}</span>
            </div>
            <p className="text-radio-muted text-sm mb-4 leading-relaxed">{work.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {work.tags.map(tag => (
                <span key={tag} className="font-mono text-xs px-2 py-0.5 rounded bg-radio-surface text-radio-purple border border-radio-purple/20">
                  {tag}
                </span>
              ))}
            </div>
            {work.url && (
              <div className="flex justify-end">
                <span className="font-mono text-xs text-radio-purple opacity-0 group-hover:opacity-100 transition-opacity">
                  打开 ↗
                </span>
              </div>
            )}
          </a>
        ))}
        {works.length === 0 && (
          <p className="text-radio-muted font-mono text-sm">加载中...</p>
        )}
      </div>
    </div>
  )
}
