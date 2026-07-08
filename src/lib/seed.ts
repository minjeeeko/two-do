import type {
  AccessLogEntry,
  AppNotification,
  Chore,
  ChoreComment,
  ChoreReaction,
  Couple,
  HouseMessage,
  Letter,
  User,
} from '../types'
import { makeId } from './id'
import { addDaysStr, daysAgoStr, todayStr } from './date'
import { CHORE_CATEGORIES, CHORE_COMMENT_PRESETS, REACTION_EMOJIS } from './catalog'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// a hand-drawn-style doodle used as the demo 손편지
const DEMO_LETTER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='320' viewBox='0 0 420 320'>
  <rect width='420' height='320' fill='#fffdf8'/>
  <path d='M210 130 C188 96 132 108 144 158 C154 198 210 232 210 232 C210 232 266 198 276 158 C288 108 232 96 210 130 Z' fill='none' stroke='#ff5c8a' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/>
  <path d='M70 250 q26 -24 52 0 t52 0 t52 0' fill='none' stroke='#ff8a5c' stroke-width='5' stroke-linecap='round'/>
  <circle cx='120' cy='90' r='4' fill='#ff5c8a'/>
  <circle cx='300' cy='96' r='4' fill='#8b6ee0'/>
  <path d='M96 120 l14 14 M110 120 l-14 14' stroke='#8b6ee0' stroke-width='4' stroke-linecap='round'/>
  <path d='M320 150 q14 16 0 32' fill='none' stroke='#54b087' stroke-width='4' stroke-linecap='round'/>
</svg>`

function demoLetterDataUrl(): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(DEMO_LETTER_SVG)}`
}

const PERSONAL_CHORES: Record<string, [string, string, string][]> = {
  // userKey -> [title, description, category]
  u1: [
    ['영단어 30분', '자기 전 오늘의 단어 정리', '공부'],
    ['홈트 20분', '스쿼트 + 플랭크', '운동'],
    ['빨래 개기', '건조기 돌린 거 정리', '빨래'],
  ],
  u2: [
    ['책 20페이지', '자기 전 독서', '공부'],
    ['방 청소', '책상 정리하기', '청소'],
    ['설거지', '저녁 먹은 그릇', '설거지'],
  ],
}

