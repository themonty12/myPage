'use client'

import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { JournalCategory } from '@/lib/types'
import { moveItem, readFilesAsDataUrls } from '@/lib/files'
import { createId } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

const categories: JournalCategory[] = ['데이트', '연애', '육아', '가족', '여행', '기타']

export default function JournalFormClient() {
  const router = useRouter()
  const { update } = useArchiveData()

  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [category, setCategory] = useState<JournalCategory>('데이트')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(true)
  const [createShare, setCreateShare] = useState(false)
  const [lastRemoved, setLastRemoved] = useState<{ index: number; photo: string } | null>(
    null
  )

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await readFilesAsDataUrls(event.target.files, 6, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      mimeType: 'image/webp',
    })
    setPhotos((prev) => [...prev, ...uploaded])
    event.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    setPhotos((prev) => {
      const removed = prev[index]
      setLastRemoved({ index, photo: removed })
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    setPhotos((prev) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      return moveItem(prev, index, nextIndex)
    })
  }

  const handleSetPrimary = (index: number) => {
    setPhotos((prev) => moveItem(prev, index, 0))
    setToastMessage('대표 사진을 변경했어요.')
    window.setTimeout(() => setToastMessage(null), 1500)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDrop = (index: number) => {
    setPhotos((prev) => {
      if (dragIndex === null || dragIndex === index) return prev
      return moveItem(prev, dragIndex, index)
    })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (index: number) => {
    setDragOverIndex(index)
  }

  const handleUndoRemove = () => {
    if (!lastRemoved) return
    setPhotos((prev) => moveItem([...prev, lastRemoved.photo], prev.length, lastRemoved.index))
    setLastRemoved(null)
    setToastMessage('삭제를 되돌렸어요.')
    window.setTimeout(() => setToastMessage(null), 1500)
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const id = createId('journal')
    const summary =
      content.trim().length > 0 ? content.trim().slice(0, 60) + '...' : ''
    const shareId = createShare ? createId('share') : undefined

    update((prev) => ({
      ...prev,
      journals: [
        {
          id,
          title: title.trim(),
          date,
          category,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          location: location.trim() || undefined,
          summary,
          content: content.trim(),
          photos,
          isPublic: !isPrivate,
          shareId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev.journals,
      ],
    }))

    router.push(`/journal/${id}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">새 기록 쓰기</h2>
        <p className="mt-2 text-sm text-sand-600">
          오늘의 순간을 간단하게 남겨보세요.
        </p>
      </header>
      <section className="card space-y-6 p-6 text-sm text-sand-700">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="label">제목</p>
            <input
              className="input mt-2"
              placeholder="오늘의 제목을 적어주세요"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <p className="label">날짜</p>
            <input
              className="input mt-2"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <p className="label">카테고리</p>
            <select
              className="input mt-2"
              value={category}
              onChange={(event) => setCategory(event.target.value as JournalCategory)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="label">장소</p>
            <input
              className="input mt-2"
              placeholder="예: 홍대, 집, 공원"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
        </div>
        <div>
          <p className="label">태그</p>
          <input
            className="input mt-2"
            placeholder="쉼표로 구분해 입력"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </div>
        <div>
          <p className="label">사진 추가</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
            <span className="text-sm text-sand-500">최대 6장까지 추가할 수 있어요.</span>
            <label className="button-outline ml-auto cursor-pointer">
              파일 선택
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          {photos.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <div
                  key={photo}
                  className={`photo-tile ${dragIndex === index ? 'dragging' : ''} ${
                    dragOverIndex === index ? 'drop-target' : ''
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    handleDragOver(index)
                  }}
                  onDrop={() => handleDrop(index)}
                >
                  <img
                    src={photo}
                    alt="업로드한 사진"
                    className={`h-24 w-full rounded-xl object-cover ${
                      index === 0 ? 'ring-2 ring-sand-400' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                  />
                  <div className="flex items-center justify-between text-xs text-sand-500">
                    <span>{index === 0 ? '대표' : `#${index + 1}`}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="hover:text-sand-900"
                        onClick={() => handleSetPrimary(index)}
                      >
                        대표 지정
                      </button>
                      <button
                        type="button"
                        className="hover:text-sand-900"
                        onClick={() => handleMovePhoto(index, 'up')}
                      >
                        위로
                      </button>
                      <button
                        type="button"
                        className="hover:text-sand-900"
                        onClick={() => handleMovePhoto(index, 'down')}
                      >
                        아래로
                      </button>
                      <button
                        type="button"
                        className="text-rose-400 hover:text-rose-600"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {lastRemoved ? (
            <div className="mt-3 flex items-center gap-3 text-xs text-sand-500">
              <span>사진을 삭제했어요.</span>
              <button
                className="button-outline px-2 py-1 text-xs"
                type="button"
                onClick={handleUndoRemove}
              >
                되돌리기
              </button>
            </div>
          ) : null}
        </div>
        <div>
          <p className="label">본문</p>
          <textarea
            className="textarea mt-2 min-h-[180px]"
            placeholder="오늘의 느낌과 순간을 자유롭게 적어보세요."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-sand-700"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
            />
            비공개로 저장하기
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-sand-700"
              checked={createShare}
              onChange={(event) => setCreateShare(event.target.checked)}
            />
            공유 링크 만들기
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="button-outline" type="button">
            임시저장
          </button>
          <button className="button" type="button" onClick={handleSubmit}>
            저장하기
          </button>
        </div>
      </section>
      {toastMessage ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-sand-900 px-4 py-2 text-xs text-white">
          {toastMessage}
        </div>
      ) : null}
    </div>
  )
}
