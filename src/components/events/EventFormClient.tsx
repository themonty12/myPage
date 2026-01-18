'use client'

import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { EventType } from '@/lib/types'
import { moveItem, readFilesAsDataUrls } from '@/lib/files'
import { createId } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

const eventTypes: EventType[] = ['청첩장', '기념일', '돌잔치', '가족 모임', '기타']

export default function EventFormClient() {
  const router = useRouter()
  const { update } = useArchiveData()

  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('청첩장')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [greeting, setGreeting] = useState('')
  const [venueInfo, setVenueInfo] = useState('')
  const [transitInfo, setTransitInfo] = useState('')
  const [accountInfo, setAccountInfo] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [photoUrls, setPhotoUrls] = useState('')
  const [coverFile, setCoverFile] = useState<string | undefined>()
  const [photoFiles, setPhotoFiles] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [createShare, setCreateShare] = useState(true)
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
    const id = createId('event')
    const shareId = createShare ? createId('share') : undefined
    const photos = photoUrls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)
    const mergedPhotos = [...photoFiles, ...photos]

    update((prev) => ({
      ...prev,
      events: [
        {
          id,
          title: title.trim(),
          type,
          date,
          time: time.trim() || undefined,
          location: location.trim() || undefined,
          contact: contact.trim() || undefined,
          description: description.trim(),
          greeting: greeting.trim() || undefined,
          venueInfo: venueInfo.trim() || undefined,
          transitInfo: transitInfo.trim() || undefined,
          accountInfo: accountInfo.trim() || undefined,
          coverUrl: coverFile || coverUrl.trim() || undefined,
          photos: mergedPhotos,
          guestbook: [],
          isPublic,
          shareId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev.events,
      ],
    }))

    router.push(`/events/${id}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">새 이벤트 만들기</h2>
        <p className="mt-2 text-sm text-sand-600">
          청첩장, 기념일 등 특별한 날을 기록하세요.
        </p>
      </header>
      <section className="card space-y-6 p-6 text-sm text-sand-700">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="label">이벤트 이름</p>
            <input
              className="input mt-2"
              placeholder="예: 청첩장, 기념일 디너"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <p className="label">이벤트 유형</p>
            <select
              className="input mt-2"
              value={type}
              onChange={(event) => setType(event.target.value as EventType)}
            >
              {eventTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
            <p className="label">시간</p>
            <input
              className="input mt-2"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
          <div>
            <p className="label">장소</p>
            <input
              className="input mt-2"
              placeholder="예: 서울, 강남웨딩홀"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div>
            <p className="label">연락처</p>
            <input
              className="input mt-2"
              placeholder="연락 가능한 번호"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>
        </div>
        <div>
          <p className="label">소개글</p>
          <textarea
            className="textarea mt-2 min-h-[140px]"
            placeholder="행사에 대한 소개와 인사말을 적어주세요."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        {type === '청첩장' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">인삿말</p>
              <textarea
                className="textarea mt-2 min-h-[120px]"
                placeholder="예: 소중한 분들을 초대합니다."
                value={greeting}
                onChange={(event) => setGreeting(event.target.value)}
              />
            </div>
            <div>
              <p className="label">예식장 안내</p>
              <textarea
                className="textarea mt-2 min-h-[120px]"
                placeholder="예: 서울 웨딩홀 3층 라벤더홀"
                value={venueInfo}
                onChange={(event) => setVenueInfo(event.target.value)}
              />
            </div>
            <div>
              <p className="label">교통 안내</p>
              <textarea
                className="textarea mt-2 min-h-[120px]"
                placeholder="예: 강남역 5번 출구 도보 8분"
                value={transitInfo}
                onChange={(event) => setTransitInfo(event.target.value)}
              />
            </div>
            <div>
              <p className="label">마음 전할 곳</p>
              <textarea
                className="textarea mt-2 min-h-[120px]"
                placeholder="예: 신랑 김OO 123-456-789 (OO은행)"
                value={accountInfo}
                onChange={(event) => setAccountInfo(event.target.value)}
              />
            </div>
          </div>
        ) : null}
        <div>
          <p className="label">대표 이미지 URL</p>
          <input
            className="input mt-2"
            placeholder="이미지 주소를 입력하세요"
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
          />
        </div>
        <div>
          <p className="label">대표 이미지 업로드</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
            <span className="text-sm text-sand-500">행사의 대표 사진을 올려주세요.</span>
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
              alt="대표 이미지 미리보기"
              className="mt-3 h-32 w-full rounded-xl object-cover"
            />
          ) : null}
        </div>
        <div>
          <p className="label">추가 사진 URL</p>
          <input
            className="input mt-2"
            placeholder="쉼표로 여러 장 입력"
            value={photoUrls}
            onChange={(event) => setPhotoUrls(event.target.value)}
          />
        </div>
        <div>
          <p className="label">추가 사진 업로드</p>
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
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-sand-700"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            공개 이벤트로 저장하기
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
            이벤트 만들기
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
