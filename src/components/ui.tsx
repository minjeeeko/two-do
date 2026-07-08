import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { avatarColor } from '../lib/colors'

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg bg-canvas border border-line/70 ${className}`}
      {...rest}
    />
  )
}

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'sm' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-ink active:bg-brand-dark',
  outline: 'bg-canvas text-ink-2 border border-line active:bg-paper',
  ghost: 'bg-transparent text-ink-2 active:bg-line-soft',
  danger: 'bg-danger text-brand-ink active:bg-danger/90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-[52px] px-6 text-[15px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Chip({
  active = false,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`h-9 px-3.5 rounded-full text-[13.5px] border transition-colors whitespace-nowrap ${
        active ? 'bg-ink text-canvas border-ink' : 'bg-canvas text-ink-muted border-line'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

type BadgeTone = 'streak' | 'cheer' | 'reward' | 'info' | 'danger' | 'brand' | 'neutral'

const badgeToneClasses: Record<BadgeTone, string> = {
  streak: 'bg-streak-soft text-streak',
  cheer: 'bg-cheer-soft text-cheer',
  reward: 'bg-reward-soft text-reward',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
  brand: 'bg-brand-soft text-brand-dark',
  neutral: 'bg-line-soft text-ink-muted',
}

export function StatusPill({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${badgeToneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function SectionTitle({
  children,
  action,
  className = '',
}: {
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between mb-2.5 ${className}`}>
      <h2 className="text-[15px] font-bold text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function ProgressBar({
  value,
  tone = 'streak',
  color,
}: {
  value: number
  tone?: BadgeTone
  /** hex color that overrides the tone-based fill */
  color?: string
}) {
  const barColor =
    tone === 'streak'
      ? 'bg-streak'
      : tone === 'reward'
        ? 'bg-reward'
        : tone === 'cheer'
          ? 'bg-cheer'
          : 'bg-brand'
  return (
    <div className="h-2 w-full rounded-full bg-line-soft overflow-hidden">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${color ? '' : barColor}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function Avatar({
  label,
  color = 'brand',
  size = 36,
  src,
}: {
  label: string
  /** avatar color key (see AVATAR_COLORS) */
  color?: string
  size?: number
  src?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  const c = avatarColor(color)
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: c.soft, color: c.fg }}
    >
      {label.slice(0, 1)}
    </div>
  )
}

export function EmptyState({ icon, title, desc }: { icon?: ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 text-ink-muted">
      {icon && <div className="mb-3 opacity-60">{icon}</div>}
      <p className="text-[14px] font-semibold text-ink-2">{title}</p>
      {desc && <p className="text-[12.5px] mt-1 max-w-[240px]">{desc}</p>}
    </div>
  )
}
