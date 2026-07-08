import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { missionsForCouple } from '../lib/selectors'
import { Avatar, Button, Card } from '../components/ui'
import { CheckIcon, SendIcon } from '../components/icons'
import { GrassRow, HouseIllustration } from '../components/illustrations'
import { todayStr } from '../lib/date'
import type { HouseMessage } from '../types'

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
  const missions = missionsForCouple(state).filter(
    (m) => m.ownerType === 'couple' || m.ownerUserId === userId
  )
  const doneSet = new Set(
    Object.values(state.checkins)
      .filter((c) => c.userId === userId && c.date === today)
      .map((c) => c.missionId)
  )
  const shown = missions.slice(0, 4)
  const doneCount = missions.filter((m) => doneSet.has(m.id)).length

  return (
    <Link to="/missions" className="block">
      <Card className="p-3.5 h-full active:bg-paper transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Avatar label={user?.nickname ?? '?'} size={26} tone={tone} />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-ink truncate">{user?.nickname}의 방</p>
            <p className="text-[10.5px] text-ink-faint">
              오늘 {doneCount}/{missions.length}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {missions.length === 0 && <p className="text-[11.5px] text-ink-faint py-1">오늘 미션이 없어요</p>}
          {shown.map((m) => {
            const done = doneSet.has(m.id)
            return (
              <div key={m.id} className="flex items-center gap-1.5">
                <span
                  className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                    done ? 'bg-streak text-white' : 'border border-line'
                  }`}
                >
                  {done && <CheckIcon size={11} />}
                </span>
                <span
                  className={`text-[12px] truncate ${done ? 'text-ink-faint line-through' : 'text-ink-2'}`}
                >
                  {m.title}
                </span>
              </div>
            )
          })}
          {missions.length > 4 && (
            <p className="text-[11px] text-ink-faint pl-[22px]">+{missions.length - 4}개 더</p>
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

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pt-6 flex-1">
        {/* 1. Header */}
        <h1 className="text-center text-[18px] font-bold text-ink mb-1">
          <span className="mr-1">🏡</span>
          {users[u1Id]?.nickname} &amp; {users[u2Id]?.nickname}의 {couple.name}
        </h1>
        <p className="text-center text-[12.5px] text-ink-muted mb-3">{couple.tagline}</p>

        {/* 2. House + speech bubbles */}
        <div className="flex items-end justify-center gap-1 min-h-[170px]">
          <div className="flex-1 flex justify-end pb-8">
            {partnerMsg && (
              <SpeechBubble side="left" author={users[partnerId]?.nickname ?? ''} text={partnerMsg.text} tone="cheer" />
            )}
          </div>
          <HouseIllustration className="w-[130px] shrink-0" />
          <div className="flex-1 flex justify-start pb-8">
            {myMsg && (
              <SpeechBubble side="right" author={users[currentUserId]?.nickname ?? ''} text={myMsg.text} tone="brand" />
            )}
          </div>
        </div>
        {!hasAnyMessage && (
          <p className="text-center text-[12px] text-ink-faint mb-2">서로에게 첫 응원을 남겨보세요</p>
        )}

        {/* 3. Cheer message input */}
        <div className="flex gap-2 mt-3 mb-6">
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
        <div className="grid grid-cols-2 gap-3 mb-6">
          <RoomCard userId={u1Id} tone="brand" />
          <RoomCard userId={u2Id} tone="cheer" />
        </div>
      </div>

      {/* 5. Grass lawn at the very bottom */}
      <GrassRow className="mt-2" />
    </div>
  )
}
