export interface AvatarColor {
  key: string
  label: string
  soft: string // soft background
  fg: string // readable foreground / accent text
  solid: string // solid accent
}

export const AVATAR_COLORS: AvatarColor[] = [
  { key: 'brand', label: '핑크', soft: '#ffe3ec', fg: '#e23f70', solid: '#ff5c8a' },
  { key: 'cheer', label: '코랄', soft: '#ffe4d6', fg: '#e2683a', solid: '#ff8a5c' },
  { key: 'grape', label: '보라', soft: '#ece3fb', fg: '#7c5cd6', solid: '#8b6ee0' },
  { key: 'sky', label: '블루', soft: '#e0edf8', fg: '#3f83bd', solid: '#5fa3d6' },
  { key: 'mint', label: '민트', soft: '#dcefe3', fg: '#2f9468', solid: '#54b087' },
  { key: 'sun', label: '노랑', soft: '#f9ecc7', fg: '#bd8b16', solid: '#e0ad3a' },
  { key: 'berry', label: '자두', soft: '#fbe0ec', fg: '#c0417e', solid: '#d95d97' },
  { key: 'ink', label: '차콜', soft: '#e6e5ea', fg: '#4c4753', solid: '#6b6472' },
]

export function avatarColor(key?: string): AvatarColor {
  return AVATAR_COLORS.find((c) => c.key === key) ?? AVATAR_COLORS[0]
}
