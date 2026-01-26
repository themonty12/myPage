import { promises as fs } from 'fs'
import path from 'path'

import { createClient } from '@supabase/supabase-js'

import type { ArchiveData } from './types'
import { defaultData, exportData, importData } from './storage'

const dataFilePath = path.join(process.cwd(), 'data', 'archive.json')
const defaultArchiveId = 'default'

const ensureDataFile = async () => {
  try {
    await fs.access(dataFilePath)
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
    await fs.writeFile(dataFilePath, exportData(defaultData), 'utf-8')
  }
}

const readArchiveFromFile = async (): Promise<ArchiveData> => {
  await ensureDataFile()
  const raw = await fs.readFile(dataFilePath, 'utf-8')
  return importData(raw)
}

const writeArchiveToFile = async (data: ArchiveData) => {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
  await fs.writeFile(dataFilePath, exportData(data), 'utf-8')
}

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

const readArchiveFromSupabase = async (): Promise<ArchiveData> => {
  const client = getSupabaseClient()
  if (!client) return readArchiveFromFile()

  const { data, error } = await client
    .from('archives')
    .select('data')
    .eq('id', defaultArchiveId)
    .single()

  if (error) {
    console.error('[archive] Supabase read error', {
      message: error.message,
      code: error.code,
      details: error.details,
    })
    return defaultData
  }

  if (!data?.data) {
    console.warn('[archive] Supabase read empty data for id=default')
    return defaultData
  }

  return importData(JSON.stringify(data.data))
}

const writeArchiveToSupabase = async (data: ArchiveData) => {
  const client = getSupabaseClient()
  if (!client) return writeArchiveToFile(data)

  const payload = {
    id: defaultArchiveId,
    data,
    updated_at: new Date().toISOString(),
  }

  const { error } = await client.from('archives').upsert(payload)
  if (error) {
    console.error('[archive] Supabase write error', {
      message: error.message,
      code: error.code,
      details: error.details,
    })
    throw new Error(
      `SUPABASE_UPSERT_FAILED: ${error.message}${error.code ? ` (code: ${error.code})` : ''}`
    )
  }
}

export const readArchive = async (): Promise<ArchiveData> => {
  const storageType = process.env.ARCHIVE_STORAGE
  if (storageType === 'supabase') return readArchiveFromSupabase()
  return readArchiveFromFile()
}

export const writeArchive = async (data: ArchiveData) => {
  const storageType = process.env.ARCHIVE_STORAGE
  if (storageType === 'supabase') return writeArchiveToSupabase(data)
  return writeArchiveToFile(data)
}
