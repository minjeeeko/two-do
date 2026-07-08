import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Button, Card, SectionTitle } from '../components/ui'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DownloadIcon, LockIcon, TrashIcon } from '../components/icons'
import type { Visibility } from '../types'
import { formatRelativeTime } from '../lib/date'

const OPTIONS: { key: Visibility; label: string; desc: string }[] = [
  { key: 'summary', label: '요약 공유 (기본)', desc: '달성 여부와 한 줄 메모만 상대에게 보여요' },
  { key: 'detail', label: '상세 공유', desc: '사진과 긴 메모까지 함께 보여요' },
  { key: 'private', label: '비공개', desc: '나만 볼 수 있어요' },
]

export function PrivacySettings() {
  const state = useAppStore()
  const updatePrivacy = useAppStore((s) => s.updatePrivacy)
  const setMissionVisibilityOverride = useAppStore((s) => s.setMissionVisibilityOverride)
  const exportDataJSON = useAppStore((s) => s.exportDataJSON)
  const deleteAllData = useAppStore((s) => s.deleteAllData)
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const overrideEntries = Object.entries(state.privacy.missionOverrides).filter(([mid]) => state.missions[mid])

  const downloadExport = () => {
    const json = exportDataJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `domo-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <TopBar title="공개 범위 설정" back />
      <div className="px-4 pb-10">
        <SectionTitle>기본 공개 범위</SectionTitle>
        <div className="space-y-2 mb-6">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => updatePrivacy({ defaultVisibility: o.key })}
              className={`w-full text-left rounded-md border p-3.5 flex items-center justify-between ${
                state.privacy.defaultVisibility === o.key ? 'border-brand bg-brand-soft' : 'border-line'
              }`}
            >
              <div>
                <p className="text-[13.5px] font-bold text-ink">{o.label}</p>
                <p className="text-[11.5px] text-ink-muted mt-0.5">{o.desc}</p>
              </div>
              <div
                className={`h-4 w-4 rounded-full border-2 shrink-0 ${
                  state.privacy.defaultVisibility === o.key ? 'border-brand bg-brand' : 'border-line'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-[11.5px] text-ink-faint -mt-4 mb-6">
          변경하면 새로 만드는 미션부터 즉시 적용돼요. 미션별 예외는 각 미션 상세에서 따로 설정할 수 있어요.
        </p>

        {overrideEntries.length > 0 && (
          <>
            <SectionTitle>미션별 예외</SectionTitle>
            <Card className="divide-y divide-line-soft mb-6">
              {overrideEntries.map(([mid, v]) => (
                <div key={mid} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] font-semibold text-ink-2 truncate">{state.missions[mid]?.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11.5px] text-brand-dark font-semibold">
                      {v === 'summary' ? '요약' : v === 'detail' ? '상세' : '비공개'}
                    </span>
                    <button
                      className="text-[11.5px] text-ink-faint underline underline-offset-2"
                      onClick={() => setMissionVisibilityOverride(mid, null)}
                    >
                      해제
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        <SectionTitle>보안 안내</SectionTitle>
        <Card className="p-4 mb-6 flex items-start gap-3">
          <LockIcon size={18} className="text-ink-muted shrink-0 mt-0.5" />
          <p className="text-[12px] text-ink-muted leading-relaxed">
            현재는 프론트엔드 데모 단계로 모든 데이터가 이 기기의 브라우저에만 저장돼요. 실제 서비스에서는 Supabase 서버에
            TLS로 전송하고, 민감 정보는 컬럼 단위로 암호화해 최소 권한으로만 접근할 수 있도록 설계돼요.
          </p>
        </Card>

        {state.accessLog.length > 0 && (
          <>
            <SectionTitle>최근 접근/변경 내역</SectionTitle>
            <Card className="divide-y divide-line-soft mb-6">
              {[...state.accessLog]
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                .slice(0, 6)
                .map((log) => (
                  <div key={log.id} className="px-4 py-2.5 text-[12px] text-ink-muted flex items-center justify-between">
                    <span>
                      {state.users[log.actorUserId]?.nickname} · {log.action}
                    </span>
                    <span className="text-ink-faint">{formatRelativeTime(log.createdAt)}</span>
                  </div>
                ))}
            </Card>
          </>
        )}

        <SectionTitle>내 데이터</SectionTitle>
        <div className="space-y-2.5">
          <Button variant="outline" className="w-full" onClick={downloadExport}>
            <DownloadIcon size={16} />
            내 데이터 내보내기 (JSON)
          </Button>
          <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
            <TrashIcon size={16} />
            전체 데이터 삭제 요청
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="모든 데이터를 삭제할까요?"
        desc={'이 기기에 저장된 우리 집, 미션, 기록이 모두 삭제돼요.\n이 작업은 되돌릴 수 없어요.'}
        confirmLabel="삭제"
        danger
        requirePhrase="삭제합니다"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteAllData()
          navigate('/', { replace: true })
        }}
      />
    </div>
  )
}
