import { REACTION_EMOJIS } from '../lib/catalog'
import type { Reaction } from '../types'

export function EmojiBar({
  reactions,
  currentUserId,
  onToggle,
}: {
  reactions: Reaction[]
  currentUserId: string
  onToggle: (emoji: string) => void
}) {
  const counts = new Map<string, number>()
  for (const r of reactions) counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1)
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  const mine = new Set(reactions.filter((r) => r.userId === currentUserId).map((r) => r.emoji))

  return (
    <div className="flex items-center gap-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const count = counts.get(emoji) ?? 0
        const active = mine.has(emoji)
        const isTop = top && top[0] === emoji && top[1] > 0
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            className={`relative h-8 min-w-8 px-1.5 rounded-full text-[15px] flex items-center justify-center gap-0.5 border transition-colors animate-domo-pop ${
              active
                ? 'bg-cheer-soft border-cheer/40'
                : isTop
                  ? 'bg-paper border-line'
                  : 'bg-transparent border-line-soft'
            }`}
            aria-label={`${emoji} 반응`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-[10px] font-bold text-ink-muted">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
