'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { EventType, GuestbookEntry } from '@/lib/types'
import { moveItem, readFilesAsDataUrls } from '@/lib/files'
import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

type Props = {
  id: string
}

export default function EventDetailClient({ id }: Props) {
  const router = useRouter()
  const { data, ready, update } = useArchiveData()
  const event = data.events.find((item) => item.id === id)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('청첩장')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [greeting, setGreeting] = useState('')
  const [venueInfo, setVenueInfo] = useState('')
  const [transitInfo, setTransitInfo] = useState('')
  const [accountInfo, setAccountInfo] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState<string | undefined>()
  const [photos, setPhotos] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [guestbookName, setGuestbookName] = useState('')
  const [guestbookMessage, setGuestbookMessage] = useState('')
  const eventTypes: EventType[] = ['청첩장', '기념일', '돌잔치', '가족 모임', '기타']

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  if (!event) {
    return (
      <div className="card p-6 text-sm text-sand-600">
        해당 이벤트를 찾을 수 없어요.
      </div>
    )
  }

  const handlePhotoChange = async (eventTarget: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await readFilesAsDataUrls(eventTarget.target.files, 12, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      mimeType: 'image/webp',
    })
    setPhotos((prev) => [...prev, ...uploaded])
    eventTarget.target.value = ''
  }

  const handleCoverChange = async (eventTarget: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await readFilesAsDataUrls(eventTarget.target.files, 1, {
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.85,
      mimeType: 'image/webp',
    })
    setCoverFile(uploaded[0])
    eventTarget.target.value = ''
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
    if (!event) return
    setTitle(event.title)
    setType(event.type)
    setDate(event.date)
    setTime(event.time ?? '')
    setLocation(event.location ?? '')
    setContact(event.contact ?? '')
    setDescription(event.description ?? '')
    setGreeting(event.greeting ?? '')
    setVenueInfo(event.venueInfo ?? '')
    setTransitInfo(event.transitInfo ?? '')
    setAccountInfo(event.accountInfo ?? '')
    setCoverUrl(event.coverUrl ?? '')
    setCoverFile(event.coverUrl ?? undefined)
    setPhotos(event.photos ?? [])
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!event) return
    update((prev) => ({
      ...prev,
      events: prev.events.map((item) =>
        item.id === event.id
          ? {
              ...item,
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
              photos,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }))
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!event) return
    if (!window.confirm('이 이벤트를 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      events: prev.events.filter((item) => item.id !== event.id),
    }))
    router.push('/events')
  }

  const handleAddGuestbook = () => {
    if (!event) return
    if (!guestbookMessage.trim()) return
    const entry: GuestbookEntry = {
      id: `guestbook-${Date.now()}`,
      name: guestbookName.trim() || '익명',
      message: guestbookMessage.trim(),
      createdAt: new Date().toISOString(),
    }
    update((prev) => ({
      ...prev,
      events: prev.events.map((item) =>
        item.id === event.id
          ? {
              ...item,
              guestbook: [...(item.guestbook ?? []), entry],
            }
          : item
      ),
    }))
    setGuestbookName('')
    setGuestbookMessage('')
  }

  const handleRemoveGuestbook = (entryId: string) => {
    if (!event) return
    if (!window.confirm('방명록을 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      events: prev.events.map((item) =>
        item.id === event.id
          ? {
              ...item,
              guestbook: (item.guestbook ?? []).filter((entry) => entry.id !== entryId),
            }
          : item
      ),
    }))
  }

  const mapLink = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null
  const kakaoMapLink = event.location
    ? `https://map.kakao.com/link/search/${encodeURIComponent(event.location)}`
    : null
  const naverMapLink = event.location
    ? `https://map.naver.com/v5/search/${encodeURIComponent(event.location)}`
    : null

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{event.title}</h2>
          <p className="mt-2 text-sm text-sand-600">
            {formatDate(event.date)} · {event.location}
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
              <p className="label">이벤트 이름</p>
              <input
                className="input mt-2"
                value={title}
                onChange={(eventTarget) => setTitle(eventTarget.target.value)}
              />
            </div>
            <div>
              <p className="label">이벤트 유형</p>
              <select
                className="input mt-2"
                value={type}
                onChange={(eventTarget) => setType(eventTarget.target.value as EventType)}
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
                onChange={(eventTarget) => setDate(eventTarget.target.value)}
              />
            </div>
            <div>
              <p className="label">시간</p>
              <input
                className="input mt-2"
                type="time"
                value={time}
                onChange={(eventTarget) => setTime(eventTarget.target.value)}
              />
            </div>
            <div>
              <p className="label">장소</p>
              <input
                className="input mt-2"
                value={location}
                onChange={(eventTarget) => setLocation(eventTarget.target.value)}
              />
            </div>
            <div>
              <p className="label">연락처</p>
              <input
                className="input mt-2"
                value={contact}
                onChange={(eventTarget) => setContact(eventTarget.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="label">소개글</p>
            <textarea
              className="textarea mt-2 min-h-[140px]"
              value={description}
              onChange={(eventTarget) => setDescription(eventTarget.target.value)}
            />
          </div>
          {type === '청첩장' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="label">인삿말</p>
                <textarea
                  className="textarea mt-2 min-h-[120px]"
                  value={greeting}
                  onChange={(eventTarget) => setGreeting(eventTarget.target.value)}
                />
              </div>
              <div>
                <p className="label">예식장 안내</p>
                <textarea
                  className="textarea mt-2 min-h-[120px]"
                  value={venueInfo}
                  onChange={(eventTarget) => setVenueInfo(eventTarget.target.value)}
                />
              </div>
              <div>
                <p className="label">교통 안내</p>
                <textarea
                  className="textarea mt-2 min-h-[120px]"
                  value={transitInfo}
                  onChange={(eventTarget) => setTransitInfo(eventTarget.target.value)}
                />
              </div>
              <div>
                <p className="label">마음 전할 곳</p>
                <textarea
                  className="textarea mt-2 min-h-[120px]"
                  value={accountInfo}
                  onChange={(eventTarget) => setAccountInfo(eventTarget.target.value)}
                />
              </div>
            </div>
          ) : null}
          <div>
            <p className="label">대표 이미지 URL</p>
            <input
              className="input mt-2"
              value={coverUrl}
              onChange={(eventTarget) => setCoverUrl(eventTarget.target.value)}
            />
          </div>
          <div>
            <p className="label">대표 이미지 업로드</p>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
              <span className="text-sm text-sand-500">한 장의 대표 사진을 선택하세요.</span>
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
                    onDragOver={(eventTarget) => {
                      eventTarget.preventDefault()
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
        </section>
      ) : (
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          {event.coverUrl ? (
            <img
              src={event.coverUrl}
              alt={`${event.title} 대표 이미지`}
              className="h-48 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="h-48 rounded-2xl bg-sand-100" />
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="label">날짜</p>
              <p className="mt-2">{formatDate(event.date)}</p>
            </div>
            <div>
              <p className="label">시간</p>
              <p className="mt-2">{event.time || '미정'}</p>
            </div>
            <div>
              <p className="label">장소</p>
              <p className="mt-2">{event.location || '미정'}</p>
            </div>
          </div>
          {event.contact ? (
            <div>
              <p className="label">연락처</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-sand-100 px-3 py-1 text-xs text-sand-600">
                  {event.contact}
                </span>
                <a className="button-outline" href={`tel:${event.contact}`}>
                  전화하기
                </a>
                <a className="button-outline" href={`sms:${event.contact}`}>
                  문자하기
                </a>
              </div>
            </div>
          ) : null}
          {event.location ? (
            <div>
              <p className="label">지도</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {mapLink ? (
                  <a className="button-outline" href={mapLink} target="_blank" rel="noreferrer">
                    구글 지도
                  </a>
                ) : null}
                {kakaoMapLink ? (
                  <a
                    className="button-outline"
                    href={kakaoMapLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    카카오맵
                  </a>
                ) : null}
                {naverMapLink ? (
                  <a
                    className="button-outline"
                    href={naverMapLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    네이버 지도
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          <div>
            <p className="label">소개글</p>
            <p className="mt-2 leading-relaxed">
              {event.description || '소개글이 아직 작성되지 않았어요.'}
            </p>
          </div>
          {event.type === '청첩장' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {event.greeting ? (
                <div>
                  <p className="label">인삿말</p>
                  <p className="mt-2 leading-relaxed">{event.greeting}</p>
                </div>
              ) : null}
              {event.venueInfo ? (
                <div>
                  <p className="label">예식장 안내</p>
                  <p className="mt-2 leading-relaxed">{event.venueInfo}</p>
                </div>
              ) : null}
              {event.transitInfo ? (
                <div>
                  <p className="label">교통 안내</p>
                  <p className="mt-2 leading-relaxed">{event.transitInfo}</p>
                </div>
              ) : null}
              {event.accountInfo ? (
                <div>
                  <p className="label">마음 전할 곳</p>
                  <p className="mt-2 leading-relaxed">{event.accountInfo}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          {event.type === '청첩장' ? (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">방명록</h3>
              <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                <input
                  className="input"
                  placeholder="이름"
                  value={guestbookName}
                  onChange={(eventTarget) => setGuestbookName(eventTarget.target.value)}
                />
                <input
                  className="input"
                  placeholder="축하 메시지를 남겨주세요"
                  value={guestbookMessage}
                  onChange={(eventTarget) => setGuestbookMessage(eventTarget.target.value)}
                />
                <button className="button" type="button" onClick={handleAddGuestbook}>
                  남기기
                </button>
              </div>
              <ul className="space-y-3">
                {(event.guestbook ?? []).length === 0 ? (
                  <li className="text-xs text-sand-500">아직 방명록이 없어요.</li>
                ) : (
                  (event.guestbook ?? []).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{entry.name}</p>
                        <p className="text-xs text-sand-500">{entry.message}</p>
                      </div>
                      <button
                        className="button-outline text-rose-500 hover:text-rose-600"
                        type="button"
                        onClick={() => handleRemoveGuestbook(entry.id)}
                      >
                        삭제
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {(event.photos.length ? event.photos : Array.from({ length: 6 })).map(
              (photo, index) =>
                typeof photo === 'string' && photo ? (
                  <img
                    key={photo}
                    src={photo}
                    alt={`${event.title} 사진`}
                    className="h-28 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div key={index} className="h-28 rounded-2xl bg-sand-100" />
                )
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {event.shareId ? (
              <a className="button-outline" href={`/share/${event.shareId}`}>
                공유 페이지 보기
              </a>
            ) : null}
            <a className="button-outline" href="/events/new">
              새 이벤트 작성
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
