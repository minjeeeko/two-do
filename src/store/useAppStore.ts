import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AccessLogEntry,
  AppNotification,
  Badge,
  Checkin,
  CheckinMethod,
  CheckinMedia,
  Cheer,
  Couple,
  HouseMessage,
  Mission,
  MissionFrequency,
  NotificationSettings,
  NotificationType,
  PointsEntry,
  PrivacySettings,
  Reaction,
  Tone,
  User,
  Visibility,
} from '../types'
import { makeId, makeInviteCode } from '../lib/id'
import { todayStr } from '../lib/date'
import { BADGE_CATALOG, MISSION_TEMPLATES, REACTION_EMOJIS } from '../lib/catalog'
import { seedDemoData } from '../lib/seed'

interface AppState {
  hydrated: boolean
  onboarded: boolean
  onboardingStep: 'invite' | 'waiting' | 'house' | 'firstMission' | 'done'
  currentUserId: string | null
  pendingInviteCode: string | null
  users: Record<string, User>
  couple: Couple | null
  pastCoupleIds: string[]
  missions: Record<string, Mission>
  checkins: Record<string, Checkin>
  reactions: Record<string, Reaction>
  cheers: Record<string, Cheer>
  houseMessages: Record<string, HouseMessage>
  notifications: Record<string, AppNotification>
  badges: Record<string, Badge>
  pointsLog: PointsEntry[]
  privacy: PrivacySettings
  notifSettings: NotificationSettings
  accessLog: AccessLogEntry[]

  setHydrated: () => void

  // onboarding
  resetToOnboarding: () => void
  createSelfAndInvite: (nickname: string, interests: string[]) => void
  demoAcceptInvite: (partnerNickname: string, partnerInterests: string[]) => void
  setupHouse: (name: string, tagline: string, tone: Tone) => void
  addMissionFromTemplate: (templateId: string) => void
  finishOnboarding: () => void
  loadDemo: () => void

  // couple
  disconnectCouple: () => void
  startReconnect: () => void

  // missions
  createMission: (input: {
    ownerType: 'personal' | 'couple'
    title: string
    description?: string
    category: string
    frequency: MissionFrequency
    endDate: string | null
    visibility: Visibility
  }) => void
  updateMission: (id: string, patch: Partial<Mission>) => void
  deleteMission: (id: string) => void
  archiveMission: (id: string) => void

  // checkins
  checkIn: (
    missionId: string,
    input: { method: CheckinMethod; note?: string; media?: CheckinMedia; visibility?: Visibility }
  ) => void
  updateCheckin: (id: string, patch: Partial<Checkin>) => void
  deleteCheckin: (id: string) => void

  // reactions / cheers
  toggleReaction: (checkinId: string, emoji: string) => void
  addCheer: (checkinId: string, text: string) => void
  sendHouseMessage: (text: string) => void

  // notifications
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // settings
  updatePrivacy: (patch: Partial<PrivacySettings>) => void
  setMissionVisibilityOverride: (missionId: string, visibility: Visibility | null) => void
  updateNotifSettings: (patch: Partial<NotificationSettings>) => void
  exportDataJSON: () => string
  deleteAllData: () => void
}

const defaultPrivacy: PrivacySettings = {
  defaultVisibility: 'summary',
  missionOverrides: {},
}

const defaultNotifSettings: NotificationSettings = {
  pushEnabled: true,
  cheerEnabled: true,
  badgeEnabled: true,
  streakEnabled: true,
  reminderEnabled: false,
  reminderTime: '21:00',
  quietHoursEnabled: true,
  quietStart: '23:00',
  quietEnd: '08:00',
}

function emptyState() {
  return {
    hydrated: true,
    onboarded: false,
    onboardingStep: 'invite' as const,
    currentUserId: null,
    pendingInviteCode: null,
    users: {},
    couple: null,
    pastCoupleIds: [],
    missions: {},
    checkins: {},
    reactions: {},
    cheers: {},
    houseMessages: {},
    notifications: {},
    badges: {},
    pointsLog: [],
    privacy: defaultPrivacy,
    notifSettings: defaultNotifSettings,
    accessLog: [],
  }
}

function logAccess(actorUserId: string, action: string, targetType: string, targetId: string): AccessLogEntry {
  return { id: makeId('log'), actorUserId, action, targetType, targetId, createdAt: new Date().toISOString() }
}

