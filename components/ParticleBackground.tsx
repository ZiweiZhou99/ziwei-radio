'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ParticleBackgroundProps {
  analyser?: AnalyserNode | null
}

export default function ParticleBackground({ analyser }: ParticleBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    particles: THREE.Points
    animId: number
  } | null>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Particle count based on screen size
    const isMobile = W < 768
    const COUNT = isMobile ? 600 : 2500

    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)

    // Color palette: deep purple → violet → blue
    const palette = [
      new THREE.Color('#7B68EE'),
      new THREE.Color('#9370DB'),
      new THREE.Color('#4169E1'),
      new THREE.Color('#6A5ACD'),
      new THREE.Color('#483D8B'),
    ]

    for (let i = 0; i < COUNT; i++) {
      // Spherical distribution with some randomness
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 0.8 + Math.random() * 1.8

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = Math.random() * 3 + 1
      phases[i] = Math.random() * Math.PI * 2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Breathing effect
          float breath = sin(uTime * 0.5 + length(position) * 2.0) * 0.05;
          
          // Bass-driven expansion
          float expand = 1.0 + uBass * 0.4;
          pos *= (expand + breath);
          
          // Mid-driven turbulence
          pos.x += sin(uTime * 1.2 + pos.y * 3.0) * uMid * 0.15;
          pos.y += cos(uTime * 0.8 + pos.z * 2.0) * uMid * 0.15;
          pos.z += sin(uTime * 1.0 + pos.x * 2.5) * uMid * 0.1;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (size + uBass * 2.0) * uPixelRatio * (2.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Freq data buffer
    const freqData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null

    let animId = 0
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      let bass = 0, mid = 0, high = 0
      if (analyser && freqData) {
        analyser.getByteFrequencyData(freqData)
        const binCount = freqData.length
        // Bass: 0-10%, Mid: 10-40%, High: 40-80%
        for (let i = 0; i < Math.floor(binCount * 0.1); i++) bass += freqData[i]
        bass /= (binCount * 0.1 * 255)
        for (let i = Math.floor(binCount * 0.1); i < Math.floor(binCount * 0.4); i++) mid += freqData[i]
        mid /= (binCount * 0.3 * 255)
        for (let i = Math.floor(binCount * 0.4); i < Math.floor(binCount * 0.8); i++) high += freqData[i]
        high /= (binCount * 0.4 * 255)
      } else {
        // Idle breathing
        bass = (Math.sin(t * 0.5) * 0.5 + 0.5) * 0.2
        mid = (Math.sin(t * 0.7 + 1) * 0.5 + 0.5) * 0.1
      }

      mat.uniforms.uTime.value = t
      mat.uniforms.uBass.value = bass
      mat.uniforms.uMid.value = mid
      mat.uniforms.uHigh.value = high

      particles.rotation.y = t * 0.05
      particles.rotation.x = Math.sin(t * 0.03) * 0.1

      renderer.render(scene, camera)
    }
    animate()
    sceneRef.current = { renderer, scene, camera, particles, animId }

    // Resize handler
    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [analyser])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #0a0a0a 70%)' }}
    />
  )
}
