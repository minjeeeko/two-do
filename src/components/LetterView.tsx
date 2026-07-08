import type { Letter } from '../types'
import { useAppStore } from '../store/useAppStore'
import { XIcon } from './icons'
import { formatRelativeTime } from '../lib/date'

export function LetterView({ letter, onClose }: { letter: Letter | null; onClose: () => void }) {
  const users = useAppStore((s) => s.users)
  if (!letter) return null
  const author = users[letter.userId]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <button aria-label="닫기" className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-[320px] animate-domo-pop">
        {/* polaroid */}
        <div className="bg-white rounded-lg p-3 pb-5 shadow-sheet -rotate-1">
          <img src={letter.imageDataUrl} alt="손편지" className="w-full rounded-sm bg-[#fffdf8]" />
          <p className="text-center text-[13px] font-bold text-ink mt-3">{author?.nickname}님의 손편지</p>
          <p className="text-center text-[11px] text-ink-faint mt-0.5">{formatRelativeTime(letter.createdAt)}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-canvas shadow-sheet flex items-center justify-center text-ink-2"
        >
          <XIcon size={18} />
        </button>
      </div>
    </div>
  )
}
