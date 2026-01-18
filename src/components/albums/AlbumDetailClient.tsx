'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import { moveItem, readFilesAsDataUrls } from '@/lib/files'
import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

type Props = {
  id: string
}

export default function AlbumDetailClient({ id }: Props) {
  const router = useRouter()
  const { data, ready, update } = useArchiveData()
  const album = data.albums.find((item) => item.id === id)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [tags, setTags] = useState('')
  const [memo, setMemo] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState<string | undefined>()
  const [photos, setPhotos] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  if (!album) {
    return (
      <div className="card p-6 text-sm text-sand-600">
        해당 앨범을 찾을 수 없어요.
      </div>
    )
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await readFilesAsDataUrls(event.target.files, 12, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      mimeType: 'image/webp',
    })
    setPhotos((prev) => [...prev, ...uploaded])
    event.target.value = ''
  }

  const handleCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await readFilesAsDataUrls(event.target.files, 1, {
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.85,
      mimeType: 'image/webp',
    })
    setCoverFile(uploaded[0])
    event.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    setPhotos((prev) => {
      const removed = prev[index]
      if (removed && removed === coverFile) {
        setCoverFile(undefined)
      }
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

  const handleSetCover = (photo: string) => {
    setCoverFile(photo)
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
    if (!album) return
    setTitle(album.title)
    setPeriodStart(album.periodStart ?? '')
    setPeriodEnd(album.periodEnd ?? '')
    setTags(album.tags.join(', '))
    setMemo(album.memo ?? '')
    setCoverUrl(album.coverUrl ?? '')
    setCoverFile(album.coverUrl ?? undefined)
    setPhotos(album.photos ?? [])
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!album) return
    update((prev) => ({
      ...prev,
      albums: prev.albums.map((item) =>
        item.id === album.id
          ? {
              ...item,
              title: title.trim(),
              periodStart: periodStart || undefined,
              periodEnd: periodEnd || undefined,
              tags: tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
              memo: memo.trim() || undefined,
              coverUrl: coverFile || coverUrl.trim() || undefined,
              photos,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }))
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!album) return
    if (!window.confirm('이 앨범을 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      albums: prev.albums.filter((item) => item.id !== album.id),
    }))
    router.push('/albums')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{album.title}</h2>
          <p className="mt-2 text-sm text-sand-600">
            {formatDate(album.periodStart)}
            {album.periodEnd ? ` - ${formatDate(album.periodEnd)}` : ''}
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
          <div>
            <p className="label">앨범 이름</p>
            <input
              className="input mt-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">기간 시작</p>
              <input
                className="input mt-2"
                type="date"
                value={periodStart}
                onChange={(event) => setPeriodStart(event.target.value)}
              />
            </div>
            <div>
              <p className="label">기간 종료</p>
              <input
                className="input mt-2"
                type="date"
                value={periodEnd}
                onChange={(event) => setPeriodEnd(event.target.value)}
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
            <p className="label">대표 사진 URL</p>
            <input
              className="input mt-2"
              value={coverUrl}
              onChange={(event) => setCoverUrl(event.target.value)}
            />
          </div>
          <div>
            <p className="label">대표 사진 업로드</p>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
              <span className="text-sm text-sand-500">한 장의 커버 사진을 선택하세요.</span>
              <label className="button-outline ml-auto cursor-pointer">
                파일 선택
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
            </div>
            {coverFile ? (
              <img
                src={coverFile}
                alt="커버 미리보기"
                className="mt-3 h-32 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="label">사진 업로드</p>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
              <span className="text-sm text-sand-500">여러 장을 추가할 수 있어요.</span>
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
                        coverFile === photo ? 'ring-2 ring-sand-400' : ''
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                    />
                    <div className="flex items-center justify-between text-xs text-sand-500">
                      <span>{coverFile === photo ? '대표' : `#${index + 1}`}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="hover:text-sand-900"
                          onClick={() => handleSetCover(photo)}
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
            <p className="label">앨범 메모</p>
            <textarea
              className="textarea mt-2 min-h-[140px]"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="card space-y-6 p-6 text-sm text-sand-700">
            <div className="flex flex-wrap items-center gap-2">
              {album.tags.length === 0 ? (
                <span className="badge">태그 없음</span>
              ) : (
                album.tags.map((tag) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {album.shareId ? (
                <a className="button-outline" href={`/share/${album.shareId}`}>
                  공유 페이지 보기
                </a>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(album.photos.length ? album.photos : Array.from({ length: 9 })).map(
                (photo, index) =>
                  typeof photo === 'string' && photo ? (
                    <img
                      key={photo}
                      src={photo}
                      alt={`${album.title} 사진`}
                      className="h-32 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div key={index} className="h-32 rounded-2xl bg-sand-100" />
                  )
              )}
            </div>
          </section>
          {album.memo ? (
            <section className="card p-6">
              <h3 className="text-lg font-semibold">앨범 메모</h3>
              <p className="mt-3 text-sm text-sand-700">{album.memo}</p>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
