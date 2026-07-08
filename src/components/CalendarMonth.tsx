import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'
import { todayStr } from '../lib/date'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function buildMonthMatrix(year: number, month: number): (string | null)[][] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${pad2(month + 1)}-${pad2(d)}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count >= 4) return 4
  if (count === 3) return 3
  if (count === 2) return 2
  if (count === 1) return 1
  return 0
}

const levelBg: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-cal-0',
  1: 'bg-cal-1',
  2: 'bg-cal-2',
  3: 'bg-cal-3',
  4: 'bg-cal-4',
}

const levelText: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'text-ink-faint',
  1: 'text-ink-2',
  2: 'text-ink-2',
  3: 'text-white',
  4: 'text-white',
}

export function CalendarMonth({ countsByDate }: { countsByDate: Map<string, number> }) {
  const today = todayStr()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })

  const weeks = buildMonthMatrix(cursor.year, cursor.month)
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth()
  const activeDaysThisMonth = weeks
    .flat()
    .filter((d): d is string => !!d && (countsByDate.get(d) ?? 0) > 0).length

  const goPrev = () => {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
  }
  const goNext = () => {
    if (isCurrentMonth) return
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          aria-label="이전 달"
          className="h-8 w-8 flex items-center justify-center rounded-full text-ink-muted active:bg-line-soft"
        >
          <ChevronLeftIcon size={18} />
        </button>
        <div className="text-center">
          <p className="text-[14px] font-bold text-ink">
            {cursor.year}년 {cursor.month + 1}월
          </p>
          <p className="text-[11px] text-ink-faint mt-0.5">이번 달 {activeDaysThisMonth}일 기록</p>
        </div>
        <button
          onClick={goNext}
          disabled={isCurrentMonth}
          aria-label="다음 달"
          className="h-8 w-8 flex items-center justify-center rounded-full text-ink-muted active:bg-line-soft disabled:opacity-30"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1.5">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-[11px] font-semibold py-1 ${
              i === 0 ? 'text-brand' : i === 6 ? 'text-info' : 'text-ink-faint'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {weeks.flat().map((date, i) => {
          if (!date) return <div key={i} className="aspect-square" />
          const count = countsByDate.get(date) ?? 0
          const level = levelFor(count)
          const isToday = date === today
          const dayNum = Number(date.slice(-2))
          return (
            <div
              key={date}
              title={`${date} · ${count}회`}
              className={`aspect-square rounded-[9px] flex items-center justify-center text-[12px] font-semibold ${levelBg[level]} ${levelText[level]} ${
                isToday ? 'ring-2 ring-brand ring-offset-1' : ''
              }`}
            >
              {dayNum}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-1 mt-3 text-[11px] text-ink-faint">
        <span>적음</span>
        {([0, 1, 2, 3, 4] as const).map((lvl) => (
          <div key={lvl} className={`rounded-full ${levelBg[lvl]}`} style={{ width: 10, height: 10 }} />
        ))}
        <span>많음</span>
      </div>
    </div>
  )
}
