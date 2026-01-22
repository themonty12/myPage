'use client'

import { useState } from 'react'

import type { GuestbookEntry } from '@/lib/types'
import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

type Props = {
  shareId: string
}

export default function ShareClient({ shareId }: Props) {
  const { data, ready, update } = useArchiveData()
  const [guestbookName, setGuestbookName] = useState('')
  const [guestbookMessage, setGuestbookMessage] = useState('')

  const journal = data.journals.find((item) => item.shareId === shareId)
  const album = data.albums.find((item) => item.shareId === shareId)
  const event = data.events.find((item) => item.shareId === shareId)

  const mapLink = event?.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null
  const mapEmbedLink = event?.location
    ? `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
    : null
  const kakaoMapLink = event?.location
    ? `https://map.kakao.com/link/search/${encodeURIComponent(event.location)}`
    : null
  const naverMapLink = event?.location
    ? `https://map.naver.com/v5/search/${encodeURIComponent(event.location)}`
    : null

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  if (!journal && !album && !event) {
    return (
      <div className="card p-6 text-sm text-sand-600">
        공유된 내용을 찾을 수 없어요.
      </div>
    )
  }

  if (journal) {
    return (
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">{journal.title}</h2>
          <p className="mt-2 text-sm text-sand-600">{formatDate(journal.date)}</p>
        </header>
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          <p className="leading-relaxed">{journal.content}</p>
        </section>
      </div>
    )
  }

  if (album) {
    return (
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">{album.title}</h2>
          <p className="mt-2 text-sm text-sand-600">
            {formatDate(album.periodStart)}
            {album.periodEnd ? ` - ${formatDate(album.periodEnd)}` : ''}
          </p>
        </header>
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {(album.photos.length ? album.photos : Array.from({ length: 6 })).map(
              (photo, index) =>
                typeof photo === 'string' && photo ? (
                  <img
                    key={photo}
                    src={photo}
                    alt={`${album.title} 사진`}
                    className="h-28 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div key={index} className="h-28 rounded-2xl bg-sand-100" />
                )
            )}
          </div>
          {album.memo ? <p className="leading-relaxed">{album.memo}</p> : null}
        </section>
      </div>
    )
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
          ? { ...item, guestbook: [...(item.guestbook ?? []), entry] }
          : item
      ),
    }))
    setGuestbookName('')
    setGuestbookMessage('')
  }

  const SectionTitle = ({ children }: { children: string }) => (
    <div className="flex items-center gap-2">
      <span className="invite-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 21s-6-3.7-9-8.5C1.2 9 3.2 6 6 6c1.8 0 3 .9 4 2.2C11 6.9 12.2 6 14 6c2.8 0 4.8 3 3 6.5-3 4.8-9 8.5-9 8.5z" />
        </svg>
      </span>
      <h3 className="text-base font-semibold">{children}</h3>
    </div>
  )

  return (
    <div className="invite-page">
      <div className="invite-shell space-y-6">
        <header className="space-y-3">
          <p className="invite-subtitle">Wedding Invitation</p>
          <h2 className="invite-title">{event?.title ?? '우리의 결혼식'}</h2>
          <p className="invite-subtitle">
            {formatDate(event?.date)} {event?.time ? `· ${event.time}` : ''}
          </p>
        </header>

        <div className="invite-divider" />

        <section className="invite-section space-y-4">
          {event?.coverUrl ? (
            <img
              src={event.coverUrl}
              alt={`${event.title} 대표 이미지`}
              className="h-56 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="h-56 rounded-2xl bg-sand-100" />
          )}
          <p className="text-sm leading-relaxed text-sand-700">
            {event?.description}
          </p>
        </section>

        {event?.type === '청첩장' ? (
          <section className="invite-section space-y-3">
            <SectionTitle>인삿말</SectionTitle>
            <p className="text-sm leading-relaxed text-sand-700">
              {event.greeting ?? '소중한 분들을 초대합니다.'}
            </p>
          </section>
        ) : null}

        <section className="invite-section space-y-4">
          <SectionTitle>일정 안내</SectionTitle>
          <div>
            <p className="label">일시</p>
            <p className="mt-2 text-sm text-sand-700">
              {formatDate(event?.date)} {event?.time ? `· ${event.time}` : ''}
            </p>
          </div>
          {event?.location ? (
            <div>
              <p className="label">장소</p>
              <p className="mt-2 text-sm text-sand-700">{event.location}</p>
            </div>
          ) : null}
          {event?.venueInfo ? (
            <div>
              <p className="label">예식장 안내</p>
              <p className="mt-2 text-sm text-sand-700">{event.venueInfo}</p>
            </div>
          ) : null}
          {event?.transitInfo ? (
            <div>
              <p className="label">교통 안내</p>
              <p className="mt-2 text-sm text-sand-700">{event.transitInfo}</p>
            </div>
          ) : null}
        </section>

        {event?.location ? (
          <section className="invite-section space-y-3">
            <SectionTitle>지도</SectionTitle>
            {mapEmbedLink ? (
              <div className="overflow-hidden rounded-2xl border border-sand-100">
                <iframe
                  title="지도"
                  src={mapEmbedLink}
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {mapLink ? (
                <a className="invite-button" href={mapLink} target="_blank" rel="noreferrer">
                  구글 지도
                </a>
              ) : null}
              {kakaoMapLink ? (
                <a className="invite-button" href={kakaoMapLink} target="_blank" rel="noreferrer">
                  카카오맵
                </a>
              ) : null}
              {naverMapLink ? (
                <a className="invite-button" href={naverMapLink} target="_blank" rel="noreferrer">
                  네이버 지도
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        {event?.contact ? (
          <section className="invite-section space-y-3">
            <SectionTitle>연락처</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sand-100 px-3 py-1 text-xs text-sand-600">
                {event.contact}
              </span>
              <a className="invite-button" href={`tel:${event.contact}`}>
                전화하기
              </a>
              <a className="invite-button" href={`sms:${event.contact}`}>
                문자하기
              </a>
            </div>
          </section>
        ) : null}

        {event?.accountInfo ? (
          <section className="invite-section space-y-3">
            <SectionTitle>마음 전할 곳</SectionTitle>
            <p className="text-sm text-sand-700">{event.accountInfo}</p>
          </section>
        ) : null}

        {event?.photos?.length ? (
          <section className="invite-section space-y-3">
            <SectionTitle>갤러리</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {event.photos.map((photo) => (
                <img
                  key={photo}
                  src={photo}
                  alt="청첩장 사진"
                  className="h-32 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </section>
        ) : null}

        {event?.type === '청첩장' ? (
          <section className="invite-section space-y-4">
            <SectionTitle>방명록</SectionTitle>
            <div className="grid gap-2">
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
                  <li key={entry.id} className="rounded-2xl bg-sand-50 px-4 py-3">
                    <p className="text-sm font-medium">{entry.name}</p>
                    <p className="text-xs text-sand-500">{entry.message}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        ) : null}

        <p className="invite-subtitle">따뜻한 마음으로 초대합니다</p>
      </div>
    </div>
  )
}
