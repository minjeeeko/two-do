import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div className="w-full bg-info-soft text-info text-[12.5px] font-semibold text-center py-2 px-4 safe-top">
      오프라인이에요 · 기록은 저장해두었다가 연결되면 자동으로 동기화할게요
    </div>
  )
}
