import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui'
import { MISSION_TEMPLATES, interestLabel } from '../../lib/catalog'

export function FirstMissionStep() {
  const users = useAppStore((s) => s.users)
  const couple = useAppStore((s) => s.couple)
  const addMissionFromTemplate = useAppStore((s) => s.addMissionFromTemplate)
  const finishOnboarding = useAppStore((s) => s.finishOnboarding)
  const [hidden, setHidden] = useState<string[]>([])
  const [addedId, setAddedId] = useState<string | null>(null)

  const commonCategories = useMemo(() => {
    if (!couple) return new Set<string>()
    const [a, b] = couple.memberIds
    const ua = new Set(users[a]?.interests ?? [])
    const ub = new Set(users[b]?.interests ?? [])
    return new Set([...ua].filter((k) => ub.has(k)))
  }, [users, couple])

  const recommended = MISSION_TEMPLATES.filter(
    (t) => t.requiresCategories.some((c) => commonCategories.has(c)) && !hidden.includes(t.id)
  )

  return (
    <div className="animate-domo-rise">
      {commonCategories.size > 0 && (
        <div className="rounded-md bg-streak-soft px-3.5 py-2.5 mb-4 flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-semibold text-streak">둘 다 관심있어요</span>
          {[...commonCategories].map((c) => (
            <span key={c} className="text-[12px] text-streak">
              #{interestLabel(c)}
            </span>
          ))}
        </div>
      )}

      <p className="text-[13px] text-ink-muted mb-4 leading-relaxed">
        같이 해볼까요? 부담 없이 하나만 골라봐요. 나중에 더 추가할 수 있어요.
      </p>

      <div className="space-y-3">
        {recommended.length === 0 && (
          <p className="text-[13px] text-ink-muted py-6 text-center">추천할 공통 관심사가 아직 없어요. 나중에 미션 탭에서 직접 만들 수 있어요.</p>
        )}
        {recommended.map((t) => (
          <div key={t.id} className="rounded-lg border border-line p-4">
            <p className="text-[14.5px] font-bold text-ink">{t.title}</p>
            <p className="text-[12.5px] text-ink-muted mt-1 leading-relaxed">{t.description}</p>
            <p className="text-[11.5px] text-ink-faint mt-1.5">
              {t.frequency.type === 'daily' ? '매일' : `주 ${t.frequency.timesPerWeek}회`}
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1"
                disabled={addedId === t.id}
                onClick={() => {
                  addMissionFromTemplate(t.id)
                  setAddedId(t.id)
                }}
              >
                {addedId === t.id ? '추가됨' : '같이 해볼까요?'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setHidden((h) => [...h, t.id])}>
                나중에
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full mt-8" size="lg" onClick={finishOnboarding}>
        우리 집으로 들어가기
      </Button>
    </div>
  )
}
