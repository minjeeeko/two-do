import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(props: IconProps) {
  const { size = 24, ...rest } = props
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  }
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5.5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2V20h3a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5.5" cy="6.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="17.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M10 6.5h9M10 12h9M10 17.5h9" />
    </svg>
  )
}

export function GrassIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="4.3" height="4.3" rx="1" />
      <rect x="10" y="3.5" width="4.3" height="4.3" rx="1" />
      <rect x="16.5" y="3.5" width="4.3" height="4.3" rx="1" />
      <rect x="3.5" y="10" width="4.3" height="4.3" rx="1" />
      <rect x="10" y="10" width="4.3" height="4.3" rx="1" />
      <rect x="16.5" y="10" width="4.3" height="4.3" rx="1" />
      <rect x="3.5" y="16.5" width="4.3" height="4.3" rx="1" />
      <rect x="10" y="16.5" width="4.3" height="4.3" rx="1" />
      <rect x="16.5" y="16.5" width="4.3" height="4.3" rx="1" />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.6l1-1.6a1.5 1.5 0 0 1 1.27-.7h5.26a1.5 1.5 0 0 1 1.27.7l1 1.6h1.6A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
      <circle cx="12" cy="13" r="3.3" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3s4 3.5 4 8a4 4 0 1 1-8 0c0-1 .4-1.8 1-2.5-.1 1 .3 1.8 1 2 .3-2.5 2-3 2-5.5Z" />
    </svg>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 3 2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19.3l1.3-6-4.6-4.1 6.1-.6Z" />
    </svg>
  )
}

export function SeedIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21c-4-1-6-4.5-6-8.5C6 8 9 5 12 3c3 2 6 5 6 9.5 0 4-2 7.5-6 8.5Z" />
      <path d="M12 21V11" />
    </svg>
  )
}

export function HouseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8" />
      <circle cx="12" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20s-7-4.4-9.5-9C.8 7.5 2.3 4 5.8 4c1.9 0 3.4 1 4.2 2.4C10.8 5 12.3 4 14.2 4c3.5 0 5 3.5 3.3 7-2.5 4.6-9.5 9-9.5 9Z" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .33-1.87 1.7 1.7 0 0 0-1.55-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.33-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.33H10a1.7 1.7 0 0 0 1-1.55V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.56 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 5 6v5.5c0 5 3 8 7 9 4-1 7-4 7-9V6Z" />
      <path d="m9 12 2 2 4-4.2" />
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18 7" />
    </svg>
  )
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14 7 3 3" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v11m0 0-4-4m4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10.5" width="14" height="9" rx="2" />
      <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
    </svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8.5" cy="8" r="2.8" />
      <circle cx="16" cy="9" r="2.2" />
      <path d="M3 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M14.5 14.3c2.3.3 4 2 4 4.7" />
    </svg>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 3 3 10.5l7 2.5m11-10L13 21l-3-8m11-10L10 13" />
    </svg>
  )
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.3 5.2a3.5 3.5 0 1 1 5 5L16 11.5" />
      <path d="M13 17.5 11.7 18.8a3.5 3.5 0 1 1-5-5L8 12.5" />
    </svg>
  )
}

export function ArchiveIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="4" rx="1" />
      <path d="M5 8.5v9a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 17.5v-9" />
      <path d="M10 12.5h4" />
    </svg>
  )
}
