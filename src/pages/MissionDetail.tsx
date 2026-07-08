import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Button, Card, EmptyState, StatusPill } from '../components/ui'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CheckinCard } from '../components/CheckinCard'
import { GrassHeatmap } from '../components/GrassHeatmap'
import { CameraIcon, CheckIcon, EditIcon, FlameIcon, TrashIcon, ArchiveIcon } from '../components/icons'
import { calcStreak, todayStr } from '../lib/date'
import { buildGrass, countsByDate, userDoneDates } from '../lib/selectors'
import { interestLabel } from '../lib/catalog'
import { compressImageToDataUrl, ImageValidationError } from '../lib/image'
import type { Visibility } from '../types'

export function MissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const state = useAppStore()
  const checkIn = useAppStore((s) => s.checkIn)
  const deleteCheckin = useAppStore((s) => s.deleteCheckin)
  const deleteMission = useAppStore((s) => s.deleteMission)
  const archiveMission = useAppStore((s) => s.archiveMission)
  const setMissionVisibilityOverride = useAppStore((s) => s.setMissionVisibilityOverride)
  const toggleReaction = useAppStore((s) => s.toggleReaction)
  const addCheer = useAppStore((s) => s.addCheer)

  const mission = id ? state.missions[id] : undefined
  const currentUserId = state.currentUserId!
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'idle' | 'note' | 'photo'>('idle')
  const [note, setNote] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [imgError, setImgError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)

  if (!mission) {
    return (
      <div>
        <TopBar title="미션" back />
        <EmptyState title="미션을 찾을 수 없어요" />
      </div>
    )
  }

  const today = todayStr()
  const todaysCheckin = Object.values(state.checkins).find(
    (c) => c.missionId === mission.id && c.userId === currentUserId && c.date === today
  )
  const streak = calcStreak(userDoneDates(state, currentUserId, mission.id))
  const visibility = (state.privacy.missionOverrides[mission.id] ?? mission.visibility) as Visibility
  const isCompleted = !!(mission.endDate && mission.endDate < today)

  const missionCheckins = Object.values(state.checkins)
    .filter((c) => c.missionId === mission.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const grass = buildGrass(countsByDate(missionCheckins.filter((c) => c.userId === currentUserId)), 91)

  async function handlePhotoPick(file: File) {
    setImgError('')
    try {
      const dataUrl = await compressImageToDataUrl(file)
      setPhotoDataUrl(dataUrl)
    } catch (e) {
      setImgError(e instanceof ImageValidationError ? e.message : '이미지를 처리하지 못했어요')
    }
  }

  function submitCheckin(method: 'check' | 'note' | 'photo') {
    checkIn(mission!.id, {
      method,
      note: note.trim() || undefined,
      media: method === 'photo' && photoDataUrl ? { type: 'photo', dataUrl: photoDataUrl } : undefined,
    })
    setMode('idle')
    setNote('')
    setPhotoDataUrl(null)
  }

  return (
    <div>
      <TopBar
        title={mission.title}
        back
        right={
          <button onClick={() => navigate(`/missions/${mission.id}/edit`)} className="text-ink-2">
            <EditIcon size={19} />
          </button>
        }
      />

      <div className="px-4 pb-10">
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {mission.ownerType === 'couple' && <StatusPill tone="brand">우리 미션</StatusPill>}
            <StatusPill tone="neutral">#{interestLabel(mission.category)}</StatusPill>
            <StatusPill tone="neutral">
              {mission.frequency.type === 'daily' ? '매일' : `주 ${mission.frequency.timesPerWeek}회`}
            </StatusPill>
          </div>
          {mission.description && <p className="text-[13.5px] text-ink-2 leading-relaxed mt-2">{mission.description}</p>}
          <div className="flex items-center gap-1.5 mt-3 text-streak font-bold text-[13px]">
            <FlameIcon size={16} />
            {streak}일 연속
          </div>
        </Card>

        {isCompleted && (
          <div className="rounded-md bg-line-soft px-3.5 py-2.5 mb-4 text-[12.5px] text-ink-muted text-center">
            {mission.endDate}에 종료된 미션이에요
          </div>
        )}

        {!isCompleted && !todaysCheckin && mode === 'idle' && (
          <Card className="p-4 mb-4">
            <p className="text-[13.5px] font-bold text-ink mb-3">오늘 인증하기</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => submitCheckin('check')}
                className="h-16 rounded-md border border-line flex flex-col items-center justify-center gap-1 active:bg-paper"
              >
                <CheckIcon size={18} className="text-streak" />
                <span className="text-[11.5px] font-semibold text-ink-2">체크만</span>
              </button>
              <button
                onClick={() => setMode('note')}
                className="h-16 rounded-md border border-line flex flex-col items-center justify-center gap-1 active:bg-paper"
              >
                <EditIcon size={18} className="text-ink-muted" />
                <span className="text-[11.5px] font-semibold text-ink-2">메모</span>
              </button>
              <button
                onClick={() => {
                  setMode('photo')
                  fileRef.current?.click()
                }}
                className="h-16 rounded-md border border-line flex flex-col items-center justify-center gap-1 active:bg-paper"
              >
                <CameraIcon size={18} className="text-ink-muted" />
                <span className="text-[11.5px] font-semibold text-ink-2">사진</span>
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handlePhotoPick(f)
              }}
            />
          </Card>
        )}

        {(mode === 'note' || mode === 'photo') && (
          <Card className="p-4 mb-4">
            {mode === 'photo' && (
              <div className="mb-3">
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="" className="w-full h-40 object-cover rounded-sm" />
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-40 rounded-sm border border-dashed border-line flex items-center justify-center text-ink-faint"
                  >
                    <CameraIcon size={24} />
                  </button>
                )}
                {imgError && <p className="text-[12px] text-danger mt-1.5">{imgError}</p>}
              </div>
            )}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="10초면 충분해요, 짧게 남겨보세요"
              rows={2}
              className="w-full rounded-sm border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand resize-none mb-3"
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setMode('idle')}>
                취소
              </Button>
              <Button
                className="flex-1"
                disabled={mode === 'photo' && !photoDataUrl}
                onClick={() => submitCheckin(mode)}
              >
                인증 완료
              </Button>
            </div>
          </Card>
        )}

        {!isCompleted && todaysCheckin && (
          <Card className="p-4 mb-4 border-streak/40 bg-streak-soft/40">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-streak flex items-center gap-1.5">
                <CheckIcon size={16} /> 오늘 인증 완료
              </p>
              <button
                className="text-[12px] text-ink-muted underline underline-offset-2"
                onClick={() => deleteCheckin(todaysCheckin.id)}
              >
                취소하기
              </button>
            </div>
          </Card>
        )}

        <div className="mb-5">
          <p className="text-[13px] font-bold text-ink-2 mb-2.5">내 기록</p>
          <Card className="p-4">
            <GrassHeatmap days={grass} cellSize={10} />
          </Card>
        </div>

        <div className="mb-5">
          <p className="text-[13px] font-bold text-ink-2 mb-2">공개 범위</p>
          <div className="flex gap-2">
            {(['summary', 'detail', 'private'] as Visibility[]).map((v) => (
              <button
                key={v}
                onClick={() => setMissionVisibilityOverride(mission.id, v === mission.visibility ? null : v)}
                className={`flex-1 h-10 rounded-full border text-[12.5px] font-semibold ${
                  visibility === v ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-muted'
                }`}
              >
                {v === 'summary' ? '요약' : v === 'detail' ? '상세' : '비공개'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[13px] font-bold text-ink-2 mb-2.5">전체 기록</p>
        <div className="space-y-3 mb-8">
          {missionCheckins.length === 0 && <EmptyState title="아직 기록이 없어요" />}
          {missionCheckins.map((c) => (
            <CheckinCard
              key={c.id}
              checkin={c}
              mission={mission}
              author={state.users[c.userId]}
              reactions={Object.values(state.reactions).filter((r) => r.checkinId === c.id)}
              cheers={Object.values(state.cheers).filter((ch) => ch.checkinId === c.id)}
              currentUserId={currentUserId}
              onToggleReaction={(emoji) => toggleReaction(c.id, emoji)}
              onAddCheer={(text) => addCheer(c.id, text)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmArchive(true)}>
            <ArchiveIcon size={16} />
            보관
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => setConfirmDelete(true)}>
            <TrashIcon size={16} />
            삭제
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="미션을 삭제할까요?"
        desc="삭제하면 이 미션의 모든 기록이 함께 사라져요. 이 작업은 되돌릴 수 없어요."
        confirmLabel="삭제"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteMission(mission.id)
          navigate('/missions', { replace: true })
        }}
      />
      <ConfirmDialog
        open={confirmArchive}
        title="미션을 보관할까요?"
        desc="보관하면 목록에서 숨겨져요. 기록은 그대로 남아있어요."
        confirmLabel="보관"
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => {
          archiveMission(mission.id)
          navigate('/missions', { replace: true })
        }}
      />
    </div>
  )
}
