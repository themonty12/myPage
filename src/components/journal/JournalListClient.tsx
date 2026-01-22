'use client'

import { useMemo, useState } from 'react'

import { formatDate } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

const categories = ['전체', '데이트', '연애', '육아', '가족', '여행', '기타', '운동'] as const

export default function JournalListClient() {
  const { data, ready, update } = useArchiveData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('전체')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    title: '',
    date: '',
    category: '데이트',
    tags: '',
    summary: '',
  })

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return data.journals.filter((journal) => {
      const matchesCategory =
        category === '전체' ? true : journal.category === category
      const matchesQuery =
        normalized.length === 0
          ? true
          : [
              journal.title,
              journal.summary,
              journal.content,
              journal.location,
              journal.tags.join(' '),
            ]
              .join(' ')
              .toLowerCase()
              .includes(normalized)
      return matchesCategory && matchesQuery
    })
  }, [category, data.journals, query])

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('이 기록을 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      journals: prev.journals.filter((item) => item.id !== id),
    }))
  }

  const handleStartEdit = (item: (typeof data.journals)[number]) => {
    setEditingId(item.id)
    setFormState({
      title: item.title,
      date: item.date,
      category: item.category,
      tags: item.tags.join(', '),
      summary: item.summary ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleSaveEdit = (id: string) => {
    update((prev) => ({
      ...prev,
      journals: prev.journals.map((item) =>
        item.id === id
          ? {
              ...item,
              title: formState.title.trim(),
              date: formState.date,
              category: formState.category as (typeof item)['category'],
              tags: formState.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
              summary: formState.summary.trim(),
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
        <h2 className="text-2xl font-semibold">일기장</h2>
        <p className="mt-2 text-sm text-sand-600">
          데이트, 연애, 육아 기록을 한눈에 모아보세요.
        </p>
      </header>
      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input max-w-sm"
            placeholder="제목이나 태그로 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <a className="button" href="/journal/new">
            새 기록 쓰기
          </a>
        </div>
        <div>
          <p className="label">필터</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-sand-700">
            {categories.map((item) => (
              <button
                key={item}
                className={`badge ${category === item ? 'bg-sand-200' : ''}`}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="card p-6 text-sm text-sand-600">
            아직 저장된 기록이 없어요. 새 기록을 작성해보세요.
          </div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{item.title}</h3>
                <span className="badge">{item.category}</span>
              </div>
              <p className="text-sm text-sand-600">{formatDate(item.date)}</p>
              <p className="text-sm text-sand-700">{item.summary}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a className="button-outline" href={`/journal/${item.id}`}>
                  상세 보기
                </a>
                {editingId === item.id ? (
                  <>
                    <button
                      type="button"
                      className="button-outline"
                      onClick={() => handleSaveEdit(item.id)}
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
                    onClick={() => handleStartEdit(item)}
                  >
                    빠른 수정
                  </button>
                )}
                <button
                  type="button"
                  className="button-outline text-rose-500 hover:text-rose-600"
                  onClick={() => handleDelete(item.id)}
                >
                  삭제
                </button>
              </div>
              {editingId === item.id ? (
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="label">제목</p>
                    <input
                      className="input mt-2"
                      value={formState.title}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, title: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">날짜</p>
                    <input
                      className="input mt-2"
                      type="date"
                      value={formState.date}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, date: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="label">카테고리</p>
                    <select
                      className="input mt-2"
                      value={formState.category}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, category: event.target.value }))
                      }
                    >
                      {categories.filter((item) => item !== '전체').map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
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
                  <div className="md:col-span-2">
                    <p className="label">요약</p>
                    <input
                      className="input mt-2"
                      value={formState.summary}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, summary: event.target.value }))
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
