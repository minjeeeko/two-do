import { useState } from 'react'
import { Button } from './ui'

export function ConfirmDialog({
  open,
  title,
  desc,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  requirePhrase,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  desc?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  /** if set, user must type this exact phrase to enable confirm (2-step safety) */
  requirePhrase?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const [typed, setTyped] = useState('')
  if (!open) return null
  const locked = !!requirePhrase && typed.trim() !== requirePhrase

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <button aria-label="닫기" className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div className="relative w-full max-w-[320px] rounded-lg bg-canvas p-5 shadow-sheet animate-domo-pop">
        <h3 className="text-[16px] font-bold text-ink mb-1.5">{title}</h3>
        {desc && <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">{desc}</p>}
        {requirePhrase && (
          <div className="mt-3">
            <p className="text-[12px] text-ink-muted mb-1.5">
              계속하려면 <span className="font-bold text-ink">'{requirePhrase}'</span>를 입력하세요
            </p>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full h-10 rounded-sm border border-line px-3 text-[14px] outline-none focus:border-brand"
              placeholder={requirePhrase}
            />
          </div>
        )}
        <div className="flex gap-2 mt-5">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            className="flex-1"
            disabled={locked}
            onClick={() => {
              setTyped('')
              onConfirm()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
