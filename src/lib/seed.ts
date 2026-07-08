import type {
  AccessLogEntry,
  AppNotification,
  Badge,
  Checkin,
  Cheer,
  Couple,
  Mission,
  PointsEntry,
  Reaction,
  User,
} from '../types'
import { makeId } from './id'
import { addDaysStr, daysAgoStr, todayStr } from './date'
import { BADGE_CATALOG, CHEER_PRESETS, REACTION_EMOJIS } from './catalog'

const NOTES = [
  '오늘도 완료! 뿌듯하다',
  '조금 피곤했지만 해냈어요',
  '생각보다 재밌었어요',
  '내일도 이 시간에',
  '짧게라도 꾸준히',
  '같이 하니까 더 잘되네',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function seedDemoData() {
  const u1Id = 'u_demo1'
  const u2Id = 'u_demo2'
  const coupleId = 'couple_demo'

  const users: Record<string, User> = {
    [u1Id]: {
      id: u1Id,
      nickname: '민지',
      colorTag: 'brand',
      interests: ['exercise', 'mindfulness', 'study'],
      createdAt: daysAgoStr(40) + 'T09:00:00.000Z',
    },
    [u2Id]: {
      id: u2Id,
      nickname: '준호',
      colorTag: 'cheer',
      interests: ['exercise', 'reading', 'project'],
      createdAt: daysAgoStr(40) + 'T09:05:00.000Z',
    },
  }

  const couple: Couple = {
    id: coupleId,
    name: '민지&준호의 우리 집',
    tagline: '오늘도 1%만, 같이 가자',
    tone: 'bright',
    memberIds: [u1Id, u2Id],
    connectedAt: daysAgoStr(40) + 'T09:10:00.000Z',
    status: 'connected',
    points: 0,
    level: 1,
  }

  const missionStart = daysAgoStr(35)
  const m1: Mission = {
    id: 'm_demo1',
    coupleId,
    ownerType: 'personal',
    ownerUserId: u1Id,
    title: '영단어 30분',
    description: '자기 전 30분, 오늘의 단어를 정리해요',
    category: 'study',
    frequency: { type: 'daily' },
    startDate: missionStart,
    endDate: null,
    visibility: 'summary',
    archived: false,
    createdAt: missionStart + 'T09:00:00.000Z',
    updatedAt: missionStart + 'T09:00:00.000Z',
  }
  const m2: Mission = {
    id: 'm_demo2',
    coupleId,
    ownerType: 'personal',
    ownerUserId: u2Id,
    title: '책 20페이지',
    description: '자기 전 20페이지씩',
    category: 'reading',
    frequency: { type: 'daily' },
    startDate: missionStart,
    endDate: null,
    visibility: 'summary',
    archived: false,
    createdAt: missionStart + 'T09:00:00.000Z',
    updatedAt: missionStart + 'T09:00:00.000Z',
  }
  const m3: Mission = {
    id: 'm_demo3',
    coupleId,
    ownerType: 'couple',
    title: '주 2회 같이 걷기',
    description: '가볍게 30분, 같이 걸으면서 하루를 나눠요',
    category: 'exercise',
    frequency: { type: 'weekly', timesPerWeek: 2 },
    startDate: missionStart,
    endDate: null,
    visibility: 'summary',
    archived: false,
    fromTemplateId: 'tmpl-walk',
    createdAt: missionStart + 'T09:00:00.000Z',
    updatedAt: missionStart + 'T09:00:00.000Z',
  }
  const m4: Mission = {
    id: 'm_demo4',
    coupleId,
    ownerType: 'couple',
    title: '평일 3일 20분 같이 집중하기',
    description: '각자 할 일을 옆에서 20분만 같이 집중해봐요',
    category: 'study',
    frequency: { type: 'weekly', timesPerWeek: 3 },
    startDate: missionStart,
    endDate: null,
    visibility: 'summary',
    archived: false,
    fromTemplateId: 'tmpl-focus',
    createdAt: missionStart + 'T09:00:00.000Z',
    updatedAt: missionStart + 'T09:00:00.000Z',
  }

  const missions: Record<string, Mission> = { [m1.id]: m1, [m2.id]: m2, [m3.id]: m3, [m4.id]: m4 }

  const checkins: Record<string, Checkin> = {}
  const reactions: Record<string, Reaction> = {}
  const cheers: Record<string, Cheer> = {}
  const pointsLog: PointsEntry[] = []

  const yesterday = daysAgoStr(1)
  const historyDays: string[] = []
  for (let d = missionStart; d <= yesterday; d = addDaysStr(d, 1)) historyDays.push(d)

  const forcedStreakDays = new Set(historyDays.slice(-7)) // last 7 history days forced done for personal streak

  function addCheckin(mission: Mission, userId: string, date: string, timeHint: string) {
    const method = Math.random() < 0.18 ? 'photo' : Math.random() < 0.4 ? 'note' : 'check'
    const c: Checkin = {
      id: makeId('c'),
      missionId: mission.id,
      userId,
      date,
      method,
      note: method === 'note' ? pick(NOTES) : method === 'photo' ? pick(NOTES) : undefined,
      media: method === 'photo' ? { type: 'photo', placeholder: Math.ceil(Math.random() * 4) } : undefined,
      visibility: 'summary',
      createdAt: `${date}T${timeHint}:00.000Z`,
      updatedAt: `${date}T${timeHint}:00.000Z`,
    }
    checkins[c.id] = c
    pointsLog.push({
      id: makeId('pt'),
      scope: 'personal',
      userId,
      amount: 10,
      reason: `${mission.title} 인증`,
      createdAt: c.createdAt,
    })
    if (mission.ownerType === 'couple') {
      pointsLog.push({
        id: makeId('pt'),
        scope: 'couple',
        amount: 10,
        reason: `${mission.title} 함께 인증`,
        createdAt: c.createdAt,
      })
    }

    const partnerId = mission.ownerType === 'personal' ? (userId === u1Id ? u2Id : u1Id) : userId === u1Id ? u2Id : u1Id
    if (Math.random() < 0.6) {
      const r: Reaction = {
        id: makeId('rx'),
        checkinId: c.id,
        userId: partnerId,
        emoji: pick(REACTION_EMOJIS),
        createdAt: `${date}T${addHour(timeHint)}:00.000Z`,
      }
      reactions[r.id] = r
    }
    if (Math.random() < 0.22) {
      const ch: Cheer = {
        id: makeId('ch'),
        checkinId: c.id,
        userId: partnerId,
        text: pick(CHEER_PRESETS),
        createdAt: `${date}T${addHour(timeHint)}:00.000Z`,
      }
      cheers[ch.id] = ch
    }
    return c
  }

  function addHour(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number)
    return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  for (const date of historyDays) {
    const forced = forcedStreakDays.has(date)
    if (forced || Math.random() < 0.78) addCheckin(m1, u1Id, date, '21:1' + Math.floor(Math.random() * 6))
    if (forced || Math.random() < 0.78) addCheckin(m2, u2Id, date, '22:0' + Math.floor(Math.random() * 6))

    const dow = new Date(date + 'T00:00:00').getDay()
    // couple walk ~2x/week: weekends bias
    if ((dow === 6 || dow === 0) && Math.random() < 0.8) {
      addCheckin(m3, Math.random() < 0.5 ? u1Id : u2Id, date, '10:0' + Math.floor(Math.random() * 6))
    } else if (Math.random() < 0.15) {
      addCheckin(m3, Math.random() < 0.5 ? u1Id : u2Id, date, '19:0' + Math.floor(Math.random() * 6))
    }
    // focus mission weekdays
    if (dow >= 1 && dow <= 5 && Math.random() < 0.55) {
      addCheckin(m4, Math.random() < 0.5 ? u1Id : u2Id, date, '20:0' + Math.floor(Math.random() * 6))
    }
  }

  // partner (u2) already checked in today's personal mission -> social proof for demo
  addCheckin(m2, u2Id, todayStr(), '08:1' + Math.floor(Math.random() * 5))

  couple.points = pointsLog.filter((p) => p.scope === 'couple').reduce((s, p) => s + p.amount, 0)
  couple.level = 1 + Math.floor(couple.points / 200)

  // badges
  const badges: Record<string, Badge> = {}
  function award(key: string, scope: 'personal' | 'couple', userId: string | undefined, earnedAt: string) {
    const def = BADGE_CATALOG.find((b) => b.key === key)!
    const b: Badge = { id: makeId('badge'), key, title: def.title, description: def.description, icon: def.icon, scope, userId, earnedAt }
    badges[b.id] = b
  }

  for (const uid of [u1Id, u2Id]) {
    const userCheckins = Object.values(checkins).filter((c) => c.userId === uid).sort((a, b) => (a.date < b.date ? -1 : 1))
    if (userCheckins.length > 0) award('first-checkin', 'personal', uid, userCheckins[0].createdAt)
    const personalPoints = pointsLog.filter((p) => p.scope === 'personal' && p.userId === uid)
    let running = 0
    for (const p of personalPoints) {
      running += p.amount
      if (running >= 100) {
        award('first-100', 'personal', uid, p.createdAt)
        break
      }
    }
    const doneDates = new Set(userCheckins.map((c) => c.date))
    let streak = 0
    let cursor = yesterday
    while (doneDates.has(cursor)) {
      streak++
      cursor = addDaysStr(cursor, -1)
    }
    for (const s of [3, 7, 30]) {
      if (streak >= s) award(`streak-${s}`, 'personal', uid, `${daysAgoStr(streak - s)}T22:00:00.000Z`)
    }
  }

  // couple streak: both users active same day
  const u1Dates = new Set(Object.values(checkins).filter((c) => c.userId === u1Id).map((c) => c.date))
  const u2Dates = new Set(Object.values(checkins).filter((c) => c.userId === u2Id).map((c) => c.date))
  let coupleStreak = 0
  let cursor = yesterday
  while (u1Dates.has(cursor) && u2Dates.has(cursor)) {
    coupleStreak++
    cursor = addDaysStr(cursor, -1)
  }
  if (coupleStreak >= 7) award('couple-streak-7', 'couple', undefined, `${daysAgoStr(coupleStreak - 7)}T22:00:00.000Z`)

  const walkCheckins = Object.values(checkins).filter((c) => c.missionId === m3.id)
  if (walkCheckins.length >= 2) award('couple-goal-1', 'couple', undefined, walkCheckins[1].createdAt)

  if (Object.keys(cheers).length >= 10) {
    const sorted = Object.values(cheers).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    award('cheer-10', 'couple', undefined, sorted[9].createdAt)
  }

  // notifications for current user (u1), most recent ones
  const notifications: Record<string, AppNotification> = {}
  function pushNotif(userId: string, type: AppNotification['type'], title: string, body: string, createdAt: string, read: boolean, refId?: string) {
    const n: AppNotification = { id: makeId('ntf'), userId, type, title, body, createdAt, read, refId }
    notifications[n.id] = n
  }

  const recentCheckins = Object.values(checkins)
    .filter((c) => c.userId === u2Id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 4)
  recentCheckins.forEach((c, i) => {
    const mission = missions[c.missionId]
    pushNotif(u1Id, 'checkin', '거실에 새 기록이 왔어요', `준호님이 "${mission.title}" 인증을 남겼어요`, c.createdAt, i > 0, c.id)
  })

  const recentReactionsToU1 = Object.values(reactions)
    .filter((r) => r.userId === u2Id && checkins[r.checkinId]?.userId === u1Id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3)
  recentReactionsToU1.forEach((r, i) => {
    pushNotif(u1Id, 'reaction', '응원이 도착했어요', `준호님이 ${r.emoji} 반응을 남겼어요`, r.createdAt, i > 0, r.checkinId)
  })

  const recentCheersToU1 = Object.values(cheers)
    .filter((c) => c.userId === u2Id && checkins[c.checkinId]?.userId === u1Id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 2)
  recentCheersToU1.forEach((c) => {
    pushNotif(u1Id, 'cheer', '짧은 격려가 도착했어요', `준호: "${c.text}"`, c.createdAt, true, c.checkinId)
  })

  Object.values(badges)
    .filter((b) => b.scope === 'couple' || b.userId === u1Id)
    .forEach((b) => {
      pushNotif(u1Id, 'badge', '새 뱃지를 모았어요', `${b.title} 뱃지를 획득했어요`, b.earnedAt, true, b.id)
    })

  const accessLog: AccessLogEntry[] = [
    { id: makeId('log'), actorUserId: u1Id, action: 'invite_create', targetType: 'couple', targetId: coupleId, createdAt: couple.connectedAt },
    { id: makeId('log'), actorUserId: u2Id, action: 'invite_accept', targetType: 'couple', targetId: coupleId, createdAt: couple.connectedAt },
  ]

  return {
    onboarded: true,
    onboardingStep: 'done' as const,
    currentUserId: u1Id,
    pendingInviteCode: null,
    users,
    couple,
    pastCoupleIds: [],
    missions,
    checkins,
    reactions,
    cheers,
    notifications,
    badges,
    pointsLog,
    accessLog,
  }
}
