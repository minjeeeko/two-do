import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Avatar, Card } from '../components/ui'
import { ChevronRightIcon, EditIcon, HeartIcon, ShieldIcon, SparkleIcon, UsersIcon } from '../components/icons'
import { formatKoreanDate } from '../lib/date'

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
  const startDate = couple.startDate ?? couple.connectedAt.slice(0, 10)

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="text-[19px] font-bold text-ink mb-4">마이</h1>

      {/* Profile */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar label={user?.nickname ?? ''} size={52} tone="brand" src={user?.avatarUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-ink">{user?.nickname}</p>
            <p className="text-[12px] text-ink-muted mt-0.5">{couple.name}</p>
          </div>
          <Link
            to="/me/profile"
            className="shrink-0 inline-flex items-center gap-1 rounded-full border border-line px-3 h-9 text-[12.5px] font-semibold text-ink-2 active:bg-paper"
          >
            <EditIcon size={14} />
            수정
          </Link>
        </div>
        <div className="flex items-center gap-1.5 mt-3.5 rounded-md bg-brand-soft/60 px-3 py-2">
          <HeartIcon size={14} className="text-brand-dark" />
          <span className="text-[12.5px] text-ink-2">
            함께 시작한 날 <span className="font-bold text-ink">{formatKoreanDate(startDate)}</span>
          </span>
        </div>
      </Card>

      {/* Report */}
      <Link to="/me/report">
        <Card className="p-4 mb-6 flex items-center justify-between active:bg-paper">
          <div>
            <p className="text-[13.5px] font-bold text-ink">리포트</p>
            <p className="text-[12px] text-ink-muted mt-0.5">주 · 월 단위 집안일 리포트 보기</p>
          </div>
          <div className="flex items-center gap-1 text-brand">
            <SparkleIcon size={20} />
            <ChevronRightIcon size={18} className="text-ink-faint" />
          </div>
        </Card>
      </Link>

      <Card className="px-4">
        <Row to="/me/couple" icon={<UsersIcon size={18} />} label="우리 연결 관리" desc="연결 해제 및 재연결" />
        <Row to="/me/policy" icon={<ShieldIcon size={18} />} label="개인정보 처리방침" />
      </Card>

      <Link to="/onboarding" className="block mt-6 text-center text-[12.5px] text-ink-faint underline underline-offset-2">
        시작 가이드 다시 보기
      </Link>
    </div>
  )
}
