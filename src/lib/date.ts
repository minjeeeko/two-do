export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function daysAgoStr(n: number, from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() - n)
  return toDateStr(d)
}

export function addDaysStr(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export function isSameOrBefore(a: string, b: string): boolean {
  return a <= b
}

export function startOfWeekStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day // week starts Monday
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

export function lastNDays(n: number, endDateStr: string = todayStr()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDaysStr(endDateStr, -i))
  }
  return out
}

export function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function formatWeekday(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const d = new Date(dateStr + 'T00:00:00')
  return days[d.getDay()]
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diffSec = Math.max(0, Math.floor((now - t) / 1000))
  if (diffSec < 60) return '방금 전'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  return formatKoreanDate(toDateStr(new Date(t)))
}

/** Current streak: consecutive days up to today (or yesterday if today not done yet) with at least one completion in `doneDates`. */
export function calcStreak(doneDates: Set<string>, endDateStr: string = todayStr()): number {
  let streak = 0
  let cursor = endDateStr
  if (!doneDates.has(cursor)) {
    cursor = addDaysStr(cursor, -1)
  }
  while (doneDates.has(cursor)) {
    streak++
    cursor = addDaysStr(cursor, -1)
  }
  return streak
}

export function calcWeeklyRate(doneDates: Set<string>, endDateStr: string = todayStr()): number {
  return calcRateOverDays(doneDates, 7, endDateStr)
}

export function calcRateOverDays(doneDates: Set<string>, n: number, endDateStr: string = todayStr()): number {
  const days = lastNDays(n, endDateStr)
  const done = days.filter((d) => doneDates.has(d)).length
  return Math.round((done / n) * 100)
}
