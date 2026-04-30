'use client'
import { useState, useRef, useCallback } from 'react'

interface Message {
  role: 'user' | 'dj'
  text: string
  time: string
}

interface DJChatProps {
  currentSong: { name: string; artist: string } | null
  onVolumeChange: (vol: number) => void
  onDuckStart: () => void
  onDuckEnd: () => void
}

export default function DJChat({ currentSong, onVolumeChange, onDuckStart, onDuckEnd }: DJChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'dj',
      text: '在线。有什么想聊的？',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', text: userMsg, time: now },
    ]
    setMessages(newMessages)
    setLoading(true)
    scrollToBottom()

    try {
      // Duck music volume
      onDuckStart()

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          currentSong,
          history: newMessages.slice(-6).map(m => ({ role: m.role, content: m.text })),
        }),
      })

      const data = await res.json()
      const replyTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

      setMessages(prev => [...prev, { role: 'dj', text: data.reply, time: replyTime }])
      scrollToBottom()

      // Play TTS reply
      if (data.audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        const audio = new Audio(data.audioUrl)
        audioRef.current = audio
        audio.play()
        audio.onended = () => {
          onDuckEnd()
          audioRef.current = null
        }
      } else {
        onDuckEnd()
      }
    } catch (e) {
      console.error(e)
      onDuckEnd()
      setMessages(prev => [...prev, {
        role: 'dj',
        text: '信号有点乱，再说一次？',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'dj' && (
              <div className="w-6 h-6 rounded-full bg-radio-purple/20 border border-radio-purple/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs">🎙</span>
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-3 py-2 rounded-lg text-sm font-mono leading-relaxed ${
                msg.role === 'dj'
                  ? 'bg-radio-surface text-radio-text border border-radio-border'
                  : 'bg-radio-purple/20 text-white border border-radio-purple/40'
              }`}>
                {msg.text}
              </div>
              <span className="text-radio-muted text-xs font-mono mt-1">{msg.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-radio-purple/20 border border-radio-purple/40 flex items-center justify-center shrink-0">
              <span className="text-xs">🎙</span>
            </div>
            <div className="bg-radio-surface border border-radio-border rounded-lg px-3 py-2">
              <span className="font-mono text-xs text-radio-muted animate-pulse">speaking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center border-t border-radio-border pt-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="say something to the DJ..."
          className="flex-1 bg-radio-surface border border-radio-border rounded-lg px-3 py-2 text-sm font-mono text-radio-text placeholder:text-radio-muted/50 focus:outline-none focus:border-radio-purple/50 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-lg bg-radio-purple/20 border border-radio-purple/40 flex items-center justify-center hover:bg-radio-purple/30 transition-colors disabled:opacity-30"
        >
          <span className="text-radio-purple text-sm">↑</span>
        </button>
      </div>
    </div>
  )
}
