'use client'

import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { exportData, importData } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

export default function SettingsClient() {
  const { data, update, ready, refresh } = useArchiveData()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const [fileSyncStatus, setFileSyncStatus] = useState<string | null>(null)

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  const handleDownload = () => {
    const fileName = `life-archive-backup-${new Date().toISOString().slice(0, 10)}.json`
    const blob = new Blob([exportData(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setBackupStatus('백업 파일을 다운로드했어요.')
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const next = importData(text)
      update(() => next)
      refresh()
      setBackupStatus('백업 파일을 성공적으로 불러왔어요.')
    } catch {
      setBackupStatus('백업 파일을 읽을 수 없어요. JSON 파일인지 확인해주세요.')
    } finally {
      event.target.value = ''
    }
  }

  const handleVisibilityChange = (value: 'private' | 'link') => {
    update((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        defaultVisibility: value,
      },
    }))
  }

  const handleThemeChange = (theme: 'cream' | 'navy' | 'olive') => {
    update((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme,
      },
    }))
  }

  const handleSyncFromFile = async () => {
    setFileSyncStatus(null)
    try {
      const response = await fetch('/api/archive', { cache: 'no-store' })
      if (!response.ok) throw new Error('failed')
      const next = await response.json()
      update(() => next)
      refresh()
      setFileSyncStatus('파일 데이터를 불러왔어요.')
    } catch {
      setFileSyncStatus('파일 데이터를 불러오지 못했어요.')
    }
  }

  const handleSyncToFile = async () => {
    setFileSyncStatus(null)
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('failed')
      setFileSyncStatus('파일로 저장했어요.')
    } catch {
      setFileSyncStatus('파일로 저장하지 못했어요.')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">내 공간</h2>
        <p className="mt-2 text-sm text-sand-600">
          공개 범위, 공유 링크, 테마를 설정하세요.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-4 p-6 text-sm text-sand-700">
          <h3 className="text-lg font-semibold">공개 범위 기본값</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                className="accent-sand-700"
                checked={data.settings.defaultVisibility === 'private'}
                onChange={() => handleVisibilityChange('private')}
              />
              비공개 (나만 보기)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                className="accent-sand-700"
                checked={data.settings.defaultVisibility === 'link'}
                onChange={() => handleVisibilityChange('link')}
              />
              공유 링크만 공개
            </label>
          </div>
        </div>
        <div className="card space-y-4 p-6 text-sm text-sand-700">
          <h3 className="text-lg font-semibold">테마</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`badge ${data.settings.theme === 'cream' ? 'bg-sand-200' : ''}`}
              onClick={() => handleThemeChange('cream')}
            >
              크림 & 베이지
            </button>
            <button
              type="button"
              className={`badge ${data.settings.theme === 'navy' ? 'bg-sand-200' : ''}`}
              onClick={() => handleThemeChange('navy')}
            >
              차분한 네이비
            </button>
            <button
              type="button"
              className={`badge ${data.settings.theme === 'olive' ? 'bg-sand-200' : ''}`}
              onClick={() => handleThemeChange('olive')}
            >
              화이트 & 올리브
            </button>
          </div>
          <p className="text-xs text-sand-500">
            테마 설정은 다음 단계에서 실제 색상에 반영됩니다.
          </p>
        </div>
      </section>
      <section className="card space-y-4 p-6 text-sm text-sand-700">
        <h3 className="text-lg font-semibold">공유 링크 관리</h3>
        <ul className="space-y-3">
          {data.events
            .filter((event) => event.shareId)
            .slice(0, 2)
            .map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-sand-500">공유 링크 생성됨</p>
                </div>
                <a className="button-outline" href={`/share/${event.shareId}`}>
                  링크 보기
                </a>
              </li>
            ))}
          {data.events.filter((event) => event.shareId).length === 0 ? (
            <li className="text-xs text-sand-500">공유 링크가 아직 없어요.</li>
          ) : null}
        </ul>
      </section>
      <section className="card space-y-4 p-6 text-sm text-sand-700">
        <h3 className="text-lg font-semibold">백업</h3>
        <p className="text-sm text-sand-600">
          기록과 사진 정보를 파일로 내려받아 안전하게 보관하세요.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="button" type="button" onClick={handleDownload}>
            백업 다운로드
          </button>
          <button className="button-outline" type="button" onClick={handleUploadClick}>
            백업 가져오기
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        {backupStatus ? (
          <p className="text-xs text-sand-500">{backupStatus}</p>
        ) : null}
      </section>
      <section className="card space-y-4 p-6 text-sm text-sand-700">
        <h3 className="text-lg font-semibold">외부 저장소 동기화</h3>
        <p className="text-sm text-sand-600">
          현재 설정된 저장소(Supabase/파일 등)와 데이터를 동기화합니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="button-outline" type="button" onClick={handleSyncFromFile}>
            저장소에서 불러오기
          </button>
          <button className="button" type="button" onClick={handleSyncToFile}>
            저장소로 저장하기
          </button>
        </div>
        {fileSyncStatus ? (
          <p className="text-xs text-sand-500">{fileSyncStatus}</p>
        ) : null}
      </section>
    </div>
  )
}
