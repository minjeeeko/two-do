import type { BadgeDef, Interest, MissionTemplate } from '../types'

export const INTERESTS: Interest[] = [
  { key: 'exercise', label: '운동' },
  { key: 'study', label: '공부' },
  { key: 'reading', label: '독서' },
  { key: 'language', label: '외국어' },
  { key: 'project', label: '프로젝트' },
  { key: 'mindfulness', label: '마음챙김' },
  { key: 'cooking', label: '요리' },
  { key: 'sleep', label: '수면 루틴' },
  { key: 'finance', label: '자산관리' },
  { key: 'creativity', label: '창작' },
]

export const TONE_OPTIONS: { key: 'bright' | 'calm' | 'minimal'; label: string; desc: string }[] = [
  { key: 'bright', label: '밝은', desc: '따뜻하고 활기찬 색' },
  { key: 'calm', label: '차분', desc: '은은하고 편안한 색' },
  { key: 'minimal', label: '미니멀', desc: '텍스트 중심, 여백 강조' },
]

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'tmpl-walk',
    title: '주 2회 같이 걷기',
    description: '가볍게 30분, 같이 걸으면서 하루를 나눠요',
    category: 'exercise',
    frequency: { type: 'weekly', timesPerWeek: 2 },
    requiresCategories: ['exercise'],
  },
  {
    id: 'tmpl-focus',
    title: '평일 3일 20분 같이 집중하기',
    description: '각자 할 일을 옆에서 20분만 같이 집중해봐요',
    category: 'study',
    frequency: { type: 'weekly', timesPerWeek: 3 },
    requiresCategories: ['study'],
  },
  {
    id: 'tmpl-read',
    title: '주 3회 15분 같이 읽기',
    description: '같은 시간, 각자의 책을 펼쳐요',
    category: 'reading',
    frequency: { type: 'weekly', timesPerWeek: 3 },
    requiresCategories: ['reading'],
  },
  {
    id: 'tmpl-mind',
    title: '매일 5분 같이 마음챙김',
    description: '잠들기 전 5분, 오늘 하루를 정리해요',
    category: 'mindfulness',
    frequency: { type: 'daily' },
    requiresCategories: ['mindfulness'],
  },
  {
    id: 'tmpl-cook',
    title: '주 1회 같이 요리하기',
    description: '주말에 한 끼는 같이 만들어봐요',
    category: 'cooking',
    frequency: { type: 'weekly', timesPerWeek: 1 },
    requiresCategories: ['cooking'],
  },
  {
    id: 'tmpl-lang',
    title: '평일 매일 10분 같이 외국어',
    description: '짧게라도 매일, 서로 확인만 해줘요',
    category: 'language',
    frequency: { type: 'weekly', timesPerWeek: 5 },
    requiresCategories: ['language'],
  },
]

export const BADGE_CATALOG: BadgeDef[] = [
  { key: 'streak-3', title: '3일 연속', description: '3일 연속으로 인증했어요', icon: 'flame', scope: 'personal' },
  { key: 'streak-7', title: '7일 연속', description: '7일 연속으로 인증했어요', icon: 'flame', scope: 'personal' },
  { key: 'streak-30', title: '30일 연속', description: '한 달 내내 리듬을 이어갔어요', icon: 'flame', scope: 'personal' },
  { key: 'first-100', title: '첫 100포인트', description: '첫 100포인트를 모았어요', icon: 'sparkle', scope: 'personal' },
  { key: 'first-checkin', title: '첫 기록', description: '첫 인증을 남겼어요', icon: 'seed', scope: 'personal' },
  { key: 'couple-streak-7', title: '우리 7일', description: '우리가 7일 연속 함께 쌓았어요', icon: 'house', scope: 'couple' },
  { key: 'couple-goal-1', title: '첫 커플 목표', description: '첫 커플 목표를 달성했어요', icon: 'heart', scope: 'couple' },
  { key: 'cheer-10', title: '응원 10회', description: '서로에게 10번 응원을 남겼어요', icon: 'star', scope: 'couple' },
]

export const REACTION_EMOJIS = ['👍', '🎉', '❤️', '🔥', '👏', '😊']

export const CHEER_PRESETS = ['잘했어 오늘도!', '멋지다 우리', '이 정도면 완벽해', '역시 든든해', '나도 힘낼게']

export const CHORE_CATEGORIES = ['청소', '요리', '빨래', '설거지', '장보기', '운동', '공부', '기타']

export const CHORE_COMMENT_PRESETS = ['고마워!', '내가 도와줄게', '이따 같이 하자', '잘했어', '수고했어']

export function interestLabel(key: string): string {
  return INTERESTS.find((i) => i.key === key)?.label ?? key
}