const TOGETHER_CHORES: [string, string, string][] = [
  ['같이 장보기', '이번 주 먹을 거 사기', '장보기'],
  ['저녁 같이 만들기', '파스타 해먹기', '요리'],
  ['같이 산책 30분', '동네 한 바퀴', '운동'],
  ['분리수거', '주말에 같이 버리기', '청소'],
]

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
    name: '우리 집',
    tagline: '오늘도 1%만, 같이 가자',
    tone: 'bright',
    memberIds: [u1Id, u2Id],
    connectedAt: daysAgoStr(40) + 'T09:10:00.000Z',
    startDate: daysAgoStr(40),
    status: 'connected',
    points: 0,
    level: 1,
  }

  const chores: Record<string, Chore> = {}
  const choreReactions: Record<string, ChoreReaction> = {}
  const choreComments: Record<string, ChoreComment> = {}
  const today = todayStr()

  function addChore(
    ownerType: 'personal' | 'together',
    ownerUserId: string | undefined,
    createdBy: string,
    [title, description, category]: [string, string, string],
    date: string,
    completed: boolean,
    hour: string
  ): Chore {
    const id = makeId('chore')
    const createdAt = `${date}T${hour}:00.000Z`
    const chore: Chore = {
      id,
      coupleId,
      ownerType,
      ownerUserId,
      title,
      description,
      category,
      date,
      completed,
      completedAt: completed ? `${date}T${hour}:30.000Z` : undefined,
      completedBy: completed ? (ownerType === 'together' ? pick([u1Id, u2Id]) : ownerUserId) : undefined,
      createdBy,
      createdAt,
      updatedAt: createdAt,
    }
    chores[id] = chore

    // scatter a few reactions / comments from the partner
    const partnerId = createdBy === u1Id ? u2Id : u1Id
    if (Math.random() < 0.45) {
      const r: ChoreReaction = {
        id: makeId('crx'),
        choreId: id,
        userId: partnerId,
        emoji: pick(REACTION_EMOJIS),
        createdAt: `${date}T${hour}:40.000Z`,
      }
      choreReactions[r.id] = r
    }
    if (Math.random() < 0.25) {
      const c: ChoreComment = {
        id: makeId('cmt'),
        choreId: id,
        userId: partnerId,
        text: pick(CHORE_COMMENT_PRESETS),
        createdAt: `${date}T${hour}:45.000Z`,
      }
      choreComments[c.id] = c
    }
    return chore
  }

  // build chores across [today-9 .. today+2]
  for (let offset = -9; offset <= 2; offset++) {
    const date = addDaysStr(today, offset)
    const isPast = offset < 0
    const isToday = offset === 0

    // personal chores for each user
    for (const [uKey, uid] of [
      ['u1', u1Id],
      ['u2', u2Id],
    ] as const) {
      const pool = PERSONAL_CHORES[uKey]
      const count = offset > 1 ? 0 : 1 + (Math.random() < 0.5 ? 1 : 0)
      const chosen = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
      chosen.forEach((item, i) => {
        const completed = isPast ? Math.random() < 0.8 : isToday ? Math.random() < 0.4 : false
        addChore('personal', uid, uid, item, date, completed, `2${i}:0${Math.floor(Math.random() * 6)}`)
      })
    }

    // together chore some days
    if (offset <= 1 && Math.random() < 0.5) {
      const completed = isPast ? Math.random() < 0.75 : false
      const creator = pick([u1Id, u2Id])
      addChore('together', undefined, creator, pick(TOGETHER_CHORES), date, completed, `1${Math.floor(Math.random() * 8)}:00`)
    }
  }

  // make sure today has a clear picture: one done, some pending
  addChore('personal', u2Id, u2Id, PERSONAL_CHORES.u2[0], today, true, '08:10')
  addChore('together', undefined, u2Id, TOGETHER_CHORES[0], today, false, '09:00')

  // house messages (거실 응원 말풍선)
  const houseMessages: Record<string, HouseMessage> = {}
  const seedMessages: [string, string, string][] = [
    [u2Id, '오늘도 화이팅! 나 먼저 인증했어', today + 'T08:20:00.000Z'],
    [u1Id, '고마워 준호야, 나도 이따 할게', today + 'T08:35:00.000Z'],
    [u2Id, '어제 같이 장본 거 좋았다', daysAgoStr(1) + 'T21:10:00.000Z'],
  ]
  for (const [uid, text, createdAt] of seedMessages) {
    const m: HouseMessage = { id: makeId('hm'), userId: uid, text, createdAt }
    houseMessages[m.id] = m
  }

  // a hand-drawn letter from 준호, waiting on 민지's home
  const letters: Record<string, Letter> = {}
  const demoLetter: Letter = {
    id: makeId('ltr'),
    userId: u2Id,
    imageDataUrl: demoLetterDataUrl(),
    createdAt: today + 'T07:50:00.000Z',
    read: false,
  }
  letters[demoLetter.id] = demoLetter

  // notifications for the current user (u1)
  const notifications: Record<string, AppNotification> = {}
  function pushNotif(type: AppNotification['type'], title: string, body: string, createdAt: string, read: boolean, refId?: string) {
    const n: AppNotification = { id: makeId('ntf'), userId: u1Id, type, title, body, createdAt, read, refId }
    notifications[n.id] = n
  }

  // partner-created chores
  Object.values(chores)
    .filter((c) => c.createdBy === u2Id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3)
    .forEach((c, i) => {
      pushNotif(
        'chore',
        c.ownerType === 'together' ? '새 우리 할 일이 등록됐어요' : '준호님이 새 할 일을 등록했어요',
        `준호: "${c.title}"`,
        c.createdAt,
        i > 0,
        c.id
      )
    })

  // partner reactions / comments on the current user's chores
  Object.values(choreReactions)
    .filter((r) => r.userId === u2Id && chores[r.choreId]?.createdBy === u1Id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 2)
    .forEach((r, i) => {
      pushNotif('reaction', '반응이 도착했어요', `준호님이 "${chores[r.choreId].title}"에 ${r.emoji}`, r.createdAt, i > 0, r.choreId)
    })

  Object.values(choreComments)
    .filter((c) => c.userId === u2Id && chores[c.choreId]?.createdBy === u1Id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 2)
    .forEach((c) => {
      pushNotif('comment', '댓글이 달렸어요', `준호: "${c.text}"`, c.createdAt, true, c.choreId)
    })

  // partner completions
  Object.values(chores)
    .filter((c) => c.completed && c.completedBy === u2Id)
    .sort((a, b) => ((a.completedAt ?? '') < (b.completedAt ?? '') ? 1 : -1))
    .slice(0, 2)
    .forEach((c) => {
      pushNotif('complete', '할 일을 완료했어요', `준호님이 "${c.title}"을(를) 끝냈어요`, c.completedAt!, true, c.id)
    })

  // letter notification
  pushNotif('letter', '손편지가 도착했어요', '준호님이 손편지를 보냈어요', demoLetter.createdAt, false, demoLetter.id)

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
    chores,
    choreReactions,
    choreComments,
    choreCategories: [...CHORE_CATEGORIES],
    houseMessages,
    letters,
    notifications,
    accessLog,
  }
}
