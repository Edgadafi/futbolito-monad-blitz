import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'

const W = 360
const H = 580
const BALL_R = 10
const PEG_R = 7

function buildPegs() {
  const pegs = []
  const rows = 6, cols = 5
  const sx = 55, sy = 170, gx = (W - sx * 2) / (cols - 1), gy = 50
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = r % 2 === 0 ? 0 : gx / 2
      const x = sx + c * gx + ox
      const y = sy + r * gy
      if (x > 15 && x < W - 15) {
        pegs.push(Matter.Bodies.circle(x, y, PEG_R, {
          isStatic: true, label: 'peg',
          restitution: 0.55, friction: 0.01,
          render: { fillStyle: '#f59e0b' }
        }))
      }
    }
  }
  return pegs
}

export default function GameCanvas({ credits, onGoal, canPlay }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const plungerRef = useRef(null)
  const ballRef = useRef(null)
  const dragging = useRef(false)
  const dragStartY = useRef(0)
  const pullRef = useRef(0)

  const [score, setScore] = useState(0)
  const [pull, setPull] = useState(0)
  const [goalMsg, setGoalMsg] = useState(false)
  const [inPlay, setInPlay] = useState(false)

  const resetBall = useCallback(() => {
    if (ballRef.current && engineRef.current) {
      Matter.World.remove(engineRef.current.world, ballRef.current)
      ballRef.current = null
    }
    setInPlay(false)
    setPull(0)
    pullRef.current = 0
    if (plungerRef.current && engineRef.current) {
      Matter.Body.setPosition(plungerRef.current, { x: W - 28, y: H - 90 })
    }
  }, [])

  useEffect(() => {
    const { Engine, Render, Runner, Bodies, Body, World, Events } = Matter

    const engine = Engine.create({ gravity: { y: 1.6 } })
    engineRef.current = engine

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: { width: W, height: H, wireframes: false, background: '#0f172a' }
    })

    const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, {
      isStatic: true, render: { fillStyle: '#1e3a5f' }
    })

    const goal = Bodies.rectangle(W / 2, 55, W - 60, 18, {
      isStatic: true, isSensor: true, label: 'goal',
      render: { fillStyle: '#22c55e', opacity: 0.5 }
    })
    const crossbar = Bodies.rectangle(W / 2, 47, W - 56, 7, {
      isStatic: true, render: { fillStyle: '#ffffff' }
    })
    const postL = Bodies.rectangle(32, 72, 7, 52, { isStatic: true, render: { fillStyle: '#ffffff' } })
    const postR = Bodies.rectangle(W - 32, 72, 7, 52, { isStatic: true, render: { fillStyle: '#ffffff' } })

    const plunger = Bodies.rectangle(W - 28, H - 90, 28, 70, {
      isStatic: true, label: 'plunger', render: { fillStyle: '#ef4444' }
    })
    plungerRef.current = plunger

    const bumperL = Bodies.circle(75, 390, 20, { isStatic: true, restitution: 1.3, label: 'bumper', render: { fillStyle: '#8b5cf6' } })
    const bumperR = Bodies.circle(W - 75, 390, 20, { isStatic: true, restitution: 1.3, label: 'bumper', render: { fillStyle: '#8b5cf6' } })

    const flipL = Bodies.rectangle(95, H - 55, 85, 12, { isStatic: true, angle: -0.42, render: { fillStyle: '#3b82f6' } })
    const flipR = Bodies.rectangle(W - 95, H - 55, 85, 12, { isStatic: true, angle: 0.42, render: { fillStyle: '#3b82f6' } })

    const channel = Bodies.rectangle(W - 14, H / 2 + 60, 4, H - 100, { isStatic: true, render: { fillStyle: '#334155' } })

    World.add(engine.world, [
      wall(5, H / 2, 10, H), wall(W - 5, H / 2, 10, H), wall(W / 2, H + 5, W, 10),
      goal, crossbar, postL, postR,
      plunger, channel,
      bumperL, bumperR, flipL, flipR,
      ...buildPegs()
    ])

    Events.on(engine, 'collisionStart', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        const labels = [bodyA.label, bodyB.label]
        if (labels.includes('goal') && labels.includes('ball')) {
          setScore(s => s + 1)
          setGoalMsg(true)
          onGoal && onGoal()
          setTimeout(() => { setGoalMsg(false); resetBall() }, 1600)
        }
      })
    })

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    return () => {
      Render.stop(render); Runner.stop(runner)
      World.clear(engine.world); Engine.clear(engine)
    }
  }, [])

  function spawnBall() {
    if (ballRef.current) Matter.World.remove(engineRef.current.world, ballRef.current)
    const b = Matter.Bodies.circle(W - 28, H - 175, BALL_R, {
      label: 'ball', restitution: 0.65, friction: 0.01, density: 0.003,
      render: { fillStyle: '#f1f5f9' }
    })
    ballRef.current = b
    Matter.World.add(engineRef.current.world, b)
  }

  function setPullLevel(pct) {
    const p = Math.min(100, Math.max(0, pct))
    pullRef.current = p
    setPull(p)
    const baseY = H - 90
    Matter.Body.setPosition(plungerRef.current, { x: W - 28, y: baseY + (p / 100) * 85 })
  }

  // Pointer handlers
  function onDown(e) {
    if (!canPlay || inPlay) return
    dragging.current = true
    const rect = canvasRef.current.getBoundingClientRect()
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    dragStartY.current = cy - rect.top
    spawnBall()
  }

  function onMove(e) {
    if (!dragging.current) return
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    const delta = (cy - rect.top) - dragStartY.current
    const pct = (delta / 85) * 100
    setPullLevel(pct)
    if (ballRef.current) {
      Matter.Body.setPosition(ballRef.current, { x: W - 28, y: H - 175 + (pct / 100) * 55 })
      Matter.Body.setVelocity(ballRef.current, { x: 0, y: 0 })
    }
  }

  function onUp() {
    if (!dragging.current) return
    dragging.current = false
    const p = pullRef.current
    setPullLevel(0)
    if (ballRef.current && p > 8) {
      setInPlay(true)
      const power = (p / 100) * 22
      Matter.Body.setVelocity(ballRef.current, {
        x: -1.5 + Math.random() * 3,
        y: -power
      })
    } else {
      resetBall()
    }
  }

  const pullColor = pull > 70 ? '#ef4444' : pull > 40 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ position: 'relative', display: 'inline-block', userSelect: 'none' }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        padding: '0 14px', zIndex: 10, pointerEvents: 'none'
      }}>
        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 17 }}>⚽ {score}</span>
        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 17 }}>💰 {credits}</span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef} width={W} height={H}
        style={{ display: 'block', borderRadius: 14, cursor: canPlay && !inPlay ? 'grab' : 'default' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      />

      {/* Power bar */}
      <div style={{
        position: 'absolute', bottom: 18, right: 6,
        width: 8, height: 90, background: '#1e293b',
        borderRadius: 6, overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', bottom: 0, width: '100%',
          height: `${pull}%`, background: pullColor,
          transition: 'height 0.04s, background 0.2s', borderRadius: 6
        }} />
      </div>

      {/* Hint */}
      {!inPlay && canPlay && pull === 0 && (
        <div style={{
          position: 'absolute', bottom: 24, left: 14, right: 50,
          color: '#64748b', fontSize: 12, pointerEvents: 'none'
        }}>
          ↕ Arrastra para cargar
        </div>
      )}

      {/* ¡GOOOL! overlay */}
      {goalMsg && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 20
        }}>
          <div style={{
            background: '#22c55e', color: '#fff', padding: '16px 32px',
            borderRadius: 16, fontSize: 32, fontWeight: 900,
            boxShadow: '0 0 40px rgba(34,197,94,0.7)',
            animation: 'none'
          }}>⚽ ¡GOOOL!</div>
        </div>
      )}

      {/* Locked overlay */}
      {!canPlay && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
          borderRadius: 14, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 30
        }}>
          <span style={{ fontSize: 52 }}>⚽</span>
          <span style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 600 }}>Carga créditos para jugar</span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>1 MXN = 1 crédito</span>
        </div>
      )}
    </div>
  )
}
