'use client'

import {
  formatDate,
  getLatestJournal,
  getRecentAlbums,
  getRecentEvents,
  getRecentJournals,
} from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

const quickActions = [
  { label: '기록하기', href: '/journal/new', description: '오늘의 순간 남기기' },
  { label: '사진 올리기', href: '/albums/new', description: '새 앨범 시작하기' },
  { label: '이벤트 만들기', href: '/events/new', description: '특별한 날 기록' },
]

export default function HomeClient() {
  const { data, ready } = useArchiveData()
  const latestJournal = getLatestJournal(data.journals)
  const recentJournals = getRecentJournals(data.journals)
  const recentEvents = getRecentEvents(data.events)
  const recentAlbums = getRecentAlbums(data.albums)

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  return (
    <div className="space-y-8">
      <section className="card grid gap-6 p-6 md:grid-cols-[240px_1fr]">
        <div className="flex h-40 items-center justify-center rounded-2xl bg-sand-100 text-sm text-sand-500">
          오늘의 대표 사진
        </div>
        <div>
          <p className="text-sm text-sand-600">오늘의 기록</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {latestJournal?.title ?? '오늘의 기록을 남겨보세요'}
          </h2>
          <p className="mt-3 text-sm text-sand-700">
            {latestJournal?.summary ??
              '작은 순간도 차곡차곡 쌓이면 소중한 아카이브가 됩니다.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(latestJournal?.tags ?? ['기록', '일상']).map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
          </div>
          <a
            className="mt-4 inline-block text-sm font-medium text-sand-700 hover:text-sand-900"
            href={latestJournal ? `/journal/${latestJournal.id}` : '/journal/new'}
          >
            자세히 보기 →
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <a
            key={action.href}
            className="card flex flex-col gap-3 px-5 py-4 text-sm text-sand-700 hover:text-sand-900"
            href={action.href}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{action.label}</span>
              <span aria-hidden>+</span>
            </div>
            <p className="text-xs text-sand-500">{action.description}</p>
          </a>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">이번 달 하이라이트</h3>
          <a className="text-sm text-sand-600 hover:text-sand-900" href="/albums">
            더 보기
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(recentAlbums.length ? recentAlbums : data.albums).slice(0, 3).map((album) => (
            <div key={album.id} className="card p-5">
              <div className="mb-3 h-24 rounded-xl bg-sand-100" />
              <p className="text-xs text-sand-500">
                {formatDate(album.periodStart)} {album.periodEnd ? `- ${formatDate(album.periodEnd)}` : ''}
              </p>
              <h4 className="mt-2 text-base font-medium">{album.title}</h4>
              <p className="mt-2 text-sm text-sand-600">
                사진 {album.photos.length}장
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">최근 일지</h3>
            <a className="text-sm text-sand-600 hover:text-sand-900" href="/journal">
              일기장으로
            </a>
          </div>
          <ul className="mt-4 space-y-4 text-sm text-sand-700">
            {recentJournals.map((item) => (
              <li key={item.id} className="space-y-1">
                <p className="text-xs text-sand-500">
                  {formatDate(item.date)} · {item.category}
                </p>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-sand-500">{item.summary}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">다가오는 이벤트</h3>
            <a className="text-sm text-sand-600 hover:text-sand-900" href="/events">
              이벤트 보기
            </a>
          </div>
          <ul className="mt-4 space-y-4 text-sm text-sand-700">
            {recentEvents.map((item) => (
              <li key={item.id} className="space-y-1">
                <p className="text-xs text-sand-500">{formatDate(item.date)}</p>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-sand-500">{item.location}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
