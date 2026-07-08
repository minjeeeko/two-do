import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Button, Chip } from '../components/ui'
import { INTERESTS } from '../lib/catalog'
import type { FrequencyType, Visibility } from '../types'
import { todayStr } from '../lib/date'

const VISIBILITY_OPTIONS: { key: Visibility; label: string; desc: string }[] = [
  { key: 'summary', label: '요약 공유', desc: '달성 여부와 한 줄 메모만 보여요' },
  { key: 'detail', label: '상세 공유', desc: '사진과 메모까지 함께 보여요' },
  { key: 'private', label: '비공개', desc: '나만 볼 수 있어요' },
]

export function MissionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const missions = useAppStore((s) => s.missions)
  const createMission = useAppStore((s) => s.createMission)
  const updateMission = useAppStore((s) => s.updateMission)
  const privacy = useAppStore((s) => s.privacy)

  const editing = id ? missions[id] : undefined
  const isCompleted = !!(editing?.endDate && editing.endDate < todayStr())

  const [ownerType, setOwnerType] = useState<'personal' | 'couple'>(editing?.ownerType ?? 'personal')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [category, setCategory] = useState(editing?.category ?? INTERESTS[0].key)
  const [freqType, setFreqType] = useState<FrequencyType>(editing?.frequency.type ?? 'daily')
  const [timesPerWeek, setTimesPerWeek] = useState(editing?.frequency.timesPerWeek ?? 3)
  const [hasEndDate, setHasEndDate] = useState(!!editing?.endDate)
  const [endDate, setEndDate] = useState(editing?.endDate ?? '')
  const [visibility, setVisibility] = useState<Visibility>(editing?.visibility ?? privacy.defaultVisibility)
  const [touched, setTouched] = useState(false)

  const valid = title.trim().length > 0 && (freqType === 'daily' || (timesPerWeek >= 1 && timesPerWeek <= 7))

  const submit = () => {
    setTouched(true)
    if (!valid) return
    const payload = {
      ownerType,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      frequency: freqType === 'daily' ? { type: 'daily' as const } : { type: 'weekly' as const, timesPerWeek },
      endDate: hasEndDate && endDate ? endDate : null,
      visibility,
    }
    if (editing) {
      updateMission(editing.id, payload)
    } else {
      createMission(payload)
    }
    navigate(-1)
  }

  if (isCompleted) {
    return (
      <div>
        <TopBar title="미션 수정" back />
        <div className="px-5 py-10 text-center">
          <p className="text-[14px] text-ink-muted">이미 종료된 미션은 수정할 수 없어요</p>
          <Button className="mt-5" onClick={() => navigate(-1)}>
            돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title={editing ? '미션 수정' : '새 미션'} back />
      <div className="px-5 pb-10">
        {!editing && (
          <div className="mb-5">
            <p className="text-[13px] font-semibold text-ink-2 mb-2">누구의 미션인가요</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOwnerType('personal')}
                className={`h-11 rounded-md border text-[13.5px] font-semibold ${
                  ownerType === 'personal' ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-2'
                }`}
              >
                개인 미션
              </button>
              <button
                onClick={() => setOwnerType('couple')}
                className={`h-11 rounded-md border text-[13.5px] font-semibold ${
                  ownerType === 'couple' ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-2'
                }`}
              >
                커플 미션
              </button>
            </div>
          </div>
        )}

        <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">미션 이름</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 영단어 30분"
          className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-1"
        />
        {touched && !title.trim() && <p className="text-[12px] text-danger mb-3">미션 이름을 입력해주세요</p>}
        <div className="mb-5" />

        <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">설명 (선택)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="짧게 설명을 남겨보세요"
          rows={2}
          className="w-full rounded-sm border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand mb-5 resize-none"
        />

        <label className="block text-[13px] font-semibold text-ink-2 mb-2">카테고리</label>
        <div className="flex flex-wrap gap-2 mb-5">
          {INTERESTS.map((it) => (
            <Chip key={it.key} active={category === it.key} onClick={() => setCategory(it.key)} type="button">
              {it.label}
            </Chip>
          ))}
        </div>

        <label className="block text-[13px] font-semibold text-ink-2 mb-2">반복 주기</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setFreqType('daily')}
            className={`h-11 rounded-md border text-[13.5px] font-semibold ${
              freqType === 'daily' ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-2'
            }`}
          >
            매일
          </button>
          <button
            onClick={() => setFreqType('weekly')}
            className={`h-11 rounded-md border text-[13.5px] font-semibold ${
              freqType === 'weekly' ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-2'
            }`}
          >
            주 n회
          </button>
        </div>
        {freqType === 'weekly' && (
          <div className="flex items-center gap-3 mb-5">
            <input
              type="range"
              min={1}
              max={7}
              value={timesPerWeek}
              onChange={(e) => setTimesPerWeek(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="text-[13.5px] font-bold text-ink w-14 text-right">주 {timesPerWeek}회</span>
          </div>
        )}
        {freqType === 'daily' && <div className="mb-5" />}

        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-ink-2">종료일 설정</label>
          <button
            onClick={() => setHasEndDate((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${hasEndDate ? 'bg-brand' : 'bg-line'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                hasEndDate ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {hasEndDate && (
          <input
            type="date"
            value={endDate}
            min={todayStr()}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-5"
          />
        )}
        {!hasEndDate && <p className="text-[12px] text-ink-faint mb-5">종료일 없이 계속 이어가요</p>}

        <label className="block text-[13px] font-semibold text-ink-2 mb-2">공개 범위</label>
        <div className="space-y-2 mb-8">
          {VISIBILITY_OPTIONS.map((v) => (
            <button
              key={v.key}
              onClick={() => setVisibility(v.key)}
              className={`w-full text-left rounded-md border p-3 flex items-center justify-between ${
                visibility === v.key ? 'border-brand bg-brand-soft' : 'border-line'
              }`}
            >
              <div>
                <p className="text-[13.5px] font-bold text-ink">{v.label}</p>
                <p className="text-[11.5px] text-ink-muted mt-0.5">{v.desc}</p>
              </div>
              <div
                className={`h-4 w-4 rounded-full border-2 shrink-0 ${
                  visibility === v.key ? 'border-brand bg-brand' : 'border-line'
                }`}
              />
            </button>
          ))}
        </div>

        <Button className="w-full" size="lg" onClick={submit}>
          {editing ? '수정 완료' : '미션 만들기'}
        </Button>
      </div>
    </div>
  )
}
