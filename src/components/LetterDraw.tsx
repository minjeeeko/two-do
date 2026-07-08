import { useEffect, useRef, useState } from 'react'
import { Button } from './ui'
import { XIcon } from './icons'

const PEN_COLORS = ['#2b2129', '#ff5c8a', '#ff8a5c', '#54b087', '#5fa3d6', '#8b6ee0']
const BG = '#fffdf8'

export function LetterDraw({
  open,
  onClose,
  onSend,
}: {
  open: boolean
  onClose: () => void
  onSend: (dataUrl: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState(PEN_COLORS[1])
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctxRef.current = ctx
    setHasDrawn(false)
  }, [open])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current
    if (!ctx) return
    canvasRef.current!.setPointerCapture(e.pointerId)
    drawing.current = true
    const { x, y } = pos(e)
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x, y)
    // dot for a tap
    ctx.lineTo(x + 0.1, y + 0.1)
    ctx.stroke()
    setHasDrawn(true)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const end = () => {
    drawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasDrawn(false)
  }

  const send = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return
    onSend(canvas.toDataURL('image/png'))
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button aria-label="닫기" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-canvas rounded-t-xl shadow-sheet animate-domo-rise safe-bottom">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line-soft">
          <h3 className="text-[16px] font-bold text-ink">손편지 그리기</h3>
          <button onClick={onClose} aria-label="닫기" className="h-9 w-9 flex items-center justify-center rounded-full text-ink-muted active:bg-line-soft">
            <XIcon size={20} />
          </button>
        </div>

        <div className="px-5 py-4">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="w-full h-[240px] rounded-lg border border-line touch-none"
            style={{ touchAction: 'none', backgroundColor: BG }}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {PEN_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`색상 ${c}`}
                  className="h-7 w-7 rounded-full border-2 transition-transform active:scale-90"
                  style={{ backgroundColor: c, borderColor: color === c ? '#2b2129' : 'transparent' }}
                />
              ))}
            </div>
            <button onClick={clear} className="text-[12.5px] text-ink-muted underline underline-offset-2">
              지우기
            </button>
          </div>

          <Button className="w-full mt-4" size="lg" onClick={send} disabled={!hasDrawn}>
            홈으로 보내기
          </Button>
          <p className="text-[11.5px] text-ink-faint text-center mt-2">상대의 홈 화면에 손편지가 붙어요</p>
        </div>
      </div>
    </div>
  )
}
