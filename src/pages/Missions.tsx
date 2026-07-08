import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { missionsForCouple, userDoneDates } from '../lib/selectors'
import { calcStreak } from '../lib/date'
import { Button, Card, Chip, EmptyState, StatusPill } from '../components/ui'
import { FlameIcon, LockIcon, EyeIcon, PlusIcon } from '../components/icons'
import { interestLabel } from '../lib/catalog'

export function Missions() {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const missions = missionsForCouple(state)
  const [tab, setTab] = useState<'all' | 'personal' | 'couple'>('all')

  const filtered = missions.filter((m) => tab === 'all' || m.ownerType === tab)
  const active = filtered.filter((m) => !(m.endDate && m.endDate < new Date().toISOString().slice(0, 10)))
  const completed = filtered.filter((m) => m.endDate && m.endDate < new Date().toISOString().slice(0, 10))

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[19px] font-bold text-ink">미션</h1>
        <Link to="/missions/new">
          <Button size="sm">
            <PlusIcon size={15} />새 미션
          </Button>
        </Link>
      </div>

      <div className="flex gap-1.5 mb-4">
        <Chip active={tab === 'all'} onClick={() => setTab('all')}>
          전체
        </Chip>
        <Chip active={tab === 'personal'} onClick={() => setTab('personal')}>
          개인
        </Chip>
        <Chip active={tab === 'couple'} onClick={() => setTab('couple')}>
          커플
        </Chip>
      </div>

      {active.length === 0 && (
        <EmptyState title="아직 미션이 없어요" desc="첫 미션을 만들고 오늘부터 리듬을 시작해보세요" />
      )}

      <div className="space-y-2.5">
        {active.map((m) => {
          const streak = calcStreak(userDoneDates(state, currentUserId, m.id))
          const visibility = state.privacy.missionOverrides[m.id] ?? m.visibility
          return (
            <Link key={m.id} to={`/missions/${m.id}`}>
              <Card className="p-4 active:bg-paper transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[14.5px] font-bold text-ink truncate">{m.title}</p>
                      {m.ownerType === 'couple' && <StatusPill tone="brand">우리</StatusPill>}
                      {m.fromTemplateId && <StatusPill tone="neutral">추천에서 생성됨</StatusPill>}
                    </div>
                    <p className="text-[12px] text-ink-muted mt-1">
                      #{interestLabel(m.category)} ·{' '}
                      {m.frequency.type === 'daily' ? '매일' : `주 ${m.frequency.timesPerWeek}회`}
                    </p>
                  </div>
                  <span className="text-ink-faint shrink-0" title={visibility}>
                    {visibility === 'private' ? <LockIcon size={15} /> : visibility === 'detail' ? <EyeIcon size={15} /> : null}
                  </span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 mt-2.5 text-[12px] font-semibold text-streak">
                    <FlameIcon size={14} />
                    {streak}일 연속
                  </div>
                )}
              </Card>
            </Link>
          )
        })}
      </div>

      {completed.length > 0 && (
        <div className="mt-7">
          <p className="text-[12.5px] font-bold text-ink-muted mb-2.5">종료된 미션</p>
          <div className="space-y-2">
            {completed.map((m) => (
              <Link key={m.id} to={`/missions/${m.id}`}>
                <Card className="p-3.5 opacity-60">
                  <p className="text-[13.5px] font-semibold text-ink truncate">{m.title}</p>
                  <p className="text-[11.5px] text-ink-faint mt-0.5">{m.endDate}에 종료됨</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
