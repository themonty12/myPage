'use client'

import { useMemo, useState } from 'react'

import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

export default function AlbumsListClient() {
  const { data, ready, update } = useArchiveData()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    title: '',
    periodStart: '',
    periodEnd: '',
    tags: '',
    memo: '',
  })

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data.albums
    return data.albums.filter((album) =>
      [album.title, album.memo, album.tags.join(' ')].join(' ').toLowerCase().includes(normalized)
    )
  }, [data.albums, query])

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('이 앨범을 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      albums: prev.albums.filter((item) => item.id !== id),
    }))
  }

  const handleStartEdit = (item: (typeof data.albums)[number]) => {
    setEditingId(item.id)
    setFormState({
      title: item.title,
      periodStart: item.periodStart ?? '',
      periodEnd: item.periodEnd ?? '',
      tags: item.tags.join(', '),
      memo: item.memo ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleSaveEdit = (id: string) => {
    update((prev) => ({
      ...prev,
      albums: prev.albums.map((item) =>
        item.id === id
          ? {
              ...item,
              title: formState.title.trim(),
              periodStart: formState.periodStart || undefined,
              periodEnd: formState.periodEnd || undefined,
              tags: formState.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
              memo: formState.memo.trim() || undefined,
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
        <h2 className="text-2xl font-semibold">사진첩</h2>
        <p className="mt-2 text-sm text-sand-600">
          추억을 앨범으로 정리해보세요.
        </p>
      </header>
      <section className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-sm"
          placeholder="앨범 제목이나 태그로 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <a className="button" href="/albums/new">
          새 앨범 만들기
        </a>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="card p-6 text-sm text-sand-600">
            아직 앨범이 없어요. 새 앨범을 만들어 보세요.
          </div>
        ) : (
          filtered.map((album) => (
            <article key={album.id} className="card p-5">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={`${album.title} 커버`}
                  className="h-40 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="h-40 rounded-2xl bg-sand-100" />
              )}
              <h3 className="mt-4 text-base font-medium">{album.title}</h3>
              <p className="mt-2 text-sm text-sand-600">
                {formatDate(album.periodStart)}
                {album.periodEnd ? ` - ${formatDate(album.periodEnd)}` : ''} · 사진{' '}
                {album.photos.length}장
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a className="button-outline" href={`/albums/${album.id}`}>
                  상세 보기
                </a>
                {editingId === album.id ? (
                  <>
                    <button
                      type="button"
                      className="button-outline"
                      onClick={() => handleSaveEdit(album.id)}
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
                    onClick={() => handleStartEdit(album)}
                  >
                    빠른 수정
                  </button>
                )}
                <button
                  type="button"
                  className="button-outline text-rose-500 hover:text-rose-600"
                  onClick={() => handleDelete(album.id)}
                >
                  삭제
                </button>
              </div>
              {editingId === album.id ? (
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="label">앨범 이름</p>
                    <input
                      className="input mt-2"
                      value={formState.title}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, title: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">태그</p>
                    <input
                      className="input mt-2"
                      value={formState.tags}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, tags: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">기간 시작</p>
                    <input
                      className="input mt-2"
                      type="date"
                      value={formState.periodStart}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, periodStart: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">기간 종료</p>
                    <input
                      className="input mt-2"
                      type="date"
                      value={formState.periodEnd}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, periodEnd: event.target.value }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="label">메모</p>
                    <input
                      className="input mt-2"
                      value={formState.memo}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, memo: event.target.value }))
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
