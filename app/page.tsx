'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const TYPING_NAME = '周子威'
const TYPING_SUB = 'Product Manager · Vibe Coder · Music Lover'

const NOW_CARDS = [
  {
    icon: '📱',
    title: '学练机产品',
    desc: '学练机 S6 / S2 / S1 / E1 等机型的产品规划与版本迭代',
    tag: 'active',
  },
  {
    icon: '🎯',
    title: '功能设计',
    desc: '精准学、单元真题测、掌握度等核心功能模块的体验设计',
    tag: 'active',
  },
  {
    icon: '⚡',
    title: 'Vibe Coding',
    desc: '用 AI 辅助开发小实验，感受人机协作的边界在哪里',
    tag: 'active',
  },
]

function useTypewriter(text: string, delay = 80, startDelay = 0) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) {
          clearInterval(timer)
          setDone(true)
        }
      }, delay)
      return () => clearInterval(timer)
    }, startDelay)
    return () => clearTimeout(start)
  }, [text, delay, startDelay])
  return { displayed, done }
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function HexGeo() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes spin-rev  { to { transform: rotate(-360deg); } }
        @keyframes pulse-dot { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @keyframes float-geo { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .hex-outer { animation: spin-slow 18s linear infinite; }
        .hex-mid   { animation: spin-rev 10s linear infinite; }
        .hex-inner { animation: spin-slow 6s linear infinite; }
        .geo-float { animation: float-geo 4s ease-in-out infinite; }
        .dot-pulse { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style>
      <div className="geo-float absolute inset-0 flex items-center justify-center">
        {/* Outer hex */}
        <div className="hex-outer absolute w-56 h-56 md:w-72 md:h-72">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
            <polygon points="50,2 93,26 93,74 50,98 7,74 7,26"
              fill="none" stroke="#7B68EE" strokeWidth="0.8"/>
          </svg>
        </div>
        {/* Mid hex */}
        <div className="hex-mid absolute w-40 h-40 md:w-52 md:h-52">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
            <polygon points="50,2 93,26 93,74 50,98 7,74 7,26"
              fill="none" stroke="#9370DB" strokeWidth="1"/>
          </svg>
        </div>
        {/* Inner hex */}
        <div className="hex-inner absolute w-24 h-24 md:w-32 md:h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
            <polygon points="50,2 93,26 93,74 50,98 7,74 7,26"
              fill="none" stroke="#4169E1" strokeWidth="1.5"/>
          </svg>
        </div>
        {/* Center dot */}
        <div className="w-3 h-3 rounded-full bg-radio-purple dot-pulse" />
        {/* Orbit dots */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const r = 80
          const x = 50 + r * Math.cos(angle)
          const y = 50 + r * Math.sin(angle)
          return (
            <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-radio-violet dot-pulse"
              style={{
                left: `${x}%`, top: `${y}%`,
                transform: 'translate(-50%,-50%)',
                animationDelay: `${i * 0.3}s`,
              }} />
          )
        })}
      </div>
      {/* Glow */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, #7B68EE18 0%, transparent 70%)' }} />
    </div>
  )
}

function ScrollArrow() {
  return (
    <div className="flex flex-col items-center gap-1 opacity-40">
      <style>{`
        @keyframes bounce-arrow { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(6px);opacity:.9} }
        .arrow-bounce { animation: bounce-arrow 1.6s ease-in-out infinite; }
      `}</style>
      <span className="font-mono text-xs text-radio-muted">scroll</span>
      <div className="arrow-bounce text-radio-purple text-lg">↓</div>
    </div>
  )
}

function NowCard({ card, index }: { card: typeof NOW_CARDS[0]; index: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref}
      className="group border border-radio-border rounded-xl p-6 transition-all duration-500 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${index * 120}ms`,
        background: 'rgba(17,17,17,0.8)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px #7B68EE33, 0 0 60px #7B68EE11'
        ;(e.currentTarget as HTMLElement).style.borderColor = '#7B68EE66'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = ''
        ;(e.currentTarget as HTMLElement).style.borderColor = ''
        ;(e.currentTarget as HTMLElement).style.transform = visible ? 'translateY(0)' : 'translateY(24px)'
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{card.icon}</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-radio-green"
            style={{ boxShadow: '0 0 6px #00ff88', animation: 'pulse 2s infinite' }} />
          <span className="font-mono text-xs text-radio-green">active</span>
        </div>
      </div>
      <h3 className="font-mono text-white font-semibold mb-2 group-hover:text-radio-purple transition-colors">
        {card.title}
      </h3>
      <p className="text-radio-muted text-sm leading-relaxed">{card.desc}</p>
    </div>
  )
}

