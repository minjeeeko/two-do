import type { ComponentType } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { notificationsForUser } from '../lib/selectors'
import { Button, Card, EmptyState } from '../components/ui'
import { LetterDraw } from '../components/LetterDraw'
import { LetterView } from '../components/LetterView'
import { formatRelativeTime } from '../lib/date'
import {
  BellIcon,
  CheckIcon,
  EditIcon,
  FlameIcon,
  HeartIcon,
  HouseIcon,
  ListIcon,
  MailIcon,
  SendIcon,
  SparkleIcon,
} from '../components/icons'
import type { AppNotification, Letter } from '../types'

const ICONS: Record<AppNotification['type'], ComponentType<{ size?: number; className?: string }>> = {
  checkin: HouseIcon,
  reaction: HeartIcon,
  cheer: SendIcon,
  streak: FlameIcon,
  badge: SparkleIcon,
  coupleGoal: HouseIcon,
  reminder: BellIcon,
  system: MailIcon,
  chore: ListIcon,
  comment: SendIcon,
  complete: CheckIcon,
  letter: MailIcon,
}

export function Mailbox() {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const navigate = useNavigate()
  const markNotificationRead = useAppStore((s) => s.markNotificationRead)
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead)
  const sendLetter = useAppStore((s) => s.sendLetter)
  const markLetterRead = useAppStore((s) => s.markLetterRead)

  const [drawOpen, setDrawOpen] = useState(false)
  const [viewLetter, setViewLetter] = useState<Letter | null>(null)

  const notifications = notificationsForUser(state, currentUserId)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[19px] font-bold text-ink">우편함</h1>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllNotificationsRead}>
            모두 읽음
          </Button>
        )}
      </div>

      {/* 손편지 보내기 */}
      <button
        onClick={() => setDrawOpen(true)}
        className="w-full mb-5 rounded-lg bg-brand-soft/70 border border-brand/25 p-4 flex items-center gap-3 active:bg-brand-soft"
      >
        <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
          <EditIcon size={19} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[14px] font-bold text-ink">손편지 보내기</p>
          <p className="text-[12px] text-ink-muted mt-0.5">직접 낙서하듯 그려서 상대 홈으로 보내요</p>
        </div>
      </button>

      {notifications.length === 0 && (
        <EmptyState icon={<MailIcon size={30} />} title="아직 도착한 알림이 없어요" desc="응원과 반응이 오면 여기에 쌓여요" />
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = ICONS[n.type]
          return (
            <button
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id)
                if (!n.refId) return
                if (n.type === 'letter') {
                  const letter = state.letters[n.refId]
                  if (letter) {
                    setViewLetter(letter)
                    markLetterRead(letter.id)
                  }
                  return
                }
                const chore = state.chores[n.refId]
                if (chore) navigate(`/chores?date=${chore.date}`)
              }}
              className="w-full text-left"
            >
              <Card className={`p-3.5 flex items-start gap-3 ${!n.read ? 'border-brand/40 bg-brand-soft/30' : ''}`}>
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    n.read ? 'bg-line-soft text-ink-faint' : 'bg-brand-soft text-brand-dark'
                  }`}
                >
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13.5px] font-bold text-ink truncate">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />}
                  </div>
                  <p className="text-[12.5px] text-ink-2 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-ink-faint mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <LetterDraw open={drawOpen} onClose={() => setDrawOpen(false)} onSend={(url) => sendLetter(url)} />
      <LetterView letter={viewLetter} onClose={() => setViewLetter(null)} />
    </div>
  )
}
