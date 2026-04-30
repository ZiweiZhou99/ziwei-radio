'use client'
import { useState, useCallback } from 'react'
import ParticleBackground from '@/components/ParticleBackground'
import RadioPlayer from '@/components/RadioPlayer'

export default function RadioPage() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const handleAnalyserReady = useCallback((a: AnalyserNode) => {
    setAnalyser(a)
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-12 pb-8 px-4">
      <ParticleBackground analyser={analyser} />
      <div className="relative z-10 w-full">
        <RadioPlayer onAnalyserReady={handleAnalyserReady} />
      </div>
    </div>
  )
}
