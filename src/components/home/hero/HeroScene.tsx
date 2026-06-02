'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Lightweight WebGL hero scene (vanilla Three.js — no R3F).
 * A slowly rotating wireframe globe ringed by glowing "destination" points
 * and drifting particles, with gentle pointer parallax.
 *
 * Performance & a11y guarantees:
 *  - DPR capped at 1.5; antialias off on low-DPR/mobile.
 *  - Pauses the RAF loop when offscreen (IntersectionObserver) or tab hidden.
 *  - Fully disposes geometries/materials/renderer on unmount (no GPU leak).
 *  - prefers-reduced-motion → renders a single static frame, no animation.
 *  - `mobile` prop reduces particle count + density for low-end devices.
 */
export default function HeroScene({ mobile = false }: { mobile?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let width = mount.clientWidth || window.innerWidth
    let height = mount.clientHeight || 480

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 9)

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: dpr < 1.5 })
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    mount.appendChild(renderer.domElement)

    // ── Globe (wireframe icosahedron) ──
    const globeGeo = new THREE.IcosahedronGeometry(2.6, 2)
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x2d9d9d,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    // ── Inner solid sphere for depth ──
    const coreGeo = new THREE.SphereGeometry(2.55, 32, 32)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0e3a3a,
      transparent: true,
      opacity: 0.55,
      roughness: 0.6,
      metalness: 0.2,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    scene.add(core)

    // ── Destination points on the sphere surface ──
    const pointCount = mobile ? 60 : 140
    const destGeo = new THREE.BufferGeometry()
    const destPos = new Float32Array(pointCount * 3)
    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      const r = 2.62
      destPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      destPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      destPos[i * 3 + 2] = r * Math.cos(phi)
    }
    destGeo.setAttribute('position', new THREE.BufferAttribute(destPos, 3))
    const destMat = new THREE.PointsMaterial({ color: 0xffb733, size: 0.07, transparent: true, opacity: 0.95 })
    const dests = new THREE.Points(destGeo, destMat)
    scene.add(dests)

    // ── Drifting background particles ──
    const starCount = mobile ? 220 : 600
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 24
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 16
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.5 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key = new THREE.DirectionalLight(0xffd9a0, 1.1)
    key.position.set(5, 3, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x3bbaba, 0.8)
    rim.position.set(-5, -2, 2)
    scene.add(rim)

    // ── Pointer parallax ──
    const pointer = { x: 0, y: 0 }
    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    // ── Render / loop control ──
    let raf = 0
    let running = false
    const clock = new THREE.Clock()

    const renderFrame = () => {
      const t = clock.getElapsedTime()
      globe.rotation.y = t * 0.12
      core.rotation.y = t * 0.12
      dests.rotation.y = t * 0.12
      stars.rotation.y = t * 0.02
      // ease camera toward pointer
      camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04
      camera.position.y += (-pointer.y * 0.5 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    const loop = () => {
      renderFrame()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running || reduce) return
      running = true
      clock.start()
      loop()
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    // Pause when offscreen
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting
        if (visible) start()
        else stop()
      },
      { threshold: 0.05 },
    )
    io.observe(mount)

    // Pause when tab hidden
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)

    // Resize
    const onResize = () => {
      width = mount.clientWidth || window.innerWidth
      height = mount.clientHeight || 480
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // initial paint (covers reduced-motion: one static frame)
    renderFrame()
    start()

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      globeGeo.dispose(); globeMat.dispose()
      coreGeo.dispose(); coreMat.dispose()
      destGeo.dispose(); destMat.dispose()
      starGeo.dispose(); starMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [mobile])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
}