function notify(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  refId?: string
): AppNotification {
  return { id: makeId('ntf'), userId, type, title, body, createdAt: new Date().toISOString(), read: false, refId }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyState(),

      setHydrated: () => set({ hydrated: true }),

      resetToOnboarding: () => set({ ...emptyState() }),

      createSelfAndInvite: (nickname, interests) => {
        const id = makeId('u')
        const user: User = { id, nickname, colorTag: 'brand', interests, createdAt: new Date().toISOString() }
        set({
          currentUserId: id,
          users: { [id]: user },
          pendingInviteCode: makeInviteCode(),
          onboardingStep: 'waiting',
        })
      },

      demoAcceptInvite: (partnerNickname, partnerInterests) => {
        const state = get()
        if (!state.currentUserId) return
        const partnerId = makeId('u')
        const partner: User = {
          id: partnerId,
          nickname: partnerNickname,
          colorTag: 'cheer',
          interests: partnerInterests,
          createdAt: new Date().toISOString(),
        }
        const coupleId = makeId('couple')
        const couple: Couple = {
          id: coupleId,
          name: '우리 집',
          tagline: '오늘도 같이',
          tone: 'bright',
          memberIds: [state.currentUserId, partnerId],
          connectedAt: new Date().toISOString(),
          status: 'connected',
          points: 0,
          level: 1,
        }
        set({
          users: { ...state.users, [partnerId]: partner },
          couple,
          pendingInviteCode: null,
          onboardingStep: 'house',
        })
      },

      setupHouse: (name, tagline, tone) => {
        const state = get()
        if (!state.couple) return
        set({ couple: { ...state.couple, name, tagline, tone }, onboardingStep: 'firstMission' })
      },

      addMissionFromTemplate: (templateId) => {
        const state = get()
        if (!state.couple) return
        const tmpl = MISSION_TEMPLATES.find((t) => t.id === templateId)
        if (!tmpl) return
        const id = makeId('m')
        const now = new Date().toISOString()
        const mission: Mission = {
          id,
          coupleId: state.couple.id,
          ownerType: 'couple',
          title: tmpl.title,
          description: tmpl.description,
          category: tmpl.category,
          frequency: tmpl.frequency,
          startDate: todayStr(),
          endDate: null,
          visibility: 'summary',
          archived: false,
          fromTemplateId: tmpl.id,
          createdAt: now,
          updatedAt: now,
        }
        set({ missions: { ...state.missions, [id]: mission } })
      },

      finishOnboarding: () => set({ onboarded: true, onboardingStep: 'done' }),

      loadDemo: () => {
        const demo = seedDemoData()
        set({ ...demo, hydrated: true, onboarded: true, onboardingStep: 'done' })
      },

      disconnectCouple: () => {
        const state = get()
        if (!state.couple || !state.currentUserId) return
        set({
          couple: { ...state.couple, status: 'disconnected', disconnectedAt: new Date().toISOString() },
          pastCoupleIds: [...state.pastCoupleIds, state.couple.id],
          accessLog: [...state.accessLog, logAccess(state.currentUserId, 'disconnect', 'couple', state.couple.id)],
        })
      },

      startReconnect: () => {
        const state = get()
        set({
          couple: null,
          missions: {},
          onboardingStep: 'invite',
          pendingInviteCode: null,
          onboarded: false,
        })
        void state
      },

      createMission: (input) => {
        const state = get()
        if (!state.couple || !state.currentUserId) return
        const id = makeId('m')
        const now = new Date().toISOString()
        const mission: Mission = {
          id,
          coupleId: state.couple.id,
          ownerType: input.ownerType,
          ownerUserId: input.ownerType === 'personal' ? state.currentUserId : undefined,
          title: input.title,
          description: input.description,
          category: input.category,
          frequency: input.frequency,
          startDate: todayStr(),
          endDate: input.endDate,
          visibility: input.visibility,
          archived: false,
          createdAt: now,
          updatedAt: now,
        }
        set({ missions: { ...state.missions, [id]: mission } })
      },

      updateMission: (id, patch) => {
        const state = get()
        const mission = state.missions[id]
        if (!mission) return
        const isCompleted = mission.endDate !== null && mission.endDate < todayStr()
        if (isCompleted) return
        set({
          missions: {
            ...state.missions,
            [id]: { ...mission, ...patch, updatedAt: new Date().toISOString() },
          },
        })
      },

      deleteMission: (id) => {
        const state = get()
        const missions = { ...state.missions }
        delete missions[id]
        set({ missions })
      },

      archiveMission: (id) => {
        const state = get()
        const mission = state.missions[id]
        if (!mission) return
        set({ missions: { ...state.missions, [id]: { ...mission, archived: true } } })
      },

      checkIn: (missionId, input) => {
        const state = get()
        const mission = state.missions[missionId]
        if (!mission || !state.currentUserId || !state.couple) return
        const userId = state.currentUserId
        const date = todayStr()
        const existing = Object.values(state.checkins).find(
          (c) => c.missionId === missionId && c.userId === userId && c.date === date
        )
        const now = new Date().toISOString()
        const visibility = input.visibility ?? state.privacy.missionOverrides[missionId] ?? mission.visibility

        let checkinId = existing?.id ?? makeId('c')
        const checkin: Checkin = {
          id: checkinId,
          missionId,
          userId,
          date,
          method: input.method,
          note: input.note,
          media: input.media,
          visibility,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        }

        const checkins = { ...state.checkins, [checkinId]: checkin }
        const isNew = !existing

        let pointsLog = state.pointsLog
        let users = state.users
        let couple = state.couple
        let badges = state.badges
        let notifications = state.notifications
        let reactions = state.reactions

        if (isNew) {
          // points
          const gain = 10
          pointsLog = [
            ...pointsLog,
            { id: makeId('pt'), scope: 'personal', userId, amount: gain, reason: `${mission.title} 인증`, createdAt: now },
          ]
          if (mission.ownerType === 'couple') {
            couple = { ...couple, points: couple.points + gain }
            pointsLog = [
              ...pointsLog,
              { id: makeId('pt'), scope: 'couple', amount: gain, reason: `${mission.title} 함께 인증`, createdAt: now },
            ]
          }
          couple = { ...couple, level: 1 + Math.floor(couple.points / 200) }

          // badges: first checkin
          const userCheckinCount = Object.values(checkins).filter((c) => c.userId === userId).length
          const earned: Badge[] = []
          if (userCheckinCount === 1) {
            earned.push(mkBadge('first-checkin', userId))
          }
          const personalPoints = pointsLog
            .filter((p) => p.scope === 'personal' && p.userId === userId)
            .reduce((s, p) => s + p.amount, 0)
          if (personalPoints >= 100 && !hasBadge(badges, 'first-100', userId)) {
            earned.push(mkBadge('first-100', userId))
          }
          // streak badges
          const userDoneDates = new Set(
            Object.values(checkins)
              .filter((c) => c.userId === userId)
              .map((c) => c.date)
          )
          const streak = calcStreakLocal(userDoneDates, date)
          for (const s of [3, 7, 30]) {
            if (streak === s && !hasBadge(badges, `streak-${s}`, userId)) {
              earned.push(mkBadge(`streak-${s}`, userId))
            }
          }
          if (earned.length) {
            badges = { ...badges, ...Object.fromEntries(earned.map((b) => [b.id, b])) }
            notifications = {
              ...notifications,
              ...Object.fromEntries(
                earned.map((b) => {
                  const n = notify(userId, 'badge', '새 뱃지를 모았어요', `${b.title} 뱃지를 획득했어요`, b.id)
                  return [n.id, n]
                })
              ),
            }
          }

          // notify partner
          const partnerId = couple.memberIds.find((m) => m !== userId)
          if (partnerId) {
            const n = notify(
              partnerId,
              'checkin',
              '거실에 새 기록이 왔어요',
              `${users[userId]?.nickname ?? '상대'}님이 "${mission.title}" 인증을 남겼어요`,
              checkinId
            )
            notifications = { ...notifications, [n.id]: n }

            // simulated partner reaction for a livelier demo loop
            if (Math.random() < 0.7) {
              const emoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)]
              const r: Reaction = { id: makeId('rx'), checkinId, userId: partnerId, emoji, createdAt: now }
              reactions = { ...reactions, [r.id]: r }
              const n2 = notify(
                userId,
                'reaction',
                '응원이 도착했어요',
                `${users[partnerId]?.nickname ?? '상대'}님이 ${emoji} 반응을 남겼어요`,
                checkinId
              )
              notifications = { ...notifications, [n2.id]: n2 }
            }
          }
        }

        set({ checkins, pointsLog, users, couple, badges, notifications, reactions })
      },

      updateCheckin: (id, patch) => {
        const state = get()
        const c = state.checkins[id]
        if (!c) return
        set({ checkins: { ...state.checkins, [id]: { ...c, ...patch, updatedAt: new Date().toISOString() } } })
      },

      deleteCheckin: (id) => {
        const state = get()
        const checkins = { ...state.checkins }
        delete checkins[id]
        set({ checkins })
      },

      toggleReaction: (checkinId, emoji) => {
        const state = get()
        if (!state.currentUserId) return
        const userId = state.currentUserId
        const existing = Object.values(state.reactions).find(
          (r) => r.checkinId === checkinId && r.userId === userId && r.emoji === emoji
        )
        const reactions = { ...state.reactions }
        let notifications = state.notifications
        if (existing) {
          delete reactions[existing.id]
        } else {
          const r: Reaction = { id: makeId('rx'), checkinId, userId, emoji, createdAt: new Date().toISOString() }
          reactions[r.id] = r
          const checkin = state.checkins[checkinId]
          if (checkin && checkin.userId !== userId) {
            const n = notify(
              checkin.userId,
              'reaction',
              '응원이 도착했어요',
              `${state.users[userId]?.nickname ?? '상대'}님이 ${emoji} 반응을 남겼어요`,
              checkinId
            )
            notifications = { ...notifications, [n.id]: n }
          }
        }
        set({ reactions, notifications })
      },

      addCheer: (checkinId, text) => {
        const state = get()
        if (!state.currentUserId || !text.trim()) return
        const userId = state.currentUserId
        const c: Cheer = { id: makeId('ch'), checkinId, userId, text: text.trim(), createdAt: new Date().toISOString() }
        let notifications = state.notifications
        const checkin = state.checkins[checkinId]
        if (checkin && checkin.userId !== userId) {
          const n = notify(
            checkin.userId,
            'cheer',
            '짧은 격려가 도착했어요',
            `${state.users[userId]?.nickname ?? '상대'}: "${c.text}"`,
            checkinId
          )
          notifications = { ...notifications, [n.id]: n }
        }
        const cheerCount = Object.keys(state.cheers).length + 1
        let badges = state.badges
        if (cheerCount >= 10 && state.couple && !hasBadgeCouple(badges, 'cheer-10')) {
          const b = mkCoupleBadge('cheer-10')
          badges = { ...badges, [b.id]: b }
        }
        set({ cheers: { ...state.cheers, [c.id]: c }, notifications, badges })
      },

      sendHouseMessage: (text) => {
        const state = get()
        if (!state.currentUserId || !state.couple || !text.trim()) return
        const userId = state.currentUserId
        const msg: HouseMessage = {
          id: makeId('hm'),
          userId,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        }
        let notifications = state.notifications
        const partnerId = state.couple.memberIds.find((m) => m !== userId)
        if (partnerId) {
          const n = notify(
            partnerId,
            'cheer',
            '거실에 응원이 도착했어요',
            `${state.users[userId]?.nickname ?? '상대'}: "${msg.text}"`,
            msg.id
          )
          notifications = { ...notifications, [n.id]: n }
        }
        set({ houseMessages: { ...state.houseMessages, [msg.id]: msg }, notifications })
      },

      markNotificationRead: (id) => {
        const state = get()
        const n = state.notifications[id]
        if (!n) return
        set({ notifications: { ...state.notifications, [id]: { ...n, read: true } } })
      },

      markAllNotificationsRead: () => {
        const state = get()
        if (!state.currentUserId) return
        const uid = state.currentUserId
        const notifications = { ...state.notifications }
        for (const key of Object.keys(notifications)) {
          if (notifications[key].userId === uid) notifications[key] = { ...notifications[key], read: true }
        }
        set({ notifications })
      },

      updatePrivacy: (patch) => set((s) => ({ privacy: { ...s.privacy, ...patch } })),

      setMissionVisibilityOverride: (missionId, visibility) => {
        const state = get()
        const overrides = { ...state.privacy.missionOverrides }
        if (visibility === null) delete overrides[missionId]
        else overrides[missionId] = visibility
        set({ privacy: { ...state.privacy, missionOverrides: overrides } })
      },

      updateNotifSettings: (patch) => set((s) => ({ notifSettings: { ...s.notifSettings, ...patch } })),

      exportDataJSON: () => {
        const state = get()
        const { hydrated, ...data } = state
        void hydrated
        return JSON.stringify(data, null, 2)
      },

      deleteAllData: () => set({ ...emptyState() }),
    }),
    {
      name: 'domo-store-v2',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)

