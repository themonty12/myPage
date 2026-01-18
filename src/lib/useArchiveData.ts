import { useCallback, useEffect, useState } from 'react'

import type { ArchiveData } from './types'
import { initData, loadData, saveData } from './storage'

export const useArchiveData = () => {
  const [data, setData] = useState<ArchiveData>(initData)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const current = loadData()
    setData(current)
    const fetchRemote = async () => {
      try {
        const response = await fetch('/api/archive', { cache: 'no-store' })
        if (!response.ok) throw new Error('failed')
        const remote = (await response.json()) as ArchiveData
        const local = loadData()
        const remoteStamp = Date.parse(remote.updatedAt ?? '') || 0
        const localStamp = Date.parse(local.updatedAt ?? '') || 0
        if (remoteStamp >= localStamp) {
          setData(remote)
          saveData(remote)
        } else {
          setData(local)
        }
      } catch {
        // Keep local data when remote is unavailable.
      } finally {
        setReady(true)
      }
    }
    fetchRemote()
  }, [])

  const update = useCallback((updater: (prev: ArchiveData) => ArchiveData) => {
    setData((prev) => {
      const next = updater(prev)
      const stamped = { ...next, updatedAt: new Date().toISOString() }
      saveData(stamped)
      fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stamped),
      }).catch(() => {
        // Ignore sync errors, keep local data.
      })
      return stamped
    })
  }, [])

  const refresh = useCallback(() => {
    const current = loadData()
    setData(current)
  }, [])

  return { data, update, refresh, ready }
}
