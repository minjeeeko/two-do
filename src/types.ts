export type Tone = 'bright' | 'calm' | 'minimal'
export type Visibility = 'summary' | 'detail' | 'private'
export type MissionOwnerType = 'personal' | 'couple'
export type FrequencyType = 'daily' | 'weekly'
export type CheckinMethod = 'check' | 'note' | 'photo'

export interface Interest {
  key: string
  label: string
}

export interface User {
  id: string
  nickname: string
  colorTag: string // avatar accent color
  avatarUrl?: string // profile image data URL
  interests: string[] // interest keys, min 3
  createdAt: string
}

export interface Couple {
  id: string
  name: string // 우리 집 이름
  tagline: string // 우리 한 줄
  tone: Tone
  memberIds: [string, string]
  connectedAt: string
  startDate?: string // YYYY-MM-DD, D-day origin (defaults to connectedAt)
  status: 'connected' | 'disconnected'
  disconnectedAt?: string
  points: number
  level: number
}

export type ChoreOwnerType = 'personal' | 'together'

/** A date-scoped to-do (할 일). */
export interface Chore {
  id: string
  coupleId: string
  ownerType: ChoreOwnerType
  ownerUserId?: string // for personal chores
  title: string
  description?: string
  category: string
  date: string // YYYY-MM-DD the chore is scheduled for
  completed: boolean
  completedAt?: string
  completedBy?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ChoreReaction {
  id: string
  choreId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface ChoreComment {
  id: string
  choreId: string
  userId: string
  text: string
  createdAt: string
}

export interface MissionFrequency {
  type: FrequencyType
  timesPerWeek?: number // used when type === 'weekly'
}

export interface Mission {
  id: string
  coupleId: string
  ownerType: MissionOwnerType
  ownerUserId?: string // required when ownerType === 'personal'
  title: string
  description?: string
  category: string
  frequency: MissionFrequency
  startDate: string
  endDate: string | null
  visibility: Visibility
  archived: boolean
  fromTemplateId?: string
  createdAt: string
  updatedAt: string
}

export interface CheckinMedia {
  type: 'photo'
  dataUrl?: string
  placeholder?: number
}

export interface Checkin {
  id: string
  missionId: string
  userId: string
  date: string // YYYY-MM-DD
  method: CheckinMethod
  note?: string
  media?: CheckinMedia
  visibility: Visibility
  createdAt: string
  updatedAt: string
}

export interface Reaction {
  id: string
  checkinId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface Cheer {
  id: string
  checkinId: string
  userId: string
  text: string
  createdAt: string
}

/** A standalone cheer message partners leave for each other on the 거실 home. */
export interface HouseMessage {
  id: string
  userId: string // author
  text: string
  createdAt: string
}

/** A hand-drawn letter (doodle) sent to the partner's home screen. */
export interface Letter {
  id: string
  userId: string // author
  imageDataUrl: string
  createdAt: string
  read: boolean
}

export type NotificationType =
  | 'checkin'
  | 'reaction'
  | 'cheer'
  | 'streak'
  | 'badge'
  | 'coupleGoal'
  | 'reminder'
  | 'system'
  | 'chore'
  | 'comment'
  | 'complete'
  | 'letter'

export interface AppNotification {
  id: string
  userId: string // recipient
  type: NotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  refId?: string
}

export interface Badge {
  id: string
  key: string
  title: string
  description: string
  icon: string
  scope: 'personal' | 'couple'
  userId?: string
  earnedAt: string
}

export interface BadgeDef {
  key: string
  title: string
  description: string
  icon: string
  scope: 'personal' | 'couple'
}

export interface PointsEntry {
  id: string
  scope: 'personal' | 'couple'
  userId?: string
  amount: number
  reason: string
  createdAt: string
}

export interface PrivacySettings {
  defaultVisibility: Visibility
  missionOverrides: Record<string, Visibility>
}

export interface NotificationSettings {
  pushEnabled: boolean
  cheerEnabled: boolean
  badgeEnabled: boolean
  streakEnabled: boolean
  reminderEnabled: boolean
  reminderTime: string // HH:mm
  quietHoursEnabled: boolean
  quietStart: string
  quietEnd: string
}

export interface AccessLogEntry {
  id: string
  actorUserId: string
  action: string
  targetType: string
  targetId: string
  createdAt: string
}

export interface MissionTemplate {
  id: string
  title: string
  description: string
  category: string
  frequency: MissionFrequency
  requiresCategories: string[] // interest keys both need for recommendation
}
