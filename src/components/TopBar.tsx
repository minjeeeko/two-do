import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

export function TopBar({
  title,
  back = false,
  right,
}: {
  title: string
  back?: boolean
  right?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 w-full max-w-md mx-auto bg-paper/90 backdrop-blur safe-top">
      <div className="flex items-center h-14 px-3">
        <div className="w-9 flex items-center">
          {back && (
            <button
              onClick={() => navigate(-1)}
              aria-label="뒤로"
              className="h-9 w-9 flex items-center justify-center rounded-full text-ink-2 active:bg-line-soft"
            >
              <ChevronLeftIcon size={22} />
            </button>
          )}
        </div>
        <h1 className="flex-1 text-center text-[15px] font-bold text-ink truncate">{title}</h1>
        <div className="w-9 flex items-center justify-end">{right}</div>
      </div>
    </header>
  )
}
