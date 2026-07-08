import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Avatar, Card, StatusPill } from '../components/ui'
import {
  BellIcon,
  ChevronRightIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from '../components/icons'
import { interestLabel } from '../lib/catalog'

function Row({ to, icon, label, desc }: { to: string; icon: ReactNode; label: string; desc?: string }) {
  return (
    <Link to={to}>
      <div className="flex items-center gap-3 py-3.5 border-b border-line-soft last:border-0 active:bg-paper">
        <div className="h-9 w-9 rounded-full bg-line-soft flex items-center justify-center text-ink-2 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-ink">{label}</p>
          {desc && <p className="text-[11.5px] text-ink-faint mt-0.5">{desc}</p>}
        </div>
        <ChevronRightIcon size={18} className="text-ink-faint shrink-0" />
      </div>
    </Link>
  )
}

export function Me() {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const user = state.users[currentUserId]
  const couple = state.couple!

  const points = state.pointsLog
    .filter((p) => p.scope === 'personal' && p.userId === currentUserId)
    .reduce((s, p) => s + p.amount, 0)
  const badgeCount = Object.values(state.badges).filter(
    (b) => b.userId === currentUserId || b.scope === 'couple'
  ).length

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="text-[19px] font-bold text-ink mb-4">마이</h1>

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar label={user?.nickname ?? ''} size={48} tone="brand" />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-ink">{user?.nickname}</p>
            <p className="text-[12px] text-ink-muted mt-0.5">{couple.name}</p>
          </div>
          <StatusPill tone="reward">Lv.{couple.level}</StatusPill>
        </div>
        {user?.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {user.interests.map((k) => (
              <StatusPill key={k} tone="neutral">
                #{interestLabel(k)}
              </StatusPill>
            ))}
          </div>
        )}
      </Card>

      <Link to="/me/rewards">
        <Card className="p-4 mb-6 flex items-center justify-between active:bg-paper">
          <div>
            <p className="text-[13.5px] font-bold text-ink">포인트 &amp; 뱃지</p>
            <p className="text-[12px] text-ink-muted mt-0.5">
              {points}포인트 · 뱃지 {badgeCount}개
            </p>
          </div>
          <div className="flex items-center gap-1 text-reward">
            <SparkleIcon size={20} />
            <ChevronRightIcon size={18} className="text-ink-faint" />
          </div>
        </Card>
      </Link>

      <Card className="px-4">
        <Row to="/me/privacy" icon={<ShieldIcon size={18} />} label="공개 범위 설정" desc="요약 / 상세 / 비공개" />
        <Row to="/me/notifications" icon={<BellIcon size={18} />} label="알림 설정" desc="응원과 리마인드 알림" />
        <Row to="/me/couple" icon={<UsersIcon size={18} />} label="우리 연결 관리" desc="연결 해제 및 재연결" />
        <Row to="/me/policy" icon={<ShieldIcon size={18} />} label="개인정보 처리방침" />
      </Card>

      <Link to="/onboarding" className="block mt-6 text-center text-[12.5px] text-ink-faint underline underline-offset-2">
        시작 가이드 다시 보기
      </Link>
    </div>
  )
}
