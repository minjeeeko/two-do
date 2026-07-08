import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TopBar } from '../components/TopBar'
import { Avatar, Button } from '../components/ui'
import { CameraIcon } from '../components/icons'
import { compressImageToDataUrl, ImageValidationError } from '../lib/image'
import { todayStr } from '../lib/date'

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
  const [startDate, setStart] = useState(couple.startDate ?? couple.connectedAt.slice(0, 10))
  const [imgError, setImgError] = useState('')

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
    updateProfile({ nickname, avatarUrl: avatarUrl ?? null })
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
            <Avatar label={nickname || '?'} size={92} tone="brand" src={avatarUrl} />
            <span className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center border-2 border-canvas">
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
