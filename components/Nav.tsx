'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'home' },
  { href: '/blog', label: 'blog' },
  { href: '/works', label: 'works' },
  { href: '/radio', label: '📻 radio' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-radio-border bg-radio-bg/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        <span className="font-mono text-sm text-radio-muted">ziwei.online</span>
        <div className="flex gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-mono text-sm transition-colors ${
                pathname === href
                  ? 'text-radio-purple'
                  : 'text-radio-muted hover:text-radio-text'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
