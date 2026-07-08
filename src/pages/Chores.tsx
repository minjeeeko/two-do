import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { choreCountsByDate, choresForDate } from '../lib/selectors'
import { CalendarMonth } from '../components/CalendarMonth'
import { ChoreCard } from '../components/ChoreCard'
import { AddChoreSheet } from '../components/AddChoreSheet'
import { Button, Card, EmptyState } from '../components/ui'
import { PlusIcon } from '../components/icons'
import { formatKoreanDate, formatWeekday, todayStr } from '../lib/date'

export function Chores() {
  const location = useLocation()
  const initialDate = new URLSearchParams(location.search).get('date') || todayStr()
  const state = useAppStore()

  const [selected, setSelected] = useState(initialDate)
  const [tab, setTab] = useState<'personal' | 'together'>('personal')
  const [sheetOpen, setSheetOpen] = useState(false)

  const counts = choreCountsByDate(state)
  const dayChores = choresForDate(state, selected)
  const personalChores = dayChores.filter((c) => c.ownerType === 'personal')
  const togetherChores = dayChores.filter((c) => c.ownerType === 'together')
  const shown = tab === 'personal' ? personalChores : togetherChores
  const doneCount = shown.filter((c) => c.completed).length

  return (
    <div className="px-4 pt-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[19px] font-bold text-ink">할 일</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <PlusIcon size={15} />
          할 일 추가하기
        </Button>
      </div>

      {/* Calendar */}
      <Card className="p-4 mb-5">
        <CalendarMonth countsByDate={counts} selected={selected} onSelect={setSelected} />
      </Card>

      {/* Selected date */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-bold text-ink">
          {formatKoreanDate(selected)} <span className="text-[12.5px] text-ink-faint font-normal">({formatWeekday(selected)})</span>
        </h2>
        <span className="text-[12px] text-ink-muted">
          완료 {doneCount}/{shown.length}
        </span>
      </div>

      {/* personal / together tabs */}
      <div className="flex gap-1.5 mb-4 bg-line-soft rounded-full p-1">
        <button
          onClick={() => setTab('personal')}
          className={`flex-1 h-9 rounded-full text-[13px] font-bold transition-colors ${
            tab === 'personal' ? 'bg-canvas text-info shadow-sm' : 'text-ink-muted'
          }`}
        >
          개인 {personalChores.length > 0 && `(${personalChores.length})`}
        </button>
        <button
          onClick={() => setTab('together')}
          className={`flex-1 h-9 rounded-full text-[13px] font-bold transition-colors ${
            tab === 'together' ? 'bg-canvas text-brand-dark shadow-sm' : 'text-ink-muted'
          }`}
        >
          같이 {togetherChores.length > 0 && `(${togetherChores.length})`}
        </button>
      </div>

      <div className="space-y-2.5">
        {shown.length === 0 ? (
          <EmptyState
            title={tab === 'personal' ? '개인 할 일이 없어요' : '같이 할 일이 없어요'}
            desc="할 일 추가하기로 오늘 할 일을 등록해보세요"
          />
        ) : (
          shown.map((c) => <ChoreCard key={c.id} chore={c} />)
        )}
      </div>

      <AddChoreSheet open={sheetOpen} onClose={() => setSheetOpen(false)} date={selected} />
    </div>
  )
}
