import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Avatar, Button, Card, SectionTitle } from '../components/ui'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { HouseIcon } from '../components/icons'

export function CoupleManage() {
  const state = useAppStore()
  const couple = state.couple!
  const disconnectCouple = useAppStore((s) => s.disconnectCouple)
  const startReconnect = useAppStore((s) => s.startReconnect)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isConnected = couple.status === 'connected'
  const connectedDays = Math.max(
    0,
    Math.round((Date.now() - new Date(couple.connectedAt).getTime()) / 86400000)
  )

  return (
    <div>
      <TopBar title="우리 연결 관리" back />
      <div className="px-4 pb-10">
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <HouseIcon size={18} className="text-brand" />
            <p className="text-[14.5px] font-bold text-ink">{couple.name}</p>
          </div>
          <div className="flex items-center gap-4 mb-2">
            {couple.memberIds.map((id) => (
              <div key={id} className="flex items-center gap-2">
                <Avatar
                  label={state.users[id]?.nickname ?? ''}
                  color={state.users[id]?.colorTag}
                  src={state.users[id]?.avatarUrl}
                  size={30}
                />
                <span className="text-[13px] font-semibold text-ink-2">{state.users[id]?.nickname}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-ink-muted">
            {isConnected ? `${connectedDays}일째 함께하고 있어요` : `${couple.disconnectedAt?.slice(0, 10)}에 연결이 해제됐어요`}
          </p>
        </Card>

        {isConnected ? (
          <>
            <SectionTitle>연결 해제</SectionTitle>
            <Card className="p-4 mb-3">
              <p className="text-[12.5px] text-ink-muted leading-relaxed mb-3">해제하면 즉시 다음이 적용돼요.</p>
              <ul className="text-[12.5px] text-ink-2 space-y-1.5 list-disc pl-4 mb-1">
                <li>우리 집(거실) 접근이 즉시 차단돼요</li>
                <li>서로의 공유 범위(요약/상세)가 더 이상 보이지 않아요</li>
                <li>개인 기록은 그대로 유지돼요</li>
                <li>재연결은 새로운 초대로만 가능해요 (자동 복구 없음)</li>
              </ul>
            </Card>
            <Button variant="danger" className="w-full" onClick={() => setConfirmOpen(true)}>
              연결 해제하기
            </Button>
          </>
        ) : (
          <>
            <SectionTitle>재연결</SectionTitle>
            <Card className="p-4 mb-3">
              <p className="text-[12.5px] text-ink-muted leading-relaxed">
                이전 권한은 자동으로 돌아오지 않아요. 새로운 초대 코드를 만들어 다시 시작해요.
              </p>
            </Card>
            <Button className="w-full" onClick={startReconnect}>
              새로 초대해서 재연결하기
            </Button>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="정말 연결을 해제할까요?"
        desc={`해제하면 ${state.users[couple.memberIds.find((m) => m !== state.currentUserId) ?? '']?.nickname}님과의 공유 공간에 더 이상 접근할 수 없어요.`}
        confirmLabel="해제하기"
        danger
        requirePhrase="연결 해제"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          disconnectCouple()
          navigate('/me', { replace: true })
        }}
      />
    </div>
  )
}
