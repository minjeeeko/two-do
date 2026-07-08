import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import {
  coupleBothActiveDates,
  coupleStreak,
  countsByDate,
  missionsForCouple,
  userDoneDates,
  userStreak,
  weeklyBuckets,
} from '../lib/selectors'
import { calcRateOverDays, lastNDays, startOfWeekStr, todayStr } from '../lib/date'
import { Avatar, Card, ProgressBar, SectionTitle, StatusPill } from '../components/ui'
import { CalendarMonth } from '../components/CalendarMonth'
import { FlameIcon } from '../components/icons'

function MiniBarChart({ data, colorClass }: { data: { start: string; count: number }[]; colorClass: string }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((d) => (
        <div key={d.start} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className={`w-full rounded-t-sm ${colorClass}`}
            style={{ height: `${Math.max(4, (d.count / max) * 64)}px` }}
          />
          <span className="text-[9.5px] text-ink-faint">{d.start.slice(5).replace('-', '/')}</span>
        </div>
      ))}
    </div>
  )
}

function MyRoom() {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const missions = missionsForCouple(state).filter(
    (m) => m.ownerType === 'couple' || m.ownerUserId === currentUserId
  )
  const doneDates = userDoneDates(state, currentUserId)
  const myCheckins = Object.values(state.checkins).filter((c) => c.userId === currentUserId)
  const streak = userStreak(state, currentUserId)
  const rate30 = calcRateOverDays(doneDates, 30)
  const points = state.pointsLog
    .filter((p) => p.scope === 'personal' && p.userId === currentUserId)
    .reduce((s, p) => s + p.amount, 0)
  const myCounts = countsByDate(myCheckins)
  const weekly = weeklyBuckets(doneDates, 8)

  const goalMissions = missions.filter((m) => m.endDate)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="p-3.5 text-center">
          <p className="text-[19px] font-bold text-ink">{rate30}%</p>
          <p className="text-[11px] text-ink-faint mt-0.5">30일 성공률</p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-[19px] font-bold text-streak flex items-center justify-center gap-1">
            <FlameIcon size={15} />
            {streak}
          </p>
          <p className="text-[11px] text-ink-faint mt-0.5">연속 달성일</p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-[19px] font-bold text-reward">{points}</p>
          <p className="text-[11px] text-ink-faint mt-0.5">포인트</p>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle>내 달력</SectionTitle>
        <CalendarMonth countsByDate={myCounts} />
      </Card>

      <Card className="p-4">
        <SectionTitle>최근 8주</SectionTitle>
        <MiniBarChart data={weekly} colorClass="bg-streak" />
      </Card>

      {goalMissions.length > 0 && (
        <Card className="p-4">
          <SectionTitle>목표 대비 진행률</SectionTitle>
          <div className="space-y-3.5">
            {goalMissions.map((m) => {
              const totalDays = Math.max(
                1,
                Math.round((new Date(m.endDate!).getTime() - new Date(m.startDate).getTime()) / 86400000)
              )
              const doneCount = Object.values(state.checkins).filter(
                (c) => c.missionId === m.id && c.userId === currentUserId
              ).length
              const pct = Math.min(100, Math.round((doneCount / totalDays) * 100))
              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-ink-2 truncate">{m.title}</span>
                    <span className="text-[11.5px] text-ink-faint shrink-0 ml-2">
                      목표 {totalDays}일 / 현재 {doneCount}일
                    </span>
                  </div>
                  <ProgressBar value={pct} tone="brand" />
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function LivingRoomCalendar() {
  const state = useAppStore()
  const couple = state.couple!
  const [a, b] = couple.memberIds
  const bothActive = coupleBothActiveDates(state)
  const streak = coupleStreak(state)
  const allCheckins = Object.values(state.checkins)
  const coupleCounts = countsByDate(allCheckins)

  const coupleMissions = missionsForCouple(state).filter((m) => m.ownerType === 'couple')
  const weekStart = startOfWeekStr(todayStr())
  let targetSum = 0
  let doneSum = 0
  for (const m of coupleMissions) {
    const target = m.frequency.type === 'daily' ? 7 : (m.frequency.timesPerWeek ?? 1)
    targetSum += target
    const doneThisWeek = allCheckins.filter(
      (c) => c.missionId === m.id && c.date >= weekStart && lastNDays(7).includes(c.date)
    ).length
    doneSum += Math.min(target, doneThisWeek)
  }
  const teamGoalRate = targetSum > 0 ? Math.round((doneSum / targetSum) * 100) : 0

  const reactionCount = Object.keys(state.reactions).length
  const cheerCount = Object.keys(state.cheers).length
  const cooperationIndex =
    allCheckins.length > 0 ? Math.min(100, Math.round(((reactionCount + cheerCount) / allCheckins.length) * 100)) : 0

  const aCount = allCheckins.filter((c) => c.userId === a).length
  const bCount = allCheckins.filter((c) => c.userId === b).length
  const maxCount = Math.max(1, aCount, bCount)

  const weekly = weeklyBuckets(bothActive, 8)
  const couplePoints = state.pointsLog.filter((p) => p.scope === 'couple').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <FlameIcon size={16} className="text-streak" />
            우리 streak {streak}일
          </span>
          <StatusPill tone="reward">{couplePoints}P · Lv.{couple.level}</StatusPill>
        </div>
        <CalendarMonth countsByDate={coupleCounts} />
      </Card>

      <div className="grid grid-cols-2 gap-2.5">
        <Card className="p-3.5 text-center">
          <p className="text-[19px] font-bold text-brand">{teamGoalRate}%</p>
          <p className="text-[11px] text-ink-faint mt-0.5">이번 주 팀 목표 달성률</p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-[19px] font-bold text-cheer">{cooperationIndex}%</p>
          <p className="text-[11px] text-ink-faint mt-0.5">협력 지수</p>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle>이번 주 우리 기록</SectionTitle>
        <div className="space-y-3">
          {[
            { id: a, count: aCount },
            { id: b, count: bCount },
          ].map(({ id, count }) => (
            <div key={id} className="flex items-center gap-2.5">
              <Avatar label={state.users[id]?.nickname ?? ''} size={26} tone={id === a ? 'brand' : 'cheer'} />
              <span className="text-[12.5px] font-semibold text-ink-2 w-12 shrink-0">{state.users[id]?.nickname}</span>
              <div className="flex-1">
                <ProgressBar value={(count / maxCount) * 100} tone={id === a ? 'brand' : 'cheer'} />
              </div>
              <span className="text-[12px] text-ink-faint w-14 text-right">{count}회 기록</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-ink-faint mt-3">경쟁이 아니라 서로의 리듬을 확인하는 용도예요</p>
      </Card>

      <Card className="p-4">
        <SectionTitle>월간 하이라이트</SectionTitle>
        <MiniBarChart data={weekly} colorClass="bg-brand" />
      </Card>
    </div>
  )
}

export function Garden() {
  const [tab, setTab] = useState<'me' | 'us'>('me')

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="text-[19px] font-bold text-ink mb-4">잔디</h1>
      <div className="flex gap-1.5 mb-5 bg-line-soft rounded-full p-1">
        <button
          onClick={() => setTab('me')}
          className={`flex-1 h-9 rounded-full text-[13px] font-bold transition-colors ${
            tab === 'me' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-muted'
          }`}
        >
          내 방
        </button>
        <button
          onClick={() => setTab('us')}
          className={`flex-1 h-9 rounded-full text-[13px] font-bold transition-colors ${
            tab === 'us' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-muted'
          }`}
        >
          거실 달력
        </button>
      </div>
      {tab === 'me' ? <MyRoom /> : <LivingRoomCalendar />}
    </div>
  )
}
