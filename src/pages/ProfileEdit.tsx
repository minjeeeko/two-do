import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Avatar, Button } from '../components/ui'
import { CameraIcon, CheckIcon } from '../components/icons'
import { compressImageToDataUrl, ImageValidationError } from '../lib/image'
import { todayStr } from '../lib/date'
import { AVATAR_COLORS, avatarColor } from '../lib/colors'

export function ProfileEdit() {
  const state = useAppStore()
  const currentUserId = state.currentUserId!
  const user = state.users[currentUserId]
  const couple = state.couple!
  const updateProfile = useAppStore((s) => s.updateProfile)
  const setStartDate = useAppStore((s) => s.setStartDate)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl)
  const [colorKey, setColorKey] = useState(user?.colorTag ?? 'brand')
  const [startDate, setStart] = useState(couple.startDate ?? couple.connectedAt.slice(0, 10))
  const [imgError, setImgError] = useState('')

  const accent = avatarColor(colorKey)

  async function handlePick(file: File) {
    setImgError('')
    try {
      const dataUrl = await compressImageToDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch (e) {
      setImgError(e instanceof ImageValidationError ? e.message : '이미지를 처리하지 못했어요')
    }
  }

  const save = () => {
    if (!nickname.trim()) return
    updateProfile({ nickname, avatarUrl: avatarUrl ?? null, colorTag: colorKey })
    setStartDate(startDate)
    navigate(-1)
  }

  return (
    <div>
      <TopBar title="프로필 수정" back />
      <div className="px-5 pb-10">
        {/* avatar */}
        <div className="flex flex-col items-center py-4">
          <button onClick={() => fileRef.current?.click()} className="relative">
            <Avatar label={nickname || '?'} size={92} color={colorKey} src={avatarUrl} />
            <span
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white flex items-center justify-center border-2 border-canvas"
              style={{ backgroundColor: accent.solid }}
            >
              <CameraIcon size={16} />
            </span>
          </button>
          {avatarUrl && (
            <button
              onClick={() => setAvatarUrl(undefined)}
              className="text-[12px] text-ink-faint underline underline-offset-2 mt-2.5"
            >
              기본 이미지로 되돌리기
            </button>
          )}
          {imgError && <p className="text-[12px] text-danger mt-1.5">{imgError}</p>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handlePick(f)
            }}
          />
        </div>

        <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">이름</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand mb-5"
        />

        {/* key color */}
        <label className="block text-[13px] font-semibold text-ink-2 mb-2">내 키컬러</label>
        <div className="flex flex-wrap gap-2.5 mb-1">
          {AVATAR_COLORS.map((c) => {
            const active = colorKey === c.key
            return (
              <button
                key={c.key}
                onClick={() => setColorKey(c.key)}
                aria-label={c.label}
                className="h-10 w-10 rounded-full flex items-center justify-center border-2 transition-transform active:scale-95"
                style={{ backgroundColor: c.solid, borderColor: active ? c.fg : 'transparent' }}
              >
                {active && <CheckIcon size={18} className="text-white" />}
              </button>
            )
          })}
        </div>
        <p className="text-[11.5px] text-ink-faint mb-5">
          내 아바타와 응원 말풍선 등 내 색으로 <span style={{ color: accent.fg, fontWeight: 700 }}>{accent.label}</span>이(가)
          적용돼요
        </p>

        <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">함께 시작한 날</label>
        <input
          type="date"
          value={startDate}
          max={todayStr()}
          onChange={(e) => setStart(e.target.value)}
          className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand"
        />
        <p className="text-[11.5px] text-ink-faint mt-1.5">홈 화면의 &lsquo;함께한지 +N일&rsquo;에 반영돼요</p>

        <Button className="w-full mt-8" size="lg" onClick={save} disabled={!nickname.trim()}>
          저장하기
        </Button>
      </div>
    </div>
  )
}
