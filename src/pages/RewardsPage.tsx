import type { ComponentType } from 'react'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Card, ProgressBar, SectionTitle, StatusPill } from '../components/ui'
import { BADGE_CATALOG } from '../lib/catalog'
import { FlameIcon, HeartIcon, HouseIcon, SeedIcon, SparkleIcon, StarIcon } from '../components/icons'
import { formatRelativeTime } from '../lib/date'

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  flame: FlameIcon,
  sparkle: SparkleIcon,
  seed: SeedIcon,
  house: HouseIcon,
  heart: HeartIcon,
  star: StarIcon,
}

const LEVEL_STEP = 200

export function RewardsPage() {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const couple = state.couple!

  const personalPoints = state.pointsLog
    .filter((p) => p.scope === 'personal' && p.userId === currentUserId)
    .reduce((s, p) => s + p.amount, 0)

  const levelProgress = couple.points % LEVEL_STEP
  const levelPct = Math.round((levelProgress / LEVEL_STEP) * 100)

  const earnedByUser = Object.values(state.badges).filter(
    (b) => b.userId === currentUserId || b.scope === 'couple'
  )
  const earnedKeys = new Set(earnedByUser.map((b) => b.key))

  const history = [...state.pointsLog]
    .filter((p) => p.scope === 'couple' || p.userId === currentUserId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 12)

  return (
    <div>
      <TopBar title="포인트 & 뱃지" back />
      <div className="px-4 pb-10">
        <Card className="p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-bold text-ink-2">우리 집 분위기 레벨</span>
            <StatusPill tone="reward">Lv.{couple.level}</StatusPill>
          </div>
          <ProgressBar value={levelPct} tone="reward" />
          <p className="text-[11.5px] text-ink-faint mt-1.5">
            다음 레벨까지 {LEVEL_STEP - levelProgress}P · 우리 총 {couple.points}P
          </p>
          <p className="text-[12px] text-ink-2 mt-3">내 포인트 {personalPoints}P</p>
        </Card>

        <SectionTitle>뱃지</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {BADGE_CATALOG.map((b) => {
            const earned = earnedKeys.has(b.key)
            const Icon = ICONS[b.icon] ?? SparkleIcon
            return (
              <Card
                key={b.key}
                className={`p-3 flex flex-col items-center text-center gap-1.5 ${!earned ? 'opacity-40' : ''}`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    earned ? 'bg-reward-soft text-reward' : 'bg-line-soft text-ink-faint'
                  }`}
                >
                  <Icon size={19} />
                </div>
                <p className="text-[11.5px] font-bold text-ink leading-tight">{b.title}</p>
                <p className="text-[10px] text-ink-faint leading-tight">{b.description}</p>
              </Card>
            )
          })}
        </div>

        <SectionTitle>보상 히스토리</SectionTitle>
        <Card className="divide-y divide-line-soft">
          {history.length === 0 && <p className="text-[12.5px] text-ink-muted p-4 text-center">아직 기록이 없어요</p>}
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-ink-2">{h.reason}</p>
                <p className="text-[11px] text-ink-faint mt-0.5">{formatRelativeTime(h.createdAt)}</p>
              </div>
              <span className="text-[13px] font-bold text-reward">+{h.amount}P</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
