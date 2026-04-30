'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import DJChat from './DJChat'

interface Track {
  id: string
  name: string
  artist: string
  cover: string
  duration: number
  url?: string
}

interface RadioPlayerProps {
  onAnalyserReady: (analyser: AnalyserNode) => void
}

export default function RadioPlayer({ onAnalyserReady }: RadioPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [isIntro, setIsIntro] = useState(false)
  const [introText, setIntroText] = useState('')
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [loadingPlaylist, setLoadingPlaylist] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const introAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const volumeRef = useRef(volume)
  volumeRef.current = volume

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }))
      setDate(now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Load playlist
  useEffect(() => {
    fetch('/api/playlist')
      .then(r => r.json())
      .then(data => {
        if (data.tracks?.length) setTracks(data.tracks)
        setLoadingPlaylist(false)
      })
      .catch(() => setLoadingPlaylist(false))
  }, [])

  const setupAudioContext = useCallback((audio: HTMLAudioElement) => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      const source = ctx.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
      onAnalyserReady(analyser)
    }
  }, [onAnalyserReady])

  const playIntroAndTrack = useCallback(async (track: Track) => {
    setIsIntro(true)
    setIsPlaying(false)

    try {
      const res = await fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: track.id, songName: track.name, artist: track.artist }),
      })
      const data = await res.json()
      setIntroText(data.text || '')

      if (data.audioUrl) {
        await new Promise<void>(resolve => {
          const audio = new Audio(data.audioUrl)
          introAudioRef.current = audio
          audio.play()
          audio.onended = () => resolve()
          audio.onerror = () => resolve()
        })
      }
    } catch (e) {
      console.error('intro failed', e)
    }

    setIsIntro(false)
    setIntroText('')

    // Play the actual track
    if (track.url) {
      const audio = audioRef.current || new Audio()
      audio.src = track.url
      audio.volume = volumeRef.current
      audioRef.current = audio
      setupAudioContext(audio)
      audio.play()
      setIsPlaying(true)

      audio.ontimeupdate = () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration)
      }
      audio.onended = () => {
        setCurrentIndex(prev => (prev + 1) % tracks.length)
      }
    }
  }, [setupAudioContext, tracks.length])

  const handlePlay = useCallback(async () => {
    if (!tracks.length) return
    const track = tracks[currentIndex]
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume()
    }
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      await playIntroAndTrack(track)
    }
  }, [tracks, currentIndex, playIntroAndTrack])

  const handlePause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const handleNext = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    setProgress(0)
    const next = (currentIndex + 1) % tracks.length
    setCurrentIndex(next)
  }, [currentIndex, tracks.length])

  const handlePrev = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    setProgress(0)
    const prev = (currentIndex - 1 + tracks.length) % tracks.length
    setCurrentIndex(prev)
  }, [currentIndex, tracks.length])

  // Auto-play on track change
  useEffect(() => {
    if (tracks.length && isPlaying) {
      playIntroAndTrack(tracks[currentIndex])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Volume duck
  const duckVolume = useCallback(() => {
    if (audioRef.current) audioRef.current.volume = 0.2
  }, [])
  const restoreVolume = useCallback(() => {
    if (audioRef.current) audioRef.current.volume = volumeRef.current
  }, [])

  const currentTrack = tracks[currentIndex]
  const progressPercent = Math.round(progress * 100)

  return (
    <div className="relative z-10 w-full max-w-md mx-auto flex flex-col gap-4 select-none">

      {/* Clock */}
      <div className="text-center">
        <div className="text-6xl font-mono font-bold text-white tracking-widest glow-purple">
          {time || '--:--'}
        </div>
        <div className="text-radio-muted font-mono text-xs mt-1">{date}</div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-radio-green animate-pulse' : 'bg-radio-muted'}`} />
          <span className="font-mono text-xs text-radio-muted">{isPlaying ? 'ON AIR' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Player card */}
      <div className="bg-radio-surface/80 backdrop-blur border border-radio-border rounded-xl p-5 border-glow">

        {/* Intro state */}
        {isIntro && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-radio-purple/10 border border-radio-purple/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-radio-purple animate-pulse" />
              <span className="font-mono text-xs text-radio-purple">Speaking...</span>
            </div>
            {introText && <p className="text-radio-text text-xs font-mono leading-relaxed">{introText}</p>}
          </div>
        )}

        {/* Now playing */}
        <div className="flex items-center gap-3 mb-4">
          {currentTrack?.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentTrack.cover} alt="cover" className="w-12 h-12 rounded-lg object-cover border border-radio-border" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-radio-bg border border-radio-border flex items-center justify-center">
              <span className="text-xl">🎵</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm text-white truncate">
              {loadingPlaylist ? '加载中...' : (currentTrack?.name || '暂无歌曲')}
            </div>
            <div className="font-mono text-xs text-radio-muted truncate">
              {currentTrack?.artist || '--'}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full bg-radio-purple transition-all duration-100 ${
                  isPlaying ? 'animate-bounce' : ''
                }`}
                style={{
                  height: isPlaying ? `${8 + Math.random() * 16}px` : '4px',
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="h-1 bg-radio-border rounded-full overflow-hidden">
            <div
              className="h-full bg-radio-purple rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={handlePrev} className="text-radio-muted hover:text-radio-text transition-colors text-lg">⏮</button>
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="w-12 h-12 rounded-full bg-radio-purple/20 border border-radio-purple/50 flex items-center justify-center hover:bg-radio-purple/30 transition-colors text-white text-xl"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={handleNext} className="text-radio-muted hover:text-radio-text transition-colors text-lg">⏭</button>
        </div>
      </div>

      {/* Queue */}
      {tracks.length > 1 && (
        <div className="bg-radio-surface/60 backdrop-blur border border-radio-border rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-radio-border flex justify-between items-center">
            <span className="font-mono text-xs text-radio-muted">QUEUE</span>
            <span className="font-mono text-xs text-radio-muted">{tracks.length} TRACKS</span>
          </div>
          <div className="divide-y divide-radio-border">
            {tracks.slice(currentIndex, currentIndex + 5).map((track, i) => (
              <div
                key={track.id}
                className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-radio-bg/50 transition-colors ${
                  i === 0 ? 'bg-radio-purple/10' : ''
                }`}
                onClick={() => { setCurrentIndex(currentIndex + i); setIsPlaying(true) }}
              >
                <span className="font-mono text-xs text-radio-muted w-4">{i === 0 ? '▶' : currentIndex + i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-white truncate">{track.name}</div>
                  <div className="font-mono text-xs text-radio-muted truncate">{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DJ Chat */}
      <div className="bg-radio-surface/60 backdrop-blur border border-radio-border rounded-xl p-4 h-64">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-radio-green" />
          <span className="font-mono text-xs text-radio-muted">DJ · LIVE</span>
        </div>
        <div className="h-[calc(100%-28px)]">
          <DJChat
            currentSong={currentTrack ? { name: currentTrack.name, artist: currentTrack.artist } : null}
            onVolumeChange={(v) => { if (audioRef.current) audioRef.current.volume = v }}
            onDuckStart={duckVolume}
            onDuckEnd={restoreVolume}
          />
        </div>
      </div>
    </div>
  )
}
