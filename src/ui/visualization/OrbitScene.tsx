import * as React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// 3D Orbit visualization (graceful fallback if WebGL unavailable)
// ---------------------------------------------------------------------------

const TWO_PI = Math.PI * 2

// A simple sphere (planet) with a grid
function Planet({ radius = 5, color = 0x2266aa, emission = 0x112244 }) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.002
  })
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhongMaterial color={color} emissive={emission} flatShading />
    </mesh>
  )
}

// The orbit line (ellipse)
function OrbitRing({ radius = 8, color = 0x444444 }) {
  const points: number[] = []
  const segments = 128
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * TWO_PI
    points.push(radius * Math.cos(t), 0, radius * Math.sin(t))
  }
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.35} />
    </line>
  )
}

// The spacecraft
function Spacecraft({ position = [0, 0, 0] as [number, number, number], color = 0x00d2ff }: { position?: [number, number, number]; color?: number }) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.z += 0.01
  })
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 0.4, 0.4]} />
        <meshPhongMaterial color={color} emissive={0x003344} />
      </mesh>
      {/* Solar panels */}
      <group>
        <mesh>
          <planeGeometry args={[2.2, 0.5]} />
          <meshPhongMaterial color={0x22aa33} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.2, 0.5]} />
          <meshPhongMaterial color={0x22aa33} />
        </mesh>
      </group>
      <pointLight color={color} intensity={0.5} distance={8} position={[0, 0, 2]} />
    </group>
  )
}

// Ground station marker
function GroundStation({ position = [4, 0, 3] as [number, number, number] }: { position?: [number, number, number]; name?: string }) {
  const [highlighted, setHighlighted] = React.useState(false)
  return (
    <group position={position} onPointerOver={() => setHighlighted(true)} onPointerOut={() => setHighlighted(false)}>
      <mesh>
        <coneGeometry args={[0.35, 0.7, 8]} />
        <meshPhongMaterial color={highlighted ? 0x10b981 : 0xffffff} />
      </mesh>
      <sprite>
        <spriteMaterial color={0xffffff} transparent opacity={0.9} />
      </sprite>
    </group>
  )
}

// Comms link line between spacecraft and ground station
function CommsLink({ from = [0, 0, 6], to = [4, 0, 3], active = false }: { from?: number[]; to?: number[]; active?: boolean }) {
  const ref = React.useRef<THREE.Line>(null)
  useFrame(() => {
    if (!ref.current) return
    // pulse effect
    const t = Date.now() / 1000
    const opacity = 0.4 + 0.3 * Math.sin(t * 3)
    ;(ref.current.material as any).opacity = active ? opacity : 0.15
  })
  return (
    <line ref={ref as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([...from, ...to]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={0x10b981} transparent />
    </line>
  )
}

export interface OrbitSceneProps {
  enabled?: boolean
  body?: 'earth' | 'moon' | 'mars'
  onError?: () => void
  className?: string
}

// WebGL implementation
function OrbitSceneWebGL({ body = 'earth' }: OrbitSceneProps) {
  const bodyColor = body === 'mars' ? 0xe27d60 : body === 'moon' ? 0xcccccc : 0x2266aa
  return (
    <Canvas shadows camera={{ position: [12, 12, 12], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <Stars radius={100} depth={50} count={400} factor={4} saturation={0} fade speed={1} />
      <Planet radius={5} color={bodyColor} />
      <OrbitRing radius={8} />
      <Spacecraft position={[8, 0, 0]} />
      <GroundStation position={[4.5, 0, 3.5]} name="GS1" />
      <GroundStation position={[-4, 0, 3]} name="GS2" />
      <CommsLink from={[8, 0, 0]} to={[4.5, 0, 3.5]} active />
      <CommsLink from={[8, 0, 0]} to={[-4, 0, 3]} active />
      <OrbitControls makeDefault />
    </Canvas>
  )
}

// CSS fallback rendering (2D orbit diagram) when WebGL is unavailable
function OrbitSceneFallback() {
  return (
    <div className="w-full h-full rounded-2xl border border-space-700 bg-space-900/60 flex flex-col items-center justify-center p-6 text-space-500">
      <div className="w-32 h-32 rounded-full border-2 border-space-700 relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-full animate-[orbit_20s_linear_infinite]" />
        <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981] absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 animate-[orbit_20s_linear_infinite]" style={{ animationDirection: 'reverse' }} />
        <div className="w-10 h-10 rounded-full bg-space-800 border border-space-600 flex items-center justify-center z-10">🌍</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-xs text-space-500 mb-1">3D orbit view unavailable</div>
        <div className="text-[10px] text-space-600">WebGL not supported on this device — showing 2D fallback</div>
      </div>
    </div>
  )
}

export function OrbitScene({ enabled = true, body, onError, className = '' }: OrbitSceneProps) {
  const [webgl] = React.useState<boolean>(() => {
    if (typeof document === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  })
  if (!enabled) return null
  if (!webgl) {
    if (onError) onError()
    return <OrbitSceneFallback />
  }
  return (
    <div className={className}>
      <OrbitSceneWebGL body={body} />
    </div>
  )
}
