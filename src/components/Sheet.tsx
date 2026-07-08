import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { XIcon } from './icons'

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-ink/35 animate-domo-rise"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-canvas rounded-t-xl shadow-sheet max-h-[88vh] overflow-y-auto animate-domo-rise safe-bottom">
        <div className="sticky top-0 bg-canvas flex items-center justify-between px-5 pt-4 pb-3 border-b border-line-soft">
          <h3 className="text-[16px] font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="h-9 w-9 flex items-center justify-center rounded-full text-ink-muted active:bg-line-soft"
          >
            <XIcon size={20} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
