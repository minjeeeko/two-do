import { NavLink } from 'react-router-dom'
import { CalendarIcon, HomeIcon, MailIcon, UserIcon } from './icons'
import { useAppStore } from '../store/useAppStore'
import { unreadNotificationCount } from '../lib/selectors'

const tabs = [
  { to: '/', label: '홈', Icon: HomeIcon, end: true },
  { to: '/chores', label: '집안일', Icon: CalendarIcon, end: false },
  { to: '/mailbox', label: '우편함', Icon: MailIcon, end: false },
  { to: '/me', label: '마이', Icon: UserIcon, end: false },
] as const

export function BottomNav() {
  const unread = useAppStore((s) => (s.currentUserId ? unreadNotificationCount(s, s.currentUserId) : 0))

  return (
    <nav className="sticky bottom-0 z-40 w-full max-w-md mx-auto bg-canvas/95 backdrop-blur border-t border-line-soft safe-bottom">
      <div className="flex items-stretch">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10.5px] font-medium min-h-[56px] ${
                isActive ? 'text-brand' : 'text-ink-faint'
              }`
            }
          >
            <span className="relative">
              <Icon size={22} />
              {to === '/mailbox' && unread > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-cheer text-white text-[9px] font-bold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
