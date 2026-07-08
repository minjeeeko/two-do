import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Sheet } from './Sheet'
import { Button, Chip } from './ui'
import { PlusIcon } from './icons'
import { formatKoreanDate } from '../lib/date'
import type { ChoreOwnerType } from '../types'

export function AddChoreSheet({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const categories = useAppStore((s) => s.choreCategories)
  const addChore = useAppStore((s) => s.addChore)
  const addCategory = useAppStore((s) => s.addChoreCategory)

  const [ownerType, setOwnerType] = useState<ChoreOwnerType>('personal')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '기타')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [touched, setTouched] = useState(false)

  const reset = () => {
    setOwnerType('personal')
    setTitle('')
    setDescription('')
    setCategory(categories[0] ?? '기타')
    setAddingCategory(false)
    setNewCategory('')
    setTouched(false)
  }

  const submit = () => {
    setTouched(true)
    if (!title.trim()) return
    addChore({ ownerType, title, description, category, date })
    reset()
    onClose()
  }

  const confirmNewCategory = () => {
    const label = newCategory.trim()
    if (!label) return
    addCategory(label)
    setCategory(label)
    setNewCategory('')
    setAddingCategory(false)
  }

  return (
    <Sheet open={open} onClose={onClose} title="집안일 추가하기">
      <p className="text-[12px] text-ink-muted mb-4">{formatKoreanDate(date)}에 추가돼요</p>

      {/* 개인 / 같이 */}
      <label className="block text-[13px] font-semibold text-ink-2 mb-2">누구의 일인가요</label>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={() => setOwnerType('personal')}
          className={`h-11 rounded-md border text-[13.5px] font-semibold ${
            ownerType === 'personal' ? 'border-info bg-info-soft text-info' : 'border-line text-ink-2'
          }`}
        >
          개인
        </button>
        <button
          onClick={() => setOwnerType('together')}
          className={`h-11 rounded-md border text-[13.5px] font-semibold ${
            ownerType === 'together' ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-2'
          }`}
        >
          같이
        </button>
      </div>

      {/* 이름 */}
      <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">해야할 일</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="예: 설거지"
        className="w-full h-11 rounded-sm border border-line px-3.5 text-[14px] outline-none focus:border-brand"
      />
      {touched && !title.trim() && <p className="text-[12px] text-danger mt-1">이름을 입력해주세요</p>}
      <div className="mb-5" />

      {/* 설명 */}
      <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">설명 (선택)</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="간단한 설명"
        rows={2}
        className="w-full rounded-sm border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand resize-none mb-5"
      />

      {/* 카테고리 */}
      <label className="block text-[13px] font-semibold text-ink-2 mb-2">카테고리</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)} type="button">
            {c}
          </Chip>
        ))}
        <button
          onClick={() => setAddingCategory((v) => !v)}
          className="h-9 px-3 rounded-full border border-dashed border-line text-[13px] text-ink-muted flex items-center gap-1"
        >
          <PlusIcon size={13} />
          직접 추가
        </button>
      </div>
      {addingCategory && (
        <div className="flex gap-2 mb-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmNewCategory()}
            placeholder="새 카테고리 이름"
            className="flex-1 h-10 rounded-sm border border-line px-3 text-[13.5px] outline-none focus:border-brand"
          />
          <Button size="sm" onClick={confirmNewCategory}>
            추가
          </Button>
        </div>
      )}

      <Button className="w-full mt-5" size="lg" onClick={submit}>
        추가하기
      </Button>
    </Sheet>
  )
}
