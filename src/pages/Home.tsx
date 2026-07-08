import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { coupleStreak, missionsForCouple, userWeeklyRate } from '../lib/selectors'
import { Avatar, Button, Card, Chip, EmptyState, ProgressBar, StatusPill } from '../components/ui'
import { CheckinCard } from '../components/CheckinCard'
import { CheckIcon, FlameIcon, GrassIcon, PlusIcon } from '../components/icons'
import { todayStr } from '../lib/date'
import type { Mission } from '../types'

function TodayMissionRow({ mission }: { mission: Mission }) {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const checkins = useAppStore((s) => s.checkins)
  const users = useAppStore((s) => s.users)
  const couple = useAppStore((s) => s.couple)!
  const checkIn = useAppStore((s) => s.checkIn)
  const today = todayStr()

  const myCheckin = Object.values(checkins).find(
    (c) => c.missionId === mission.id && c.userId === currentUserId && c.date === today
  )
  const partnerId = couple.memberIds.find((m) => m !== currentUserId)
  const partnerCheckin =
    mission.ownerType === 'couple' && partnerId
      ? Object.values(checkins).find((c) => c.missionId === mission.id && c.userId === partnerId && c.date === today)
      : undefined

  const isMine = mission.ownerType === 'couple' || mission.ownerUserId === currentUserId

  return (
    <div className="flex items-center gap-3 py-3 border-b border-line-soft last:border-0">
      <Link to={`/missions/${mission.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[14px] font-semibold text-ink truncate">{mission.title}</p>
          {mission.ownerType === 'couple' && <StatusPill tone="brand">우리</StatusPill>}
        </div>
        <p className="text-[11.5px] text-ink-faint mt-0.5">
          {mission.frequency.type === 'daily' ? '매일' : `주 ${mission.frequency.timesPerWeek}회`}
          {partnerCheckin && ` · ${users[partnerId!]?.nickname}님 완료`}
        </p>
      </Link>
      {isMine ? (
        <button
          onClick={() => !myCheckin && checkIn(mission.id, { method: 'check' })}
          disabled={!!myCheckin}
          className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
            myCheckin ? 'bg-streak border-streak text-white' : 'bg-canvas border-line text-ink-faint active:border-brand'
          }`}
          aria-label="인증하기"
        >
          <CheckIcon size={17} />
        </button>
      ) : (
        <Avatar label={users[partnerId ?? '']?.nickname ?? '?'} size={30} tone="cheer" />
      )}
    </div>
  )
}

