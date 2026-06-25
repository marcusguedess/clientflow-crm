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

const modes = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'revenue', label: 'Receita' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'team', label: 'Equipe' },
]

export default function ThreeShowcase({ statusHealth, employees }) {
  const mountRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)
  const [mode, setMode] = useState('overview')
  const [selectedLabel, setSelectedLabel] = useState('Clique em um modo')
  const [controlsOpen, setControlsOpen] = useState(true)

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
      const modePalette = {
        overview: primary,
        revenue: warm,
        pipeline: secondary,
        team: '#8f6dff',
      }

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
      const interactiveItems = []
      statusHealth.forEach((item, index) => {
        const height = Math.max(0.45, (item.value / maxValue) * 3.8)
        const color = index % 2 ? secondary : primary
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, height, 0.78),
          new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.22 }),
        )
        tower.position.set(-4.6 + index * 1.84, height / 2, -0.8)
        tower.scale.z = 0.72 + stageWeights[item.status]
        tower.userData = { label: `${item.status} · ${item.count} negócios`, mode: 'pipeline' }
        group.add(tower)
        interactiveItems.push(tower)

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
        avatar.userData = { label: employee.nome, mode: 'team' }
        group.add(avatar)
        interactiveItems.push(avatar)
      })

      const pulseRing = new THREE.Mesh(
        new THREE.TorusGeometry(4.5, 0.06, 12, 96),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(modePalette[mode]), emissive: new THREE.Color(modePalette[mode]), emissiveIntensity: 0.24 }),
      )
      pulseRing.rotation.x = Math.PI / 2
      pulseRing.position.y = 0.12
      group.add(pulseRing)

      const rayMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(modePalette[mode]),
        transparent: true,
        opacity: 0.16,
        emissive: new THREE.Color(modePalette[mode]),
        emissiveIntensity: 0.4,
      })
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.28, 4.8, 5, 1, true), rayMaterial)
      beam.position.set(0, 2.4, 0)
      group.add(beam)

      const raycast = new THREE.Raycaster()
      const pointer = new THREE.Vector2()

      function handlePointer(event) {
        const rect = mount.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
        raycast.setFromCamera(pointer, camera)
        const hits = raycast.intersectObjects(interactiveItems, true)
        if (hits.length) {
          const hit = hits[0].object
          const source = hit.parent || hit
          setSelectedLabel(source.userData.label || 'Elemento selecionado')
          setMode(source.userData.mode || 'overview')
        }
      }

      mount.addEventListener('pointerdown', handlePointer)

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
        const spin = mode === 'revenue' ? 0.15 : mode === 'pipeline' ? 0.08 : mode === 'team' ? 0.05 : 0.1
        group.rotation.y = Math.sin(elapsed * 0.28) * spin
        pulseRing.material.color = new THREE.Color(modePalette[mode])
        pulseRing.material.emissive = new THREE.Color(modePalette[mode])
        beam.material.color = new THREE.Color(modePalette[mode])
        beam.material.emissive = new THREE.Color(modePalette[mode])
        beam.scale.y = mode === 'team' ? 1.16 : mode === 'revenue' ? 1.34 : 1
        group.children.forEach((child, index) => {
          if (child.type === 'Group') child.position.y = 0.35 + Math.sin(elapsed * 1.8 + index) * 0.035
          if (child.userData?.mode === mode) child.scale.setScalar(1.08 + Math.sin(elapsed * 3 + index) * 0.015)
          else if (child.userData) child.scale.setScalar(0.96)
        })
        renderer.render(scene, camera)
        animationFrame = window.requestAnimationFrame(animate)
      }
      animate()

      return () => {
        window.cancelAnimationFrame(animationFrame)
        mount.removeEventListener('pointerdown', handlePointer)
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
  }, [employees, statusHealth, mode])

  return (
    <section className="three-showcase">
      <div className="three-showcase__copy">
        <span className="eyebrow">Visão 3D</span>
        <h2>Holograma clicável do CRM</h2>
        <p>{selectedLabel}. Clique em modos, torres ou avatares para alterar a leitura do painel.</p>
      </div>
      <div className="three-showcase__toolbar">
        <button className="three-showcase__toggle" type="button" onClick={() => setControlsOpen((current) => !current)}>
          {controlsOpen ? 'Fechar controle visual' : 'Abrir controle visual'}
        </button>
        {controlsOpen && (
          <div className="three-showcase__controls" role="tablist" aria-label="Modos do holograma">
            {modes.map((item) => (
              <button key={item.id} className={mode === item.id ? 'is-active' : ''} onClick={() => { setMode(item.id); setSelectedLabel(item.label) }} type="button">
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="three-showcase__stage" ref={mountRef}>
        {!hasWebGL && <span>Renderização 3D indisponível neste navegador.</span>}
      </div>
    </section>
  )
}
