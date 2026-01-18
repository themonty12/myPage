'use client'

import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import { moveItem, readFilesAsDataUrls } from '@/lib/files'
import { createId } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

export default function AlbumFormClient() {
  const router = useRouter()
  const { update } = useArchiveData()

  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [title, setTitle] = useState('')
  const [periodStart, setPeriodStart] = useState(defaultDate)
  const [periodEnd, setPeriodEnd] = useState('')
  const [tags, setTags] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState<string | undefined>()
  const [photoUrls, setPhotoUrls] = useState('')
  const [photoFiles, setPhotoFiles] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [memo, setMemo] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [createShare, setCreateShare] = useState(false)
  const [lastRemoved, setLastRemoved] = useState<{ index: number; photo: string } | null>(
    null
  )

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

  const handlePhotosChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await readFilesAsDataUrls(event.target.files, 12, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      mimeType: 'image/webp',
    })
    setPhotoFiles((prev) => [...prev, ...uploaded])
    event.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    setPhotoFiles((prev) => {
      const removed = prev[index]
      if (removed && removed === coverFile) {
        setCoverFile(undefined)
      }
      setLastRemoved({ index, photo: removed })
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    setPhotoFiles((prev) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      return moveItem(prev, index, nextIndex)
    })
  }

  const handleSetCover = (photo: string) => {
    setCoverFile(photo)
    setToastMessage('대표 사진을 변경했어요.')
    window.setTimeout(() => setToastMessage(null), 1500)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDrop = (index: number) => {
    setPhotoFiles((prev) => {
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
    setPhotoFiles((prev) => moveItem([...prev, lastRemoved.photo], prev.length, lastRemoved.index))
    setLastRemoved(null)
    setToastMessage('삭제를 되돌렸어요.')
    window.setTimeout(() => setToastMessage(null), 1500)
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const id = createId('album')
    const shareId = createShare ? createId('share') : undefined
    const photos = photoUrls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)
    const mergedPhotos = [...photoFiles, ...photos]

    update((prev) => ({
      ...prev,
      albums: [
        {
          id,
          title: title.trim(),
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          coverUrl: coverFile || coverUrl.trim() || undefined,
          photos: mergedPhotos,
          memo: memo.trim() || undefined,
          isPublic: !isPrivate,
          shareId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev.albums,
      ],
    }))

    router.push(`/albums/${id}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">새 앨범 만들기</h2>
        <p className="mt-2 text-sm text-sand-600">
          대표 사진과 앨범 이름을 먼저 정해보세요.
        </p>
      </header>
      <section className="card space-y-6 p-6 text-sm text-sand-700">
        <div>
          <p className="label">앨범 이름</p>
          <input
            className="input mt-2"
            placeholder="예: 결혼식, 봄 여행"
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
            placeholder="예: 결혼식, 가족, 여행"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </div>
        <div>
          <p className="label">대표 사진 URL</p>
          <input
            className="input mt-2"
            placeholder="이미지 주소를 입력하세요"
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
          <p className="label">사진 URL</p>
          <input
            className="input mt-2"
            placeholder="쉼표로 여러 장 입력"
            value={photoUrls}
            onChange={(event) => setPhotoUrls(event.target.value)}
          />
        </div>
        <div>
          <p className="label">사진 업로드</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
            <span className="text-sm text-sand-500">최대 12장까지 추가할 수 있어요.</span>
            <label className="button-outline ml-auto cursor-pointer">
              파일 선택
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotosChange}
              />
            </label>
          </div>
          {photoFiles.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {photoFiles.map((photo, index) => (
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
          <p className="label">앨범 메모</p>
          <textarea
            className="textarea mt-2 min-h-[120px]"
            placeholder="앨범에 대한 짧은 메모를 남겨보세요."
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
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
            앨범 만들기
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
