import { useState } from 'react'
import type { Chore } from '../types'
import { useAppStore } from '../store/useAppStore'
import { Avatar, StatusPill } from './ui'
import { CheckIcon, SendIcon } from './icons'
import { REACTION_EMOJIS, CHORE_COMMENT_PRESETS } from '../lib/catalog'
import { formatRelativeTime } from '../lib/date'

export function ChoreCard({ chore }: { chore: Chore }) {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const toggleComplete = useAppStore((s) => s.toggleChoreComplete)
  const toggleReaction = useAppStore((s) => s.toggleChoreReaction)
  const addComment = useAppStore((s) => s.addChoreComment)
  const deleteChore = useAppStore((s) => s.deleteChore)

  const [expanded, setExpanded] = useState(false)
  const [comment, setComment] = useState('')

  const owner = chore.ownerUserId ? state.users[chore.ownerUserId] : undefined
  const isTogether = chore.ownerType === 'together'

  const reactions = Object.values(state.choreReactions).filter((r) => r.choreId === chore.id)
  const comments = Object.values(state.choreComments)
    .filter((c) => c.choreId === chore.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  const myReactions = new Set(reactions.filter((r) => r.userId === currentUserId).map((r) => r.emoji))
  const reactionCounts = new Map<string, number>()
  for (const r of reactions) reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) ?? 0) + 1)

  const cardTone = isTogether
    ? 'bg-brand-soft/50 border-brand/25'
    : 'bg-info-soft/40 border-info/20'

  return (
    <div className={`rounded-lg border p-3.5 ${cardTone} animate-domo-rise`}>
      <div className="flex items-start gap-3">
        <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {isTogether ? (
              <StatusPill tone="brand">같이</StatusPill>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Avatar label={owner?.nickname ?? '?'} size={18} color={owner?.colorTag} src={owner?.avatarUrl} />
                <span className="text-[11px] font-semibold text-ink-muted">{owner?.nickname}</span>
              </span>
            )}
            <StatusPill tone="neutral">{chore.category}</StatusPill>
          </div>
          <p className={`text-[14.5px] font-bold ${chore.completed ? 'text-ink-faint line-through' : 'text-ink'}`}>
            {chore.title}
          </p>
          {chore.description && (
            <p className={`text-[12.5px] mt-0.5 ${chore.completed ? 'text-ink-faint' : 'text-ink-muted'}`}>
              {chore.description}
            </p>
          )}
        </button>

        <button
          onClick={() => toggleComplete(chore.id)}
          aria-label={chore.completed ? '완료 취소' : '완료'}
          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${
            chore.completed ? 'bg-streak border-streak text-white' : 'bg-canvas border-line text-transparent active:border-brand'
          }`}
        >
          <CheckIcon size={16} />
        </button>
      </div>

      {/* reaction summary (always visible when present) */}
      {(reactions.length > 0 || comments.length > 0) && !expanded && (
        <div className="flex items-center gap-2 mt-2.5 text-[11.5px] text-ink-muted">
          {[...reactionCounts.entries()].map(([emoji, n]) => (
            <span key={emoji}>
              {emoji} {n}
            </span>
          ))}
          {comments.length > 0 && <span>💬 {comments.length}</span>}
        </div>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-line-soft/70">
          {/* reaction picker */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {REACTION_EMOJIS.map((emoji) => {
              const count = reactionCounts.get(emoji) ?? 0
              const active = myReactions.has(emoji)
              return (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(chore.id, emoji)}
                  className={`h-8 min-w-8 px-1.5 rounded-full text-[14px] flex items-center gap-0.5 border ${
                    active ? 'bg-cheer-soft border-cheer/40' : 'bg-canvas border-line-soft'
                  }`}
                >
                  <span>{emoji}</span>
                  {count > 0 && <span className="text-[10px] font-bold text-ink-muted">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* comments */}
          {comments.length > 0 && (
            <div className="space-y-1.5 mb-2.5">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar
                    label={state.users[c.userId]?.nickname ?? '?'}
                    size={22}
                    color={state.users[c.userId]?.colorTag}
                    src={state.users[c.userId]?.avatarUrl}
                  />
                  <div className="flex-1 min-w-0 bg-canvas rounded-lg px-3 py-1.5">
                    <p className="text-[11px] font-semibold text-ink-muted">
                      {state.users[c.userId]?.nickname}
                      <span className="text-ink-faint font-normal ml-1.5">{formatRelativeTime(c.createdAt)}</span>
                    </p>
                    <p className="text-[13px] text-ink-2">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* comment presets + input */}
          <div className="flex gap-1.5 flex-wrap mb-2">
            {CHORE_COMMENT_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => addComment(chore.id, p)}
                className="h-7 px-2.5 rounded-full border border-line text-[11.5px] text-ink-2 active:bg-canvas"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  addComment(chore.id, comment)
                  setComment('')
                }
              }}
              placeholder="댓글 남기기"
              className="flex-1 h-9 rounded-full border border-line px-3 text-[13px] outline-none focus:border-brand bg-canvas"
            />
            <button
              onClick={() => {
                if (!comment.trim()) return
                addComment(chore.id, comment)
                setComment('')
              }}
              aria-label="댓글 전송"
              className="h-9 w-9 rounded-full bg-brand text-white flex items-center justify-center shrink-0"
            >
              <SendIcon size={15} />
            </button>
          </div>

          {chore.createdBy === currentUserId && (
            <button
              onClick={() => deleteChore(chore.id)}
              className="text-[11.5px] text-ink-faint underline underline-offset-2 mt-3"
            >
              삭제하기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
