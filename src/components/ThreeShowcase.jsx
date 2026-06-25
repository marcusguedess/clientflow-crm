import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const stageWeights = {
  'Novo Lead': 0.35,
  'Contato Feito': 0.5,
  Reunião: 0.68,
  Proposta: 0.82,
  Fechado: 1,
  Perdido: 0.24,
}

export default function ThreeShowcase({ statusHealth, employees }) {
  const mountRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let renderer
    let animationFrame
    let observer

    try {
      const scene = new THREE.Scene()
      scene.fog = new THREE.Fog(0x10182d, 12, 34)

      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
      camera.position.set(7, 7, 10)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mount.appendChild(renderer.domElement)

      const themeRoot = mount.closest('.app-shell') || document.documentElement
      const primary = getComputedStyle(themeRoot).getPropertyValue('--accent-primary').trim() || '#6b56e8'
      const secondary = getComputedStyle(themeRoot).getPropertyValue('--accent-secondary').trim() || '#25c6a4'
      const warm = getComputedStyle(themeRoot).getPropertyValue('--accent-warm').trim() || '#f5a94c'

      scene.add(new THREE.AmbientLight(0xffffff, 1.6))
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.1)
      keyLight.position.set(6, 9, 5)
      scene.add(keyLight)
      const rimLight = new THREE.PointLight(new THREE.Color(secondary), 8, 16)
      rimLight.position.set(-5, 4, 4)
      scene.add(rimLight)

      const group = new THREE.Group()
      scene.add(group)

      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.16, 7),
        new THREE.MeshStandardMaterial({ color: 0x17233c, roughness: 0.55, metalness: 0.1 }),
      )
      floor.position.y = -0.12
      group.add(floor)

      const grid = new THREE.GridHelper(12, 12, new THREE.Color(secondary), 0x33435f)
      grid.position.y = 0.02
      group.add(grid)

      const maxValue = Math.max(...statusHealth.map((item) => item.value), 1)
      statusHealth.forEach((item, index) => {
        const height = Math.max(0.45, (item.value / maxValue) * 3.8)
        const color = index % 2 ? secondary : primary
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, height, 0.78),
          new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.22 }),
        )
        tower.position.set(-4.6 + index * 1.84, height / 2, -0.8)
        tower.scale.z = 0.72 + stageWeights[item.status]
        group.add(tower)

        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.12, 0.9),
          new THREE.MeshStandardMaterial({ color: warm, emissive: new THREE.Color(warm), emissiveIntensity: 0.16 }),
        )
        cap.position.set(tower.position.x, height + 0.09, tower.position.z)
        group.add(cap)
      })

      employees.slice(0, 12).forEach((employee, index) => {
        const lane = index % 6
        const row = Math.floor(index / 6)
        const avatar = new THREE.Group()
        const bodyColor = new THREE.Color(employee.avatar?.shirt || primary)
        const skinColor = new THREE.Color(employee.avatar?.skin || '#d99b72')
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.58, 0.24), new THREE.MeshStandardMaterial({ color: bodyColor }))
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.3), new THREE.MeshStandardMaterial({ color: skinColor }))
        head.position.y = 0.47
        avatar.add(body, head)
        avatar.position.set(-4.6 + lane * 1.84, 0.35, 2.05 + row * 0.72)
        avatar.rotation.y = -0.4 + lane * 0.12
        group.add(avatar)
      })

      function resize() {
        const width = mount.clientWidth || 800
        const height = mount.clientHeight || 320
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }

      observer = new ResizeObserver(resize)
      observer.observe(mount)
      resize()

      const clock = new THREE.Clock()
      function animate() {
        const elapsed = clock.getElapsedTime()
        group.rotation.y = Math.sin(elapsed * 0.28) * 0.08
        group.children.forEach((child, index) => {
          if (child.type === 'Group') child.position.y = 0.35 + Math.sin(elapsed * 1.8 + index) * 0.035
        })
        renderer.render(scene, camera)
        animationFrame = window.requestAnimationFrame(animate)
      }
      animate()

      return () => {
        window.cancelAnimationFrame(animationFrame)
        observer?.disconnect()
        scene.traverse((object) => {
          object.geometry?.dispose?.()
          if (object.material) {
            if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
            else object.material.dispose()
          }
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    } catch {
      setHasWebGL(false)
      renderer?.domElement?.remove()
      return undefined
    }
  }, [employees, statusHealth])

  return (
    <section className="three-showcase">
      <div className="three-showcase__copy">
        <span className="eyebrow">Visão 3D</span>
        <h2>Mapa volumétrico do funil</h2>
        <p>Torres representam valor por etapa; personagens representam a equipe ativa na operação comercial.</p>
      </div>
      <div className="three-showcase__stage" ref={mountRef}>
        {!hasWebGL && <span>Renderização 3D indisponível neste navegador.</span>}
      </div>
    </section>
  )
}
