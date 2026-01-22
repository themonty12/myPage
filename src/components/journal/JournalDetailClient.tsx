'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { JournalCategory } from '@/lib/types'
import { moveItem, readFilesAsDataUrls } from '@/lib/files'
import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

type Props = {
  id: string
}

export default function JournalDetailClient({ id }: Props) {
  const router = useRouter()
  const { data, ready, update } = useArchiveData()
  const journal = data.journals.find((item) => item.id === id)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<JournalCategory>('데이트')
  const [tags, setTags] = useState('')
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const categories: JournalCategory[] = ['데이트', '연애', '육아', '가족', '여행', '운동', '기타']

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
    setPhotos((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
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

  const handleStartEdit = () => {
    if (!journal) return
    setTitle(journal.title)
    setDate(journal.date)
    setCategory(journal.category)
    setTags(journal.tags.join(', '))
    setLocation(journal.location ?? '')
    setContent(journal.content)
    setPhotos(journal.photos ?? [])
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!journal) return
    const trimmedContent = content.trim()
    const summary =
      trimmedContent.length > 0 ? `${trimmedContent.slice(0, 60)}...` : ''
    update((prev) => ({
      ...prev,
      journals: prev.journals.map((item) =>
        item.id === journal.id
          ? {
              ...item,
              title: title.trim(),
              date,
              category,
              tags: tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
              location: location.trim() || undefined,
              summary,
              content: trimmedContent,
              photos,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }))
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!journal) return
    if (!window.confirm('이 기록을 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      journals: prev.journals.filter((item) => item.id !== journal.id),
    }))
    router.push('/journal')
  }

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  if (!journal) {
    return (
      <div className="card p-6 text-sm text-sand-600">
        해당 기록을 찾을 수 없어요.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{journal.title}</h2>
          <p className="mt-2 text-sm text-sand-600">
            {formatDate(journal.date)} · {journal.category}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button className="button-outline" type="button" onClick={handleCancelEdit}>
                취소
              </button>
              <button className="button" type="button" onClick={handleSave}>
                저장
              </button>
            </>
          ) : (
            <>
              <button className="button-outline" type="button" onClick={handleStartEdit}>
                수정
              </button>
              <button className="button-outline" type="button" onClick={handleDelete}>
                삭제
              </button>
            </>
          )}
        </div>
      </header>
      {isEditing ? (
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">제목</p>
              <input
                className="input mt-2"
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
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="label">태그</p>
            <input
              className="input mt-2"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>
          <div>
            <p className="label">사진 관리</p>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
              <span className="text-sm text-sand-500">사진을 추가하거나 순서를 바꿔보세요.</span>
              <label className="button-outline ml-auto cursor-pointer">
                사진 추가
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
          </div>
          <div>
            <p className="label">본문</p>
            <textarea
              className="textarea mt-2 min-h-[180px]"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
        </section>
      ) : (
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          <div className="flex flex-wrap gap-2">
            {journal.tags.length === 0 ? (
              <span className="badge">태그 없음</span>
            ) : (
              journal.tags.map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))
            )}
          </div>
          {journal.location ? (
            <p className="text-sm text-sand-600">장소 · {journal.location}</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            {(journal.photos.length ? journal.photos : Array.from({ length: 3 })).map(
              (photo, index) =>
                typeof photo === 'string' && photo ? (
                  <img
                    key={photo}
                    src={photo}
                    alt={`${journal.title} 사진`}
                    className="h-32 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div key={index} className="h-32 rounded-2xl bg-sand-100" />
                )
            )}
          </div>
          <article className="space-y-4 leading-relaxed">
            <p>{journal.content || '아직 본문이 작성되지 않았어요.'}</p>
          </article>
          <div className="flex flex-wrap gap-3">
            {journal.shareId ? (
              <a className="button-outline" href={`/share/${journal.shareId}`}>
                공유 페이지 보기
              </a>
            ) : null}
            <a className="button-outline" href="/journal/new">
              새 기록 작성
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
