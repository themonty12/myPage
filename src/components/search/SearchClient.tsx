'use client'

import { useMemo, useState } from 'react'

import type { Album, Event, Journal } from '@/lib/types'
import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

type SearchType = '전체' | '일지' | '앨범' | '이벤트'

type SearchResult = {
  id: string
  type: SearchType
  title: string
  date?: string
  href: string
  tags: string[]
}

const getTags = (journals: Journal[], albums: Album[], events: Event[]) =>
  Array.from(
    new Set([
      ...journals.flatMap((item) => item.tags),
      ...albums.flatMap((item) => item.tags),
      ...events.flatMap((item) => item.type),
    ])
  ).filter(Boolean)

export default function SearchClient() {
  const { data, ready } = useArchiveData()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<SearchType>('전체')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const results = useMemo(() => {
    const items: SearchResult[] = [
      ...data.journals.map((journal) => ({
        id: journal.id,
        type: '일지' as const,
        title: journal.title,
        date: journal.date,
        href: `/journal/${journal.id}`,
        tags: journal.tags,
        content: [journal.summary, journal.content, journal.location].join(' '),
      })),
      ...data.albums.map((album) => ({
        id: album.id,
        type: '앨범' as const,
        title: album.title,
        date: album.periodStart,
        href: `/albums/${album.id}`,
        tags: album.tags,
        content: [album.memo, album.tags.join(' ')].join(' '),
      })),
      ...data.events.map((event) => ({
        id: event.id,
        type: '이벤트' as const,
        title: event.title,
        date: event.date,
        href: `/events/${event.id}`,
        tags: [event.type],
        content: [event.description, event.location].join(' '),
      })),
    ] as (SearchResult & { content: string })[]

    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesType = type === '전체' ? true : item.type === type
      const matchesQuery = normalized
        ? [item.title, item.content, item.tags.join(' ')].join(' ').toLowerCase().includes(normalized)
        : true
      const matchesTag = activeTag ? item.tags.includes(activeTag) : true
      return matchesType && matchesQuery && matchesTag
    })
  }, [activeTag, data.albums, data.events, data.journals, query, type])

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  const tags = getTags(data.journals, data.albums, data.events)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">찾기</h2>
        <p className="mt-2 text-sm text-sand-600">
          날짜, 태그, 사람별로 기록을 찾아보세요.
        </p>
      </header>
      <section className="card space-y-6 p-6 text-sm text-sand-700">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="label">검색어</p>
            <input
              className="input mt-2"
              placeholder="기록 제목, 태그, 장소"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <p className="label">유형</p>
            <select
              className="input mt-2"
              value={type}
              onChange={(event) => setType(event.target.value as SearchType)}
            >
              <option>전체</option>
              <option>일지</option>
              <option>앨범</option>
              <option>이벤트</option>
            </select>
          </div>
          <div>
            <p className="label">기간</p>
            <input className="input mt-2" type="month" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="text-xs text-sand-500">태그가 아직 없어요.</span>
          ) : (
            tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`badge ${activeTag === tag ? 'bg-sand-200' : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))
          )}
        </div>
        <button className="button" type="button">
          검색하기
        </button>
      </section>
      <section className="grid gap-4">
        {results.length === 0 ? (
          <div className="card p-6 text-sm text-sand-600">검색 결과가 없어요.</div>
        ) : (
          results.map((result) => (
            <article key={`${result.type}-${result.id}`} className="card flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-sand-500">{formatDate(result.date)}</p>
                <h3 className="mt-1 text-base font-medium">{result.title}</h3>
                <span className="mt-2 inline-flex rounded-full bg-sand-100 px-3 py-1 text-xs text-sand-600">
                  {result.type}
                </span>
              </div>
              <a className="text-sm text-sand-600 hover:text-sand-900" href={result.href}>
                보기 →
              </a>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
