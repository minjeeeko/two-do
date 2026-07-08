import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button, Chip } from '../../components/ui'
import { INTERESTS } from '../../lib/catalog'
import { LinkIcon, UsersIcon } from '../../components/icons'

function InterestPicker({ selected, onToggle }: { selected: string[]; onToggle: (key: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {INTERESTS.map((it) => (
        <Chip key={it.key} active={selected.includes(it.key)} onClick={() => onToggle(it.key)} type="button">
          {it.label}
        </Chip>
      ))}
    </div>
  )
}

export function InviteStep() {
  const step = useAppStore((s) => s.onboardingStep)
  const pendingCode = useAppStore((s) => s.pendingInviteCode)
  const createSelfAndInvite = useAppStore((s) => s.createSelfAndInvite)
  const demoAcceptInvite = useAppStore((s) => s.demoAcceptInvite)
  const loadDemo = useAppStore((s) => s.loadDemo)

  const [nickname, setNickname] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [touched, setTouched] = useState(false)

  const [partnerName, setPartnerName] = useState('')
  const [partnerInterests, setPartnerInterests] = useState<string[]>([])
  const [partnerTouched, setPartnerTouched] = useState(false)

  const toggle = (key: string) =>
    setInterests((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  const togglePartner = (key: string) =>
    setPartnerInterests((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  if (step === 'waiting' && pendingCode) {
    return (
      <div className="animate-domo-rise">
        <div className="rounded-lg bg-brand-soft p-5 text-center mb-5">
          <p className="text-[12.5px] text-brand-dark font-semibold mb-2">초대 코드</p>
          <p className="text-[32px] font-bold tracking-[0.2em] text-ink">{pendingCode}</p>
          <p className="text-[12.5px] text-ink-muted mt-2">이 코드를 상대에게 공유해서 우리 집을 만들어요</p>
        </div>

        <div className="rounded-lg border border-line p-4">
          <p className="text-[13px] font-bold text-ink-2 mb-3 flex items-center gap-1.5">
            <UsersIcon size={16} className="text-ink-muted" />
            데모 · 상대방 수락 시뮬레이션
          </p>
          <p className="text-[12px] text-ink-muted mb-3 leading-relaxed">
            실제 서비스에서는 상대방이 자신의 기기에서 코드를 입력해 수락해요. 지금은 한 기기로 체험 중이라 아래에서 상대 정보를 직접 입력해볼게요.
          </p>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">상대 닉네임</label>
          <input
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="예: 준호"
            className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-3.5"
          />
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            상대 관심사 (최소 3개){partnerTouched && partnerInterests.length < 3 && (
              <span className="text-danger font-normal ml-1.5">3개 이상 선택해주세요</span>
            )}
          </label>
          <InterestPicker selected={partnerInterests} onToggle={togglePartner} />
          <Button
            className="w-full mt-4"
            size="lg"
            onClick={() => {
              setPartnerTouched(true)
              if (!partnerName.trim() || partnerInterests.length < 3) return
              demoAcceptInvite(partnerName.trim(), partnerInterests)
            }}
          >
            수락 완료하고 우리 집 만들기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-domo-rise">
      <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">내 닉네임</label>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="예: 민지"
        className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-5"
      />

      <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">
        내 관심사·목표 (최소 3개)
        {touched && interests.length < 3 && (
          <span className="text-danger font-normal ml-1.5">3개 이상 선택해주세요</span>
        )}
      </label>
      <InterestPicker selected={interests} onToggle={toggle} />

      <Button
        className="w-full mt-6"
        size="lg"
        onClick={() => {
          setTouched(true)
          if (!nickname.trim() || interests.length < 3) return
          createSelfAndInvite(nickname.trim(), interests)
        }}
      >
        <LinkIcon size={17} />
        초대 코드 만들기
      </Button>

      <button
        className="w-full text-center text-[12.5px] text-ink-faint mt-4 underline underline-offset-2"
        onClick={() => loadDemo()}
      >
        건너뛰고 데모로 빠르게 둘러보기
      </button>
    </div>
  )
}
