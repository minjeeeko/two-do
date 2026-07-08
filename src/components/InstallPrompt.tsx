import { useEffect, useState } from 'react'
import { Button } from './ui'
import { XIcon } from './icons'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'domo-install-dismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (isIOS()) {
      const t = setTimeout(() => setIosHint(true), 1500)
      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        clearTimeout(t)
      }
    }
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
    setIosHint(false)
  }

  if (!visible && !iosHint) return null

  return (
    <div className="absolute bottom-[64px] left-0 right-0 px-3 pb-2 z-40 animate-domo-rise">
      <div className="max-w-md mx-auto bg-ink text-canvas rounded-lg px-4 py-3 flex items-center gap-3 shadow-sheet">
        <div className="flex-1 text-[12.5px] leading-snug">
          {visible ? (
            <>
              <p className="font-bold">홈 화면에 DOMO 추가하기</p>
              <p className="text-canvas/70 mt-0.5">앱처럼 바로 열어볼 수 있어요</p>
            </>
          ) : (
            <>
              <p className="font-bold">홈 화면에 추가해보세요</p>
              <p className="text-canvas/70 mt-0.5">공유 버튼 → '홈 화면에 추가'를 눌러주세요</p>
            </>
          )}
        </div>
        {visible && (
          <Button
            size="sm"
            className="!bg-canvas !text-ink shrink-0"
            onClick={async () => {
              if (!deferred) return
              await deferred.prompt()
              await deferred.userChoice
              dismiss()
            }}
          >
            추가
          </Button>
        )}
        <button onClick={dismiss} aria-label="닫기" className="text-canvas/60 shrink-0">
          <XIcon size={16} />
        </button>
      </div>
    </div>
  )
}
