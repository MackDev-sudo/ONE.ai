"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface AIVisualizationProps {
  mode: string
  isActive: boolean
}

export function AIVisualization({ mode, isActive }: AIVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const animationRef = useRef<number | null>(null)
  const particleDataRef = useRef<{
    originalPositions: Float32Array
    velocities: Float32Array
    phases: Float32Array
    sizes: Float32Array
    opacities: Float32Array
    particleTypes: Float32Array
  } | null>(null)

  // Mode-based styling
  const modeStyles = {
    general: {
      color:
        "border-cyan-500/40 shadow-cyan-500/20 bg-gradient-to-br from-cyan-100/30 to-blue-100/30 dark:from-cyan-950/30 dark:to-blue-950/30",
      particleColor: new THREE.Color(0x00a0ff),
    },
    productivity: {
      color:
        "border-emerald-500/40 shadow-emerald-500/20 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 dark:from-emerald-950/30 dark:to-teal-950/30",
      particleColor: new THREE.Color(0x10b981),
    },
    wellness: {
      color:
        "border-rose-500/40 shadow-rose-500/20 bg-gradient-to-br from-rose-100/30 to-pink-100/30 dark:from-rose-950/30 dark:to-pink-950/30",
      particleColor: new THREE.Color(0xf43f5e),
    },
    learning: {
      color:
        "border-purple-500/40 shadow-purple-500/20 bg-gradient-to-br from-purple-100/30 to-indigo-100/30 dark:from-purple-950/30 dark:to-indigo-950/30",
      particleColor: new THREE.Color(0x8b5cf6),
    },
    creative: {
      color:
        "border-amber-500/40 shadow-amber-500/20 bg-gradient-to-br from-amber-100/30 to-orange-100/30 dark:from-amber-950/30 dark:to-orange-950/30",
      particleColor: new THREE.Color(0xf59e0b),
    },
    bff: {
      color:
        "border-pink-500/40 shadow-pink-500/20 bg-gradient-to-br from-pink-100/30 to-rose-100/30 dark:from-pink-950/30 dark:to-rose-950/30",
      particleColor: new THREE.Color(0xec4899),
    },
  }

  const currentModeStyle = modeStyles[mode as keyof typeof modeStyles] || modeStyles.general

  useEffect(() => {
    if (!mountRef.current) return

    // Clean up previous scene
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(200, 200)
    renderer.setClearColor(0x000000, 0)

    // Clear previous canvas
    if (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }
    mountRef.current.appendChild(renderer.domElement)

    // Enhanced particle system with multiple layers and types
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const opacities = new Float32Array(particleCount)
    const originalPositions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const phases = new Float32Array(particleCount)
    const particleTypes = new Float32Array(particleCount) // 0=core, 1=middle, 2=outer, 3=neural

    const baseColor = currentModeStyle.particleColor

    // Create particles with different types and depth layers
    for (let i = 0; i < particleCount; i++) {
      // Determine particle type and layer
      const random = Math.random()
      let particleType, layer, baseRadius, size, opacity
      
      if (random < 0.15) {
        // Core particles - dense center
        particleType = 0
        layer = 0
        baseRadius = 0.1 + Math.random() * 0.3
        size = 0.04 + Math.random() * 0.02
        opacity = 0.9 + Math.random() * 0.1
      } else if (random < 0.4) {
        // Middle layer - main visualization
        particleType = 1
        layer = 1
        baseRadius = 0.4 + Math.random() * 0.5
        size = 0.025 + Math.random() * 0.02
        opacity = 0.7 + Math.random() * 0.2
      } else if (random < 0.8) {
        // Outer layer - atmospheric
        particleType = 2
        layer = 2
        baseRadius = 0.9 + Math.random() * 0.8
        size = 0.015 + Math.random() * 0.015
        opacity = 0.3 + Math.random() * 0.4
      } else {
        // Neural connections - flowing streams
        particleType = 3
        layer = Math.floor(Math.random() * 3)
        baseRadius = 0.2 + Math.random() * 0.6
        size = 0.01 + Math.random() * 0.01
        opacity = 0.5 + Math.random() * 0.3
      }

      const radiusVariation = Math.random() * 0.2
      const radius = baseRadius + radiusVariation

      // Create more organic distribution
      let x, y, z
      if (particleType === 3) {
        // Neural connections follow paths
        const pathAngle = Math.random() * Math.PI * 2
        const pathHeight = (Math.random() - 0.5) * 2
        x = Math.cos(pathAngle + Math.sin(pathHeight * 2) * 0.5) * radius
        y = pathHeight * 0.8
        z = Math.sin(pathAngle + Math.cos(pathHeight * 2) * 0.5) * radius
      } else {
        // Spherical distribution with some clustering
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        
        // Add clustering effect
        const clusterOffset = (Math.random() - 0.5) * 0.3
        const finalRadius = radius + clusterOffset
        
        x = finalRadius * Math.sin(phi) * Math.cos(theta)
        y = finalRadius * Math.sin(phi) * Math.sin(theta)
        z = finalRadius * Math.cos(phi)
      }

      // Set positions
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Store original positions
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z

      // Enhanced color variation based on depth and type
      const depth = Math.sqrt(x * x + y * y + z * z)
      const depthFactor = Math.max(0.3, 1 - depth / 2)
      const colorVariation = 0.5 + Math.random() * 0.7
      const brightness = (0.6 + Math.random() * 0.6) * depthFactor

      // Type-based color modifications
      let colorMod = 1
      if (particleType === 0) colorMod = 1.2 // Core brighter
      else if (particleType === 2) colorMod = 0.7 // Outer dimmer
      else if (particleType === 3) colorMod = 0.9 // Neural medium

      colors[i * 3] = Math.min(1, baseColor.r * colorVariation * brightness * colorMod)
      colors[i * 3 + 1] = Math.min(1, baseColor.g * colorVariation * brightness * colorMod)
      colors[i * 3 + 2] = Math.min(1, baseColor.b * colorVariation * brightness * colorMod)

      // Store particle properties
      sizes[i] = size
      opacities[i] = opacity
      particleTypes[i] = particleType

      // Enhanced velocities based on type
      const velocityMult = particleType === 3 ? 0.008 : 0.004
      velocities[i * 3] = (Math.random() - 0.5) * velocityMult
      velocities[i * 3 + 1] = (Math.random() - 0.5) * velocityMult
      velocities[i * 3 + 2] = (Math.random() - 0.5) * velocityMult

      // Random phase for wave motion
      phases[i] = Math.random() * Math.PI * 2
    }

    // Store particle data
    particleDataRef.current = {
      originalPositions,
      velocities,
      phases,
      sizes,
      opacities,
      particleTypes,
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1))

    // Enhanced material with size attenuation and depth
    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      alphaTest: 0.01,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Add secondary particle system for neural connections
    const connectionCount = 150
    const connectionGeometry = new THREE.BufferGeometry()
    const connectionPositions = new Float32Array(connectionCount * 6) // 2 points per line
    const connectionColors = new Float32Array(connectionCount * 6)

    for (let i = 0; i < connectionCount; i++) {
      // Create connections between nearby particles
      const startIdx = Math.floor(Math.random() * particleCount) * 3
      const endIdx = Math.floor(Math.random() * particleCount) * 3
      
      connectionPositions[i * 6] = originalPositions[startIdx]
      connectionPositions[i * 6 + 1] = originalPositions[startIdx + 1]
      connectionPositions[i * 6 + 2] = originalPositions[startIdx + 2]
      connectionPositions[i * 6 + 3] = originalPositions[endIdx]
      connectionPositions[i * 6 + 4] = originalPositions[endIdx + 1]
      connectionPositions[i * 6 + 5] = originalPositions[endIdx + 2]
      
      // Dim connection colors
      const connectionColor = baseColor.clone().multiplyScalar(0.3)
      connectionColors[i * 6] = connectionColor.r
      connectionColors[i * 6 + 1] = connectionColor.g
      connectionColors[i * 6 + 2] = connectionColor.b
      connectionColors[i * 6 + 3] = connectionColor.r
      connectionColors[i * 6 + 4] = connectionColor.g
      connectionColors[i * 6 + 5] = connectionColor.b
    }

    connectionGeometry.setAttribute("position", new THREE.BufferAttribute(connectionPositions, 3))
    connectionGeometry.setAttribute("color", new THREE.BufferAttribute(connectionColors, 3))

    const connectionMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    })

    const connections = new THREE.LineSegments(connectionGeometry, connectionMaterial)
    scene.add(connections)

    // Add ambient glow effect
    const glowGeometry = new THREE.SphereGeometry(1.8, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(glow)

    camera.position.z = 4

    sceneRef.current = scene
    rendererRef.current = renderer
    particlesRef.current = particles

    // Store references for animation
    const connectionsRef = connections
    const glowRef = glow
    const glowMaterialRef = glowMaterial
    const connectionMaterialRef = connectionMaterial

    // Enhanced animation loop with multiple effects
    let time = 0
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      time += 0.008

      if (particles && particleDataRef.current) {
        const positionAttribute = particles.geometry.getAttribute("position") as THREE.BufferAttribute
        const colorAttribute = particles.geometry.getAttribute("color") as THREE.BufferAttribute
        const positions = positionAttribute.array as Float32Array
        const colors = colorAttribute.array as Float32Array
        const { originalPositions, velocities, phases, sizes, opacities, particleTypes } = particleDataRef.current

        // Enhanced particle animation with depth and type-based behavior
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3
          const particleType = particleTypes[i]
          const originalSize = sizes[i]
          const originalOpacity = opacities[i]

          // Type-specific animation parameters
          let waveIntensity, waveSpeed, orbitSpeed, orbitRadius
          
          if (particleType === 0) {
            // Core particles - subtle movement
            waveIntensity = isActive ? 0.04 : 0.02
            waveSpeed = isActive ? 1.2 : 0.6
            orbitSpeed = isActive ? 0.2 : 0.1
            orbitRadius = 0.01
          } else if (particleType === 1) {
            // Middle layer - main movement
            waveIntensity = isActive ? 0.08 : 0.04
            waveSpeed = isActive ? 1.5 : 0.8
            orbitSpeed = isActive ? 0.3 : 0.15
            orbitRadius = 0.02
          } else if (particleType === 2) {
            // Outer layer - flowing movement
            waveIntensity = isActive ? 0.12 : 0.06
            waveSpeed = isActive ? 2.0 : 1.0
            orbitSpeed = isActive ? 0.4 : 0.2
            orbitRadius = 0.03
          } else {
            // Neural connections - rapid movement
            waveIntensity = isActive ? 0.15 : 0.08
            waveSpeed = isActive ? 3.0 : 1.5
            orbitSpeed = isActive ? 0.6 : 0.3
            orbitRadius = 0.015
          }

          // Multi-layered wave motion
          const primaryWave = Math.sin(time * waveSpeed + phases[i]) * waveIntensity
          const secondaryWave = Math.cos(time * waveSpeed * 1.3 + phases[i] * 1.7) * waveIntensity * 0.7
          const tertiaryWave = Math.sin(time * waveSpeed * 0.7 + phases[i] * 0.9) * waveIntensity * 0.5

          const waveX = primaryWave + secondaryWave * 0.5
          const waveY = Math.cos(time * waveSpeed * 1.2 + phases[i] * 1.3) * waveIntensity + tertiaryWave
          const waveZ = Math.sin(time * waveSpeed * 0.9 + phases[i] * 0.8) * waveIntensity + secondaryWave * 0.3

          // Enhanced orbital motion with depth
          const orbitPhase = time * orbitSpeed + phases[i] * 2
          const orbitX = Math.cos(orbitPhase) * orbitRadius
          const orbitY = Math.sin(orbitPhase * 1.1 + phases[i] * 2.5) * orbitRadius
          const orbitZ = Math.cos(orbitPhase * 0.8) * orbitRadius * 0.5

          // Add breathing effect
          const breathPhase = time * 0.5 + phases[i]
          const breathIntensity = isActive ? 0.03 : 0.015
          const breathScale = 1 + Math.sin(breathPhase) * breathIntensity

          // Combine all motions
          positions[i3] = (originalPositions[i3] + waveX + orbitX) * breathScale
          positions[i3 + 1] = (originalPositions[i3 + 1] + waveY + orbitY) * breathScale
          positions[i3 + 2] = (originalPositions[i3 + 2] + waveZ + orbitZ) * breathScale

          // Dynamic color shifts based on movement and depth
          const depth = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2)
          const depthFactor = Math.max(0.3, 1 - depth / 2.5)
          const activityBoost = isActive ? 1.2 : 1.0
          const colorPulse = 1 + Math.sin(time * 2 + phases[i]) * 0.1
          
          const originalColor = baseColor.clone()
          colors[i3] = Math.min(1, originalColor.r * depthFactor * activityBoost * colorPulse)
          colors[i3 + 1] = Math.min(1, originalColor.g * depthFactor * activityBoost * colorPulse)
          colors[i3 + 2] = Math.min(1, originalColor.b * depthFactor * activityBoost * colorPulse)

          // Ensure particles stay within enhanced boundary
          const currentRadius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2)
          const maxRadius = 2.2
          if (currentRadius > maxRadius) {
            const scale = maxRadius / currentRadius
            positions[i3] *= scale
            positions[i3 + 1] *= scale
            positions[i3 + 2] *= scale
          }
        }

        positionAttribute.needsUpdate = true
        colorAttribute.needsUpdate = true

        // Enhanced rotation with multiple axes
        const rotationSpeed = isActive ? 0.012 : 0.006
        particles.rotation.y += rotationSpeed
        particles.rotation.x += rotationSpeed * 0.7
        particles.rotation.z += rotationSpeed * 0.3

        // Multi-layered pulsing effect
        const primaryPulse = Math.sin(time * 2) * (isActive ? 0.08 : 0.04)
        const secondaryPulse = Math.cos(time * 3.5) * (isActive ? 0.04 : 0.02)
        const pulse = 1 + primaryPulse + secondaryPulse
        particles.scale.setScalar(pulse)

        // Animate connections if they exist
        if (connectionsRef) {
          connectionsRef.rotation.y += rotationSpeed * 0.5
          connectionsRef.rotation.x += rotationSpeed * 0.3
          const connectionPulse = 1 + Math.sin(time * 1.5) * 0.05
          connectionsRef.scale.setScalar(connectionPulse)
          
          // Update connection opacity based on activity
          connectionMaterialRef.opacity = isActive ? 0.25 : 0.15
        }

        // Animate glow effect
        if (glowRef) {
          glowRef.rotation.y -= rotationSpeed * 0.2
          glowRef.rotation.x += rotationSpeed * 0.1
          const glowPulse = 1 + Math.sin(time * 1.2) * 0.1
          glowRef.scale.setScalar(glowPulse)
          glowMaterialRef.opacity = isActive ? 0.08 : 0.05
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      connectionGeometry.dispose()
      connectionMaterialRef.dispose()
      glowGeometry.dispose()
      glowMaterialRef.dispose()
    }
  }, [mode, isActive]) // Re-run when mode or isActive changes

    return (
      <div className="flex justify-center">
        <div
          ref={mountRef}
          className={`w-48 h-48 rounded-full ${currentModeStyle.color} backdrop-blur-sm shadow-2xl overflow-hidden transition-all duration-500 ease-in-out relative`}
          style={{
            boxShadow: `
              0 0 60px ${currentModeStyle.particleColor.getHexString()}20,
              0 0 120px ${currentModeStyle.particleColor.getHexString()}10,
              inset 0 0 60px ${currentModeStyle.particleColor.getHexString()}05
            `
          }}
        >
          {/* Additional depth overlay */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${currentModeStyle.particleColor.getHexString()}08 0%, transparent 70%)`
            }}
          />
        </div>
      </div>
    )
}
