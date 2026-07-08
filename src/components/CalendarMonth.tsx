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

/** Selectable month calendar; days with chores show a dot. */
export function CalendarMonth({
  countsByDate,
  selected,
  onSelect,
}: {
  countsByDate: Map<string, number>
  selected: string
  onSelect: (date: string) => void
}) {
  const today = todayStr()
  const initial = new Date((selected || today) + 'T00:00:00')
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() })

  const weeks = buildMonthMatrix(cursor.year, cursor.month)

  const goPrev = () =>
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
  const goNext = () =>
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))

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
        <p className="text-[14px] font-bold text-ink">
          {cursor.year}년 {cursor.month + 1}월
        </p>
        <button
          onClick={goNext}
          aria-label="다음 달"
          className="h-8 w-8 flex items-center justify-center rounded-full text-ink-muted active:bg-line-soft"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
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

      <div className="grid grid-cols-7 gap-[2px]">
        {weeks.flat().map((date, i) => {
          if (!date) return <div key={i} className="aspect-square" />
          const count = countsByDate.get(date) ?? 0
          const isToday = date === today
          const isSelected = date === selected
          const dow = new Date(date + 'T00:00:00').getDay()
          const dayNum = Number(date.slice(-2))
          const textColor = isSelected
            ? 'text-white'
            : dow === 0
              ? 'text-brand'
              : dow === 6
                ? 'text-info'
                : 'text-ink-2'
          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={`relative aspect-square rounded-[10px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isSelected ? 'bg-brand' : isToday ? 'bg-brand-soft' : 'active:bg-line-soft'
              }`}
            >
              <span className={`text-[12.5px] font-semibold ${textColor}`}>{dayNum}</span>
              {count > 0 && (
                <span
                  className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-brand'}`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
