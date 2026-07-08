import { useAppStore } from '../../store/useAppStore'
import { InviteStep } from './InviteStep'
import { HouseStep } from './HouseStep'
import { FirstMissionStep } from './FirstMissionStep'

const STEP_ORDER = ['invite', 'waiting', 'house', 'firstMission'] as const
const STEP_COPY: Record<(typeof STEP_ORDER)[number], { kicker: string; title: string }> = {
  invite: { kicker: '1 · 이사 오기', title: '우리 집을 준비해볼까요?' },
  waiting: { kicker: '1 · 이사 오기', title: '상대의 수락을 기다리고 있어요' },
  house: { kicker: '2 · 우리 집 설정', title: '거실에서 오늘의 리듬을 시작해요' },
  firstMission: { kicker: '3 · 첫 미션', title: '첫 미션을 골라볼까요?' },
}

export function OnboardingFlow() {
  const step = useAppStore((s) => s.onboardingStep)
  const idx = STEP_ORDER.indexOf(step as (typeof STEP_ORDER)[number])
  const copy = STEP_COPY[step as (typeof STEP_ORDER)[number]] ?? STEP_COPY.invite

  return (
    <div className="flex flex-col flex-1 min-h-0 safe-top safe-bottom">
      <div className="px-6 pt-8 pb-2">
        <p className="font-display text-[26px] leading-none text-brand mb-6">DOMO</p>
        <div className="flex gap-1.5 mb-6">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= idx ? 'bg-brand' : 'bg-line-soft'}`} />
          ))}
        </div>
        <p className="text-[12px] font-bold text-brand mb-1.5">{copy.kicker}</p>
        <h1 className="text-[20px] font-bold text-ink leading-snug">{copy.title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
        {(step === 'invite' || step === 'waiting') && <InviteStep />}
        {step === 'house' && <HouseStep />}
        {step === 'firstMission' && <FirstMissionStep />}
      </div>
    </div>
  )
}
