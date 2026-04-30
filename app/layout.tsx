import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'ziwei.online',
  description: '周子威的个人空间',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="bg-radio-bg text-radio-text min-h-screen antialiased font-mono">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