function calcStreakLocal(doneDates: Set<string>, endDateStr: string): number {
  let streak = 0
  let cursor = endDateStr
  const addDays = (d: string, n: number) => {
    const dt = new Date(d + 'T00:00:00')
    dt.setDate(dt.getDate() + n)
    return dt.toISOString().slice(0, 10)
  }
  if (!doneDates.has(cursor)) cursor = addDays(cursor, -1)
  while (doneDates.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

function mkBadge(key: string, userId: string): Badge {
  const def = BADGE_CATALOG.find((b) => b.key === key)!
  return {
    id: makeId('badge'),
    key,
    title: def.title,
    description: def.description,
    icon: def.icon,
    scope: 'personal',
    userId,
    earnedAt: new Date().toISOString(),
  }
}

function mkCoupleBadge(key: string): Badge {
  const def = BADGE_CATALOG.find((b) => b.key === key)!
  return {
    id: makeId('badge'),
    key,
    title: def.title,
    description: def.description,
    icon: def.icon,
    scope: 'couple',
    earnedAt: new Date().toISOString(),
  }
}

function hasBadge(badges: Record<string, Badge>, key: string, userId: string): boolean {
  return Object.values(badges).some((b) => b.key === key && b.userId === userId)
}

function hasBadgeCouple(badges: Record<string, Badge>, key: string): boolean {
  return Object.values(badges).some((b) => b.key === key && b.scope === 'couple')
}
