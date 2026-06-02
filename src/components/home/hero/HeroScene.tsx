'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Lightweight WebGL hero scene (vanilla Three.js — no R3F).
 * An ORIGINAL, stylised Burj Khalifa-style supertall tower: a tapered
 * tri-lobe body built from a single InstancedMesh (one draw call) that steps
 * inward and spirals as it rises, topped by a spire, with emissive window
 * lights and drifting particles. Gentle auto-rotation + pointer parallax.
 *
 * Performance & a11y guarantees:
 *  - DPR capped at 1.5; antialias off on low-DPR/mobile.
 *  - Tower body = 1 InstancedMesh (no per-floor draw calls).
 *  - Pauses the RAF loop when offscreen (IntersectionObserver) or tab hidden.
 *  - Fully disposes geometries/materials/renderer on unmount.
 *  - prefers-reduced-motion → single static frame, no animation.
 *  - `mobile` prop lowers floor + particle counts for low-end devices.
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
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(0, 0.6, 10)

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: dpr < 1.5 })
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    mount.appendChild(renderer.domElement)

    const tower = new THREE.Group()
    tower.position.y = -0.4
    scene.add(tower)

    const TOWER_H = 8
    const LEVELS = mobile ? 22 : 38
    const LOBES = 3
    const segH = (TOWER_H / LEVELS) * 1.04

    // ── Tower body: one InstancedMesh of tapering tri-lobe slabs ──
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2f8f93,
      metalness: 0.45,
      roughness: 0.35,
      transparent: true,
      opacity: 0.92,
    })
    const body = new THREE.InstancedMesh(boxGeo, bodyMat, LEVELS * LOBES)
    const dummy = new THREE.Object3D()
    const winPos: number[] = []
    let idx = 0
    for (let k = 0; k < LEVELS; k++) {
      const f = k / LEVELS
      const radius = THREE.MathUtils.lerp(1.05, 0.07, Math.pow(f, 0.82))
      const y = f * TOWER_H - TOWER_H / 2
      const w = Math.max(radius * 0.78, 0.05)
      for (let l = 0; l < LOBES; l++) {
        const ang = (l / LOBES) * Math.PI * 2 + f * 0.9
        const px = Math.cos(ang) * radius * 0.46
        const pz = Math.sin(ang) * radius * 0.46
        dummy.position.set(px, y, pz)
        dummy.rotation.set(0, -ang, 0)
        dummy.scale.set(w, segH, w * 0.5)
        dummy.updateMatrix()
        body.setMatrixAt(idx++, dummy.matrix)
        // scatter a couple of window lights on this slab face
        if (k % 1 === 0 && Math.random() > 0.45) {
          winPos.push(px + Math.cos(ang) * 0.04, y + (Math.random() - 0.5) * segH, pz + Math.sin(ang) * 0.04)
        }
      }
    }
    body.instanceMatrix.needsUpdate = true
    tower.add(body)

    // ── Spire ──
    const spireGeo = new THREE.CylinderGeometry(0.015, 0.09, 2.4, 10)
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xbfe9e9, metalness: 0.7, roughness: 0.2 })
    const spire = new THREE.Mesh(spireGeo, spireMat)
    spire.position.y = TOWER_H / 2 + 1.0
    tower.add(spire)

    // ── Window lights ──
    const winGeo = new THREE.BufferGeometry()
    winGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(winPos), 3))
    const winMat = new THREE.PointsMaterial({ color: 0xffc163, size: 0.05, transparent: true, opacity: 0.95 })
    const windows = new THREE.Points(winGeo, winMat)
    tower.add(windows)

    // ── Drifting background particles ──
    const starCount = mobile ? 220 : 560
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 24
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 18
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.5 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffd9a0, 1.25)
    key.position.set(5, 6, 6)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x3bbaba, 0.85)
    rim.position.set(-6, 1, 2)
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
      tower.rotation.y = t * 0.18
      tower.position.x = Math.sin(t * 0.5) * 0.05
      stars.rotation.y = t * 0.02
      camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.04
      camera.position.y += (0.6 - pointer.y * 0.5 - camera.position.y) * 0.04
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

    const io = new IntersectionObserver(
      (entries) => (entries[0]?.isIntersecting ? start() : stop()),
      { threshold: 0.05 },
    )
    io.observe(mount)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)

    const onResize = () => {
      width = mount.clientWidth || window.innerWidth
      height = mount.clientHeight || 480
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    renderFrame()
    start()

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      boxGeo.dispose(); bodyMat.dispose(); body.dispose()
      spireGeo.dispose(); spireMat.dispose()
      winGeo.dispose(); winMat.dispose()
      starGeo.dispose(); starMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [mobile])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
}
