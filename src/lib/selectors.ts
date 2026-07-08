import type { AppNotification, Checkin, Mission, User } from '../types'
import { addDaysStr, calcStreak, calcWeeklyRate, startOfWeekStr, todayStr } from './date'
import type { useAppStore } from '../store/useAppStore'

type Store = ReturnType<typeof useAppStore.getState>

export function getPartner(state: Store, userId: string): User | undefined {
  if (!state.couple) return undefined
  const partnerId = state.couple.memberIds.find((m) => m !== userId)
  return partnerId ? state.users[partnerId] : undefined
}

export function missionsForCouple(state: Store): Mission[] {
  if (!state.couple) return []
  return Object.values(state.missions)
    .filter((m) => m.coupleId === state.couple!.id && !m.archived)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
}

export function checkinsForMission(state: Store, missionId: string): Checkin[] {
  return Object.values(state.checkins).filter((c) => c.missionId === missionId)
}

export function userDoneDates(state: Store, userId: string, missionId?: string): Set<string> {
  return new Set(
    Object.values(state.checkins)
      .filter((c) => c.userId === userId && (!missionId || c.missionId === missionId))
      .map((c) => c.date)
  )
}

export function userStreak(state: Store, userId: string): number {
  return calcStreak(userDoneDates(state, userId))
}

export function userWeeklyRate(state: Store, userId: string): number {
  return calcWeeklyRate(userDoneDates(state, userId))
}

export function coupleActiveDates(state: Store): Set<string> {
  // a day counts for the couple if EITHER member did at least one checkin (union),
  // used for the "우리 잔디" combined view
  return new Set(Object.values(state.checkins).map((c) => c.date))
}

export function coupleBothActiveDates(state: Store): Set<string> {
  if (!state.couple) return new Set()
  const [a, b] = state.couple.memberIds
  const da = userDoneDates(state, a)
  const db = userDoneDates(state, b)
  const out = new Set<string>()
  for (const d of da) if (db.has(d)) out.add(d)
  return out
}

export function coupleStreak(state: Store): number {
  return calcStreak(coupleBothActiveDates(state))
}

export function countsByDate(checkins: Checkin[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const c of checkins) m.set(c.date, (m.get(c.date) ?? 0) + 1)
  return m
}

export function unreadNotificationCount(state: Store, userId: string): number {
  return Object.values(state.notifications).filter((n) => n.userId === userId && !n.read).length
}

export function notificationsForUser(state: Store, userId: string): AppNotification[] {
  return Object.values(state.notifications)
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function isMissionDueToday(mission: Mission): boolean {
  if (mission.endDate && mission.endDate < todayStr()) return false
  return mission.startDate <= todayStr()
}

export function effectiveVisibility(state: Store, mission: Mission): string {
  return state.privacy.missionOverrides[mission.id] ?? mission.visibility
}

export function weeklyBuckets(
  doneDates: Set<string>,
  weeksCount: number,
  endDateStr: string = todayStr()
): { start: string; count: number }[] {
  const currentWeekStart = startOfWeekStr(endDateStr)
  const out: { start: string; count: number }[] = []
  for (let w = weeksCount - 1; w >= 0; w--) {
    const start = addDaysStr(currentWeekStart, -7 * w)
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = addDaysStr(start, i)
      if (d > endDateStr) break
      if (doneDates.has(d)) count++
    }
    out.push({ start, count })
  }
  return out
}
