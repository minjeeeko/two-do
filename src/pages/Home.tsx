import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { choresForUserOnDate } from '../lib/selectors'
import { Avatar, Button, Card } from '../components/ui'
import { CheckIcon, HeartIcon, SendIcon } from '../components/icons'
import { CloudIllustration, GrassRow, HouseIllustration } from '../components/illustrations'
import { todayStr } from '../lib/date'
import type { HouseMessage } from '../types'

function daysTogether(origin: string): number {
  const start = new Date(origin + (origin.length === 10 ? 'T00:00:00' : '')).getTime()
  return Math.max(0, Math.floor((Date.now() - start) / 86400000))
}

function SpeechBubble({
  side,
  author,
  text,
  tone,
}: {
  side: 'left' | 'right'
  author: string
  text: string
  tone: 'brand' | 'cheer'
}) {
  const bg = tone === 'brand' ? 'bg-brand-soft' : 'bg-cheer-soft'
  const nameColor = tone === 'brand' ? 'text-brand-dark' : 'text-cheer'
  return (
    <div className={`relative max-w-[150px] rounded-2xl px-3 py-2 ${bg} animate-domo-pop`}>
      <p className={`text-[10px] font-bold mb-0.5 ${nameColor}`}>{author}</p>
      <p className="text-[12px] text-ink-2 leading-snug break-words">{text}</p>
      <div
        className={`absolute top-4 h-2.5 w-2.5 rotate-45 ${bg} ${side === 'left' ? '-right-1' : '-left-1'}`}
      />
    </div>
  )
}

function RoomCard({ userId, tone }: { userId: string; tone: 'brand' | 'cheer' }) {
  const state = useAppStore()
  const user = state.users[userId]
  const today = todayStr()
  const chores = choresForUserOnDate(state, userId, today)
  const shown = chores.slice(0, 4)
  const doneCount = chores.filter((c) => c.completed).length

  return (
    <Link to="/chores" className="block">
      <Card className="p-3.5 h-full active:bg-paper transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Avatar label={user?.nickname ?? '?'} size={26} tone={tone} src={user?.avatarUrl} />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-ink truncate">{user?.nickname}의 방</p>
            <p className="text-[10.5px] text-ink-faint">
              오늘 {doneCount}/{chores.length}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {chores.length === 0 && <p className="text-[11.5px] text-ink-faint py-1">오늘 집안일이 없어요</p>}
          {shown.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span
                className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                  c.completed ? 'bg-streak text-white' : 'border border-line'
                }`}
              >
                {c.completed && <CheckIcon size={11} />}
              </span>
              <span className={`text-[12px] truncate ${c.completed ? 'text-ink-faint line-through' : 'text-ink-2'}`}>
                {c.title}
              </span>
            </div>
          ))}
          {chores.length > 4 && (
            <p className="text-[11px] text-ink-faint pl-[22px]">+{chores.length - 4}개 더</p>
          )}
        </div>
      </Card>
    </Link>
  )
}

export function Home() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const couple = useAppStore((s) => s.couple)!
  const users = useAppStore((s) => s.users)
  const houseMessages = useAppStore((s) => s.houseMessages)
  const sendHouseMessage = useAppStore((s) => s.sendHouseMessage)

  const [draft, setDraft] = useState('')

  const [u1Id, u2Id] = couple.memberIds
  const partnerId = couple.memberIds.find((m) => m !== currentUserId)!

  const latestBy = (uid: string): HouseMessage | undefined =>
    Object.values(houseMessages)
      .filter((m) => m.userId === uid)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0]

  const partnerMsg = latestBy(partnerId)
  const myMsg = latestBy(currentUserId)
  const hasAnyMessage = Object.keys(houseMessages).length > 0

  const send = () => {
    if (!draft.trim()) return
    sendHouseMessage(draft)
    setDraft('')
  }

  const together = daysTogether(couple.startDate ?? couple.connectedAt)

  return (
    <div className="flex flex-col flex-1">
      {/* 1. Header (left aligned) + days-together badge on the right */}
      <div className="flex items-start justify-between gap-2 px-4 pt-5 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[17px] font-bold text-ink leading-snug">
            <span className="mr-1">🏡</span>
            {users[u1Id]?.nickname} &amp; {users[u2Id]?.nickname}의 {couple.name}
          </h1>
          <p className="text-[12.5px] text-ink-muted mt-0.5">{couple.tagline}</p>
        </div>
        <span className="shrink-0 mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-soft text-brand-dark text-[11px] font-bold px-2.5 py-1.5">
          <HeartIcon size={12} />
          함께한지 +{together}일
        </span>
      </div>

      {/* Sky: clouds fill the gap between header and house; grows on tall screens */}
      <div className="relative flex-1 flex items-end justify-center min-h-[190px] px-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <CloudIllustration className="absolute top-[5%] left-2 w-24" />
          <CloudIllustration className="absolute top-[3%] right-3 w-16" />
          <CloudIllustration className="absolute top-[30%] left-1/2 -translate-x-1/2 w-20" />
          <CloudIllustration className="absolute top-[52%] left-3 w-16" />
          <CloudIllustration className="absolute top-[46%] right-5 w-20" />
        </div>

        {/* 2. House + speech bubbles */}
        <div className="relative flex items-end justify-center gap-1 w-full">
          <div className="flex-1 flex justify-end pb-8">
            {partnerMsg && (
              <SpeechBubble side="left" author={users[partnerId]?.nickname ?? ''} text={partnerMsg.text} tone="cheer" />
            )}
          </div>
          <HouseIllustration className="w-[128px] shrink-0" />
          <div className="flex-1 flex justify-start pb-8">
            {myMsg && (
              <SpeechBubble side="right" author={users[currentUserId]?.nickname ?? ''} text={myMsg.text} tone="brand" />
            )}
          </div>
        </div>
      </div>

      {!hasAnyMessage && (
        <p className="text-center text-[12px] text-ink-faint px-4 shrink-0">서로에게 첫 응원을 남겨보세요</p>
      )}

      {/* 3. Cheer message input */}
      <div className="flex gap-2 px-4 mt-3 shrink-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="서로에게 응원의 한마디를 남겨보세요"
          className="flex-1 h-11 rounded-full border border-line px-4 text-[13.5px] outline-none focus:border-brand bg-canvas"
        />
        <Button className="!h-11 !w-11 !p-0 rounded-full shrink-0" onClick={send} aria-label="응원 보내기">
          <SendIcon size={18} />
        </Button>
      </div>

      {/* 4. Two rooms */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4 shrink-0">
        <RoomCard userId={u1Id} tone="brand" />
        <RoomCard userId={u2Id} tone="cheer" />
      </div>

      {/* 5. Grass lawn pinned to the very bottom (just above the nav bar) */}
      <GrassRow className="mt-4 shrink-0" />
    </div>
  )
}
