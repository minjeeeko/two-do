import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { reportSummary } from '../lib/selectors'
import { TopBar } from '../components/TopBar'
import { Avatar, Card, ProgressBar, SectionTitle } from '../components/ui'
import { avatarColor } from '../lib/colors'

export function Report() {
  const state = useAppStore()
  const couple = state.couple!
  const [range, setRange] = useState<'week' | 'month'>('week')

  const summary = reportSummary(state, range)
  const [u1Id, u2Id] = couple.memberIds
  const u1 = summary.perUser(u1Id)
  const u2 = summary.perUser(u2Id)
  const rangeLabel = range === 'week' ? '최근 7일' : '최근 30일'

  return (
    <div>
      <TopBar title="리포트" back />
      <div className="px-4 pb-10">
        <div className="flex gap-1.5 mb-5 bg-line-soft rounded-full p-1">
          <button
            onClick={() => setRange('week')}
            className={`flex-1 h-9 rounded-full text-[13px] font-bold transition-colors ${
              range === 'week' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-muted'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setRange('month')}
            className={`flex-1 h-9 rounded-full text-[13px] font-bold transition-colors ${
              range === 'month' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-muted'
            }`}
          >
            월간
          </button>
        </div>

        {/* overall */}
        <Card className="p-5 mb-4 text-center">
          <p className="text-[12px] text-ink-muted mb-1">{rangeLabel} 완료율</p>
          <p className="text-[40px] font-bold text-brand leading-none">{summary.rate}%</p>
          <p className="text-[12.5px] text-ink-muted mt-2">
            총 {summary.total}개 중 {summary.done}개 완료
          </p>
          <div className="mt-3">
            <ProgressBar value={summary.rate} tone="brand" />
          </div>
        </Card>

        <SectionTitle>구성원별</SectionTitle>
        <Card className="p-4 mb-4 space-y-4">
          {[
            { id: u1Id, stat: u1 },
            { id: u2Id, stat: u2 },
          ].map(({ id, stat }) => {
            const rate = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0
            const c = avatarColor(state.users[id]?.colorTag)
            return (
              <div key={id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Avatar
                    label={state.users[id]?.nickname ?? ''}
                    size={24}
                    color={state.users[id]?.colorTag}
                    src={state.users[id]?.avatarUrl}
                  />
                  <span className="text-[13px] font-semibold text-ink-2 flex-1">{state.users[id]?.nickname}</span>
                  <span className="text-[12px] text-ink-faint">
                    {stat.done}/{stat.total} · {rate}%
                  </span>
                </div>
                <ProgressBar value={rate} color={c.solid} />
              </div>
            )
          })}
        </Card>

        <SectionTitle>같이 한 할 일</SectionTitle>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-ink-2">우리 함께</span>
            <span className="text-[12px] text-ink-faint">
              {summary.together.done}/{summary.together.total}
            </span>
          </div>
          <ProgressBar
            value={summary.together.total > 0 ? Math.round((summary.together.done / summary.together.total) * 100) : 0}
            tone="brand"
          />
          <p className="text-[11.5px] text-ink-faint mt-3">경쟁이 아니라 우리가 함께 쌓은 기록이에요</p>
        </Card>
      </div>
    </div>
  )
}