export function Home() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const couple = useAppStore((s) => s.couple)!
  const users = useAppStore((s) => s.users)
  useAppStore((s) => s.missions)
  const missions = missionsForCouple(useAppStore.getState())
  const checkins = useAppStore((s) => s.checkins)
  const reactions = useAppStore((s) => s.reactions)
  const cheers = useAppStore((s) => s.cheers)
  const toggleReaction = useAppStore((s) => s.toggleReaction)
  const addCheer = useAppStore((s) => s.addCheer)

  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('today')
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'personal' | 'couple'>('all')

  const partnerId = couple.memberIds.find((m) => m !== currentUserId)!
  const streak = coupleStreak(useAppStore.getState())
  const weeklyRate = userWeeklyRate(useAppStore.getState(), currentUserId)

  const myMissionsToday = missions.filter((m) => m.ownerType === 'couple' || m.ownerUserId === currentUserId)
  const today = todayStr()
  const myDoneToday = myMissionsToday.filter((m) =>
    Object.values(checkins).some((c) => c.missionId === m.id && c.userId === currentUserId && c.date === today)
  ).length

  const partnerMissionsToday = missions.filter((m) => m.ownerType === 'couple' || m.ownerUserId === partnerId)
  const partnerDoneToday = partnerMissionsToday.filter((m) =>
    Object.values(checkins).some((c) => c.missionId === m.id && c.userId === partnerId && c.date === today)
  ).length

  const feed = useMemo(() => {
    let list = Object.values(checkins).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    if (filter === 'today') list = list.filter((c) => c.date === today)
    if (filter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      list = list.filter((c) => new Date(c.date) >= weekAgo)
    }
    if (ownerFilter !== 'all') {
      list = list.filter((c) => {
        const m = missions.find((mm) => mm.id === c.missionId)
        return m?.ownerType === ownerFilter
      })
    }
    return list.slice(0, 20)
  }, [checkins, filter, ownerFilter, missions, today])

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="mb-5">
        <p className="font-display text-[24px] text-ink leading-tight">{couple.name}</p>
        <p className="text-[13px] text-ink-muted mt-0.5">{couple.tagline}</p>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <FlameIcon size={18} className="text-streak" />
            <span className="text-[14px] font-bold text-ink">우리 streak {streak}일</span>
          </div>
          <StatusPill tone="reward">Lv.{couple.level}</StatusPill>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-ink-muted w-[72px] shrink-0">이번 주 나</span>
          <ProgressBar value={weeklyRate} tone="streak" />
          <span className="text-[11.5px] text-ink-muted w-8 text-right">{weeklyRate}%</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar label={users[currentUserId]?.nickname ?? ''} size={24} tone="brand" />
            <span className="text-[12.5px] font-semibold text-ink-2">{users[currentUserId]?.nickname}</span>
          </div>
          <p className="text-[20px] font-bold text-ink">
            {myDoneToday}
            <span className="text-[13px] text-ink-faint font-normal"> / {myMissionsToday.length}</span>
          </p>
          <p className="text-[11px] text-ink-faint mt-0.5">오늘 완료</p>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar label={users[partnerId]?.nickname ?? ''} size={24} tone="cheer" />
            <span className="text-[12.5px] font-semibold text-ink-2">{users[partnerId]?.nickname}</span>
          </div>
          <p className="text-[20px] font-bold text-ink">
            {partnerDoneToday}
            <span className="text-[13px] text-ink-faint font-normal"> / {partnerMissionsToday.length}</span>
          </p>
          <p className="text-[11px] text-ink-faint mt-0.5">오늘 완료</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[14.5px] font-bold text-ink">오늘의 리듬</h2>
          <Link to="/missions" className="text-[12px] text-ink-muted font-semibold">
            전체 미션
          </Link>
        </div>
        {myMissionsToday.length === 0 ? (
          <EmptyState
            icon={<GrassIcon size={28} />}
            title="아직 오늘 할 미션이 없어요"
            desc="미션 탭에서 첫 미션을 만들어보세요"
          />
        ) : (
          myMissionsToday.map((m) => <TodayMissionRow key={m.id} mission={m} />)
        )}
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-ink">최근 우리 기록</h2>
        <Link to="/missions/new">
          <Button size="sm" variant="outline">
            <PlusIcon size={15} />
            미션
          </Button>
        </Link>
      </div>

      <div className="flex gap-1.5 mb-3">
        <Chip active={filter === 'today'} onClick={() => setFilter('today')}>
          오늘
        </Chip>
        <Chip active={filter === 'week'} onClick={() => setFilter('week')}>
          이번 주
        </Chip>
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          전체
        </Chip>
        <div className="w-px bg-line-soft mx-0.5" />
        <Chip active={ownerFilter === 'couple'} onClick={() => setOwnerFilter(ownerFilter === 'couple' ? 'all' : 'couple')}>
          커플
        </Chip>
        <Chip
          active={ownerFilter === 'personal'}
          onClick={() => setOwnerFilter(ownerFilter === 'personal' ? 'all' : 'personal')}
        >
          개인
        </Chip>
      </div>

      <div className="space-y-3">
        {feed.length === 0 && <EmptyState title="아직 기록이 없어요" desc="오늘의 미션을 인증하면 여기에 쌓여요" />}
        {feed.map((c) => {
          const mission = missions.find((m) => m.id === c.missionId)
          if (!mission) return null
          return (
            <CheckinCard
              key={c.id}
              checkin={c}
              mission={mission}
              author={users[c.userId]}
              reactions={Object.values(reactions).filter((r) => r.checkinId === c.id)}
              cheers={Object.values(cheers).filter((ch) => ch.checkinId === c.id)}
              currentUserId={currentUserId}
              onToggleReaction={(emoji) => toggleReaction(c.id, emoji)}
              onAddCheer={(text) => addCheer(c.id, text)}
            />
          )
        })}
      </div>
    </div>
  )
}
