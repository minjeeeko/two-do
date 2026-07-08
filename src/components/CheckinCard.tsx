import { useState } from 'react'
import type { Checkin, Cheer, Mission, Reaction, User } from '../types'
import { Avatar, Button, StatusPill } from './ui'
import { EmojiBar } from './EmojiBar'
import { formatRelativeTime } from '../lib/date'
import { CHEER_PRESETS } from '../lib/catalog'
import { SendIcon, LockIcon, EyeIcon } from './icons'

const PLACEHOLDER_GRADIENTS = [
  'from-[#f6dcd1] to-[#e0704f]',
  'from-[#e3ecdb] to-[#6fa355]',
  'from-[#e2eaf2] to-[#6f93b8]',
  'from-[#f8e1e7] to-[#e07b95]',
]

export function CheckinCard({
  checkin,
  mission,
  author,
  reactions,
  cheers,
  currentUserId,
  onToggleReaction,
  onAddCheer,
}: {
  checkin: Checkin
  mission: Mission
  author?: User
  reactions: Reaction[]
  cheers: Cheer[]
  currentUserId: string
  onToggleReaction: (emoji: string) => void
  onAddCheer: (text: string) => void
}) {
  const [showCheerInput, setShowCheerInput] = useState(false)
  const [text, setText] = useState('')
  const isMine = checkin.userId === currentUserId
  const showDetail = checkin.visibility === 'detail'

  return (
    <div className="rounded-lg bg-canvas border border-line/70 p-4 animate-domo-rise">
      <div className="flex items-start gap-2.5">
        <Avatar label={author?.nickname ?? '?'} tone={isMine ? 'brand' : 'cheer'} size={34} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13.5px] font-bold text-ink">{author?.nickname ?? '알 수 없음'}</span>
            <span className="text-[12px] text-ink-faint">{formatRelativeTime(checkin.createdAt)}</span>
            {mission.ownerType === 'couple' && (
              <StatusPill tone="brand">우리 미션</StatusPill>
            )}
          </div>
          <p className="text-[14px] text-ink-2 font-medium mt-0.5">{mission.title}</p>
        </div>
        <span className="text-ink-faint mt-0.5" title={showDetail ? '상세 공유' : '요약 공유'}>
          {showDetail ? <EyeIcon size={16} /> : <LockIcon size={15} />}
        </span>
      </div>

      {showDetail && checkin.note && (
        <p className="text-[13.5px] text-ink-2 mt-3 leading-relaxed bg-paper rounded-sm px-3 py-2.5">{checkin.note}</p>
      )}
      {!showDetail && checkin.note && (
        <p className="text-[13px] text-ink-muted mt-3 leading-relaxed">
          한 줄 메모를 남겼어요
        </p>
      )}
      {showDetail && checkin.media?.type === 'photo' && (
        <div
          className={`mt-3 h-32 rounded-sm bg-gradient-to-br ${
            PLACEHOLDER_GRADIENTS[(checkin.media.placeholder ?? 1) % PLACEHOLDER_GRADIENTS.length]
          }`}
        />
      )}

      <div className="flex items-center justify-between mt-3.5">
        <EmojiBar reactions={reactions} currentUserId={currentUserId} onToggle={onToggleReaction} />
        {!isMine && (
          <button
            onClick={() => setShowCheerInput((v) => !v)}
            className="text-[12px] font-semibold text-ink-muted active:text-brand"
          >
            응원 남기기
          </button>
        )}
      </div>

      {cheers.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {cheers.map((c) => (
            <p key={c.id} className="text-[13px] text-ink-2 bg-paper rounded-sm px-3 py-2">
              {c.text}
            </p>
          ))}
        </div>
      )}

      {showCheerInput && (
        <div className="mt-3">
          <div className="flex gap-1.5 flex-wrap mb-2">
            {CHEER_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  onAddCheer(p)
                  setShowCheerInput(false)
                }}
                className="h-8 px-3 rounded-full border border-line text-[12.5px] text-ink-2 active:bg-paper"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="짧은 격려를 남겨보세요"
              className="flex-1 h-10 rounded-full border border-line px-3.5 text-[13.5px] outline-none focus:border-brand"
            />
            <Button
              size="sm"
              className="!h-10 !w-10 !p-0 rounded-full"
              onClick={() => {
                if (!text.trim()) return
                onAddCheer(text)
                setText('')
                setShowCheerInput(false)
              }}
            >
              <SendIcon size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
