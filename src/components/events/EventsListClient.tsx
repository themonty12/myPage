'use client'

import { useMemo, useState } from 'react'

import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

export default function EventsListClient() {
  const { data, ready, update } = useArchiveData()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    title: '',
    type: '청첩장',
    date: '',
    location: '',
  })

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data.events
    return data.events.filter((event) =>
      [event.title, event.type, event.location, event.description]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
  }, [data.events, query])

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('이 이벤트를 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      events: prev.events.filter((item) => item.id !== id),
    }))
  }

  const handleStartEdit = (item: (typeof data.events)[number]) => {
    setEditingId(item.id)
    setFormState({
      title: item.title,
      type: item.type,
      date: item.date,
      location: item.location ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleSaveEdit = (id: string) => {
    update((prev) => ({
      ...prev,
      events: prev.events.map((item) =>
        item.id === id
          ? {
              ...item,
              title: formState.title.trim(),
              type: formState.type as (typeof item)['type'],
              date: formState.date,
              location: formState.location.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }))
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">특별한 날들</h2>
        <p className="mt-2 text-sm text-sand-600">
          청첩장과 기념일을 따로 모아두는 공간입니다.
        </p>
      </header>
      <section className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-sm"
          placeholder="이벤트 이름이나 장소로 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <a className="button" href="/events/new">
          새 이벤트 만들기
        </a>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="card p-6 text-sm text-sand-600">
            아직 이벤트가 없어요. 새 이벤트를 만들어 보세요.
          </div>
        ) : (
          filtered.map((event) => (
            <article key={event.id} className="card space-y-3 p-5">
              {event.coverUrl ? (
                <img
                  src={event.coverUrl}
                  alt={`${event.title} 대표 이미지`}
                  className="h-32 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="h-32 rounded-2xl bg-sand-100" />
              )}
              <h3 className="text-base font-medium">{event.title}</h3>
              <p className="text-sm text-sand-600">
                {formatDate(event.date)} · {event.location}
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a className="button-outline" href={`/events/${event.id}`}>
                  상세 보기
                </a>
                {editingId === event.id ? (
                  <>
                    <button
                      type="button"
                      className="button-outline"
                      onClick={() => handleSaveEdit(event.id)}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      className="button-outline"
                      onClick={handleCancelEdit}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="button-outline"
                    onClick={() => handleStartEdit(event)}
                  >
                    빠른 수정
                  </button>
                )}
                <button
                  type="button"
                  className="button-outline text-rose-500 hover:text-rose-600"
                  onClick={() => handleDelete(event.id)}
                >
                  삭제
                </button>
              </div>
              {editingId === event.id ? (
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="label">이벤트 이름</p>
                    <input
                      className="input mt-2"
                      value={formState.title}
                      onChange={(eventTarget) =>
                        setFormState((prev) => ({ ...prev, title: eventTarget.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">유형</p>
                    <select
                      className="input mt-2"
                      value={formState.type}
                      onChange={(eventTarget) =>
                        setFormState((prev) => ({ ...prev, type: eventTarget.target.value }))
                      }
                    >
                      {['청첩장', '기념일', '돌잔치', '가족 모임', '기타'].map((item) => (
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
                      value={formState.date}
                      onChange={(eventTarget) =>
                        setFormState((prev) => ({ ...prev, date: eventTarget.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">장소</p>
                    <input
                      className="input mt-2"
                      value={formState.location}
                      onChange={(eventTarget) =>
                        setFormState((prev) => ({ ...prev, location: eventTarget.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  )
}
