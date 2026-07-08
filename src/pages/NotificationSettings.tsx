import type { ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Card, SectionTitle } from '../components/ui'
import type { NotificationSettings as NotifSettingsType } from '../types'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-brand' : 'bg-line'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-line-soft last:border-0">
      <div className="pr-4">
        <p className="text-[13.5px] font-semibold text-ink">{label}</p>
        {desc && <p className="text-[11.5px] text-ink-faint mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export function NotificationSettings() {
  const settings = useAppStore((s) => s.notifSettings)
  const update = useAppStore((s) => s.updateNotifSettings)

  const patch = (p: Partial<NotifSettingsType>) => update(p)

  return (
    <div>
      <TopBar title="알림 설정" back />
      <div className="px-4 pb-10">
        <div className="rounded-md bg-brand-soft px-3.5 py-3 mb-5 text-[12px] text-brand-dark leading-relaxed">
          DOMO는 응원 중심 알림만 보내요. 미인증을 추궁하거나 비교하는 알림은 기본적으로 제공하지 않아요.
        </div>

        <SectionTitle>알림 받기</SectionTitle>
        <Card className="px-4 mb-6">
          <ToggleRow
            label="푸시 알림"
            desc="기기 알림으로 받아요"
            checked={settings.pushEnabled}
            onChange={(v) => patch({ pushEnabled: v })}
          />
          <ToggleRow
            label="응원 · 격려"
            desc="이모지 반응, 짧은 격려 메시지"
            checked={settings.cheerEnabled}
            onChange={(v) => patch({ cheerEnabled: v })}
          />
          <ToggleRow
            label="연속 달성 (streak)"
            desc="연속 기록을 이어갔을 때"
            checked={settings.streakEnabled}
            onChange={(v) => patch({ streakEnabled: v })}
          />
          <ToggleRow
            label="뱃지 · 레벨업"
            desc="새 뱃지, 집 분위기 레벨업"
            checked={settings.badgeEnabled}
            onChange={(v) => patch({ badgeEnabled: v })}
          />
        </Card>

        <SectionTitle>리마인드</SectionTitle>
        <Card className="px-4 mb-6">
          <ToggleRow
            label="매일 리마인드"
            desc="정한 시간에 오늘의 미션을 알려줘요"
            checked={settings.reminderEnabled}
            onChange={(v) => patch({ reminderEnabled: v })}
          />
          {settings.reminderEnabled && (
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-[13px] text-ink-2">시간</span>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => patch({ reminderTime: e.target.value })}
                className="h-9 rounded-sm border border-line px-3 text-[13.5px] outline-none focus:border-brand"
              />
            </div>
          )}
        </Card>

        <SectionTitle>방해 금지 시간</SectionTitle>
        <Card className="px-4">
          <ToggleRow
            label="방해 금지 시간 사용"
            desc="이 시간에는 알림을 보내지 않아요"
            checked={settings.quietHoursEnabled}
            onChange={(v) => patch({ quietHoursEnabled: v })}
          />
          {settings.quietHoursEnabled && (
            <div className="py-3.5 flex items-center gap-3">
              <TimeField
                label="시작"
                value={settings.quietStart}
                onChange={(v) => patch({ quietStart: v })}
              />
              <span className="text-ink-faint">~</span>
              <TimeField label="종료" value={settings.quietEnd} onChange={(v) => patch({ quietEnd: v })} />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }): ReactNode {
  return (
    <div className="flex-1">
      <p className="text-[11px] text-ink-faint mb-1">{label}</p>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-sm border border-line px-3 text-[13.5px] outline-none focus:border-brand"
      />
    </div>
  )
}
