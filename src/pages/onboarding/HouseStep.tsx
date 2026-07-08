import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui'
import { TONE_OPTIONS } from '../../lib/catalog'
import type { Tone } from '../../types'

export function HouseStep() {
  const couple = useAppStore((s) => s.couple)
  const users = useAppStore((s) => s.users)
  const setupHouse = useAppStore((s) => s.setupHouse)

  const defaultName = couple
    ? `${Object.values(users)
        .map((u) => u.nickname)
        .join('&')}의 우리 집`
    : '우리 집'

  const [name, setName] = useState(defaultName)
  const [tagline, setTagline] = useState('오늘도 1%만, 같이 가자')
  const [tone, setTone] = useState<Tone>('bright')

  return (
    <div className="animate-domo-rise">
      <p className="text-[13px] text-ink-muted mb-5 leading-relaxed">
        우리만의 공간에 이름과 분위기를 붙여봐요. 언제든 나중에 바꿀 수 있어요.
      </p>

      <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">우리 집 이름</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-5"
      />

      <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">우리 한 줄</label>
      <input
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="예: 오늘도 1%만, 같이 가자"
        className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-5"
      />

      <label className="block text-[13px] font-semibold text-ink-2 mb-2">우리 톤</label>
      <div className="grid grid-cols-3 gap-2 mb-8">
        {TONE_OPTIONS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTone(t.key)}
            className={`rounded-md border p-3 text-left transition-colors ${
              tone === t.key ? 'border-brand bg-brand-soft' : 'border-line bg-canvas'
            }`}
          >
            <p className="text-[13px] font-bold text-ink">{t.label}</p>
            <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{t.desc}</p>
          </button>
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!name.trim() || !tagline.trim()}
        onClick={() => setupHouse(name.trim(), tagline.trim(), tone)}
      >
        다음
      </Button>
    </div>
  )
}