export default function HomePage() {
  const { displayed: nameText, done: nameDone } = useTypewriter(TYPING_NAME, 120, 300)
  const { displayed: subText } = useTypewriter(TYPING_SUB, 40, nameDone ? 200 : 9999)
  const [copied, setCopied] = useState(false)
  const aboutReveal = useScrollReveal()
  const nowReveal = useScrollReveal()
  const contactReveal = useScrollReveal()

  const copyWeChat = () => {
    navigator.clipboard.writeText('ZW-ZWZWZWZW')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @keyframes grid-fade { from{opacity:0} to{opacity:1} }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor { display:inline-block; width:3px; height:1em; background:#7B68EE; margin-left:4px; vertical-align:middle; animation: cursor-blink 1s infinite; }
        .bg-grid {
          background-image:
            linear-gradient(rgba(123,104,238,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(123,104,238,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        @keyframes glow-line { 0%,100%{opacity:.3;width:0} 50%{opacity:1;width:100%} }
        .contact-btn {
          position:relative; overflow:hidden;
          transition: all 0.3s ease;
        }
        .contact-btn::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg, transparent, rgba(123,104,238,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .contact-btn:hover::before { transform: translateX(100%); }
        .contact-btn:hover {
          border-color: #7B68EEaa;
          box-shadow: 0 0 20px #7B68EE22;
        }
      `}</style>

      <div className="min-h-screen bg-radio-bg bg-grid">

        {/* Hero */}
        <section className="min-h-screen flex items-center pt-12 px-6 md:px-16 relative">
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="mb-2">
                <span className="font-mono text-xs text-radio-purple tracking-widest">// HELLO WORLD</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-mono font-bold text-white mb-4 leading-none"
                style={{ textShadow: '0 0 40px #7B68EE44' }}>
                {nameText}
                {!nameDone && <span className="cursor" />}
              </h1>
              <p className="font-mono text-radio-muted text-base md:text-lg mb-8 min-h-[1.5em]">
                {subText}
                {nameDone && subText.length < TYPING_SUB.length && <span className="cursor" />}
              </p>
              <div className="flex gap-4">
                <Link href="/radio"
                  className="font-mono text-sm px-5 py-2.5 rounded-lg border border-radio-purple text-radio-purple hover:bg-radio-purple hover:text-white transition-all duration-300"
                  style={{ boxShadow: '0 0 20px #7B68EE22' }}>
                  📻 打开电台
                </Link>
                <Link href="/works"
                  className="font-mono text-sm px-5 py-2.5 rounded-lg border border-radio-border text-radio-muted hover:border-radio-purple hover:text-radio-purple transition-all duration-300">
                  查看作品 →
                </Link>
              </div>
            </div>
            {/* Right */}
            <div className="flex justify-center md:justify-end">
              <HexGeo />
            </div>
          </div>
          {/* Scroll hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <ScrollArrow />
          </div>
        </section>

        {/* About */}
        <section className="px-6 md:px-16 py-24">
          <div ref={aboutReveal.ref} className="max-w-3xl mx-auto"
            style={{
              opacity: aboutReveal.visible ? 1 : 0,
              transform: aboutReveal.visible ? 'translateY(0)' : 'translateY(32px)',
              transition: 'all 0.7s ease',
            }}>
            <div className="flex items-center gap-3 mb-10">
              <span className="font-mono text-xs text-radio-purple tracking-widest">// ABOUT</span>
              <div className="flex-1 h-px bg-gradient-to-r from-radio-purple/40 to-transparent" />
            </div>

            <div className="flex gap-8 md:gap-12">
              {/* Timeline line */}
              <div className="flex flex-col items-center pt-1 gap-0 shrink-0">
                <div className="w-3 h-3 rounded-full bg-radio-purple shrink-0"
                  style={{ boxShadow: '0 0 12px #7B68EE' }} />
                <div className="w-px flex-1 bg-gradient-to-b from-radio-purple/60 to-radio-purple/10 mt-1" />
              </div>
              {/* Content */}
              <div className="flex-1 pb-8">
                <p className="text-radio-text leading-relaxed mb-6">
                  产品经理，关注 C 端体验。现在在猿力科技硬件部门做学练机相关的产品。
                </p>
                <p className="text-radio-muted leading-relaxed">
                  平时喜欢听音乐、做一些 vibe coding 的小实验。相信好的产品应该是克制的。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Now */}
        <section className="px-6 md:px-16 py-16">
          <div ref={nowReveal.ref} className="max-w-5xl mx-auto"
            style={{
              opacity: nowReveal.visible ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}>
            <div className="flex items-center gap-3 mb-10">
              <span className="font-mono text-xs text-radio-purple tracking-widest">// NOW</span>
              <div className="flex-1 h-px bg-gradient-to-r from-radio-purple/40 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NOW_CARDS.map((card, i) => (
                <NowCard key={i} card={card} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 md:px-16 py-24">
          <div ref={contactReveal.ref} className="max-w-3xl mx-auto"
            style={{
              opacity: contactReveal.visible ? 1 : 0,
              transform: contactReveal.visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 0.7s ease',
            }}>
            <div className="flex items-center gap-3 mb-10">
              <span className="font-mono text-xs text-radio-purple tracking-widest">// CONTACT</span>
              <div className="flex-1 h-px bg-gradient-to-r from-radio-purple/40 to-transparent" />
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={copyWeChat}
                className="contact-btn font-mono text-sm px-6 py-3 rounded-lg border border-radio-border text-radio-text bg-radio-surface/50">
                {copied ? '✓ 已复制' : '💬 WeChat: ZW-ZWZWZWZW'}
              </button>
              <a href="mailto:ad_zhouziwei@163.com"
                className="contact-btn font-mono text-sm px-6 py-3 rounded-lg border border-radio-border text-radio-text bg-radio-surface/50">
                📮 ad_zhouziwei@163.com
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-16 py-8 border-t border-radio-border">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <span className="font-mono text-xs text-radio-muted">zhouziwei.online</span>
            <span className="font-mono text-xs text-radio-muted">built with vibe coding</span>
          </div>
        </footer>

      </div>
    </>
  )
}
