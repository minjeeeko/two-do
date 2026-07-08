import { useEffect, useRef } from 'react'
import type { GrassDay } from '../lib/selectors'
import { formatKoreanDate } from '../lib/date'

const levelClass: Record<GrassDay['level'], string> = {
  0: 'bg-grass-0',
  1: 'bg-grass-1',
  2: 'bg-grass-2',
  3: 'bg-grass-3',
  4: 'bg-grass-4',
}

function toWeeks(days: GrassDay[]): (GrassDay | null)[][] {
  if (!days.length) return []
  const firstDow = new Date(days[0].date + 'T00:00:00').getDay()
  const padded: (GrassDay | null)[] = Array(firstDow).fill(null).concat(days)
  const weeks: (GrassDay | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))
  return weeks
}

export function GrassHeatmap({ days, cellSize = 12 }: { days: GrassDay[]; cellSize?: number }) {
  const weeks = toWeeks(days)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [days.length])

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <div className="flex gap-[3px] w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={di}
                    title={`${formatKoreanDate(day.date)} · ${day.count}회`}
                    className={`rounded-[3px] ${levelClass[day.level]}`}
                    style={{ width: cellSize, height: cellSize }}
                  />
                ) : (
                  <div key={di} style={{ width: cellSize, height: cellSize }} />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 mt-2.5 text-[11px] text-ink-faint">
        <span>적음</span>
        {([0, 1, 2, 3, 4] as const).map((lvl) => (
          <div key={lvl} className={`rounded-[3px] ${levelClass[lvl]}`} style={{ width: 10, height: 10 }} />
        ))}
        <span>많음</span>
      </div>
    </div>
  )
}
