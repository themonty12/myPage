import { promises as fs } from 'fs'
import path from 'path'

import { createClient } from '@supabase/supabase-js'

import type { ArchiveData, FoodMenu, Journal } from './types'
import { defaultData, exportData, importData, sanitizeJournalRow, sanitizeFoodMenuRow } from './storage'

const dataFilePath = path.join(process.cwd(), 'data', 'archive.json')
const defaultArchiveId = 'default'

// ---------------------------------------------------------------------------
// File storage
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// DB row ↔ TypeScript type 변환 (snake_case ↔ camelCase)
// ---------------------------------------------------------------------------

type JournalRow = {
  id: string
  title: string
  date: string
  category: string
  tags: string[]
  location: string | null
  summary: string | null
  content: string
  photos: string[]
  is_public: boolean
  share_id: string | null
  created_at: string
  updated_at: string
}

type FoodMenuRow = {
  id: string
  name: string
  category: string
  description: string | null
  main_ingredients: string[]
  sub_ingredients: string[]
  recipe: string | null
  video_url: string | null
  thumbnail_url: string | null
  cooking_time: number | null
  difficulty: string | null
  rating: number | null
  last_eaten: string | null
  created_at: string
  updated_at: string
}

const toJournalRow = (j: Journal): JournalRow => ({
  id: j.id,
  title: j.title,
  date: j.date,
  category: j.category,
  tags: j.tags,
  location: j.location ?? null,
  summary: j.summary ?? null,
  content: j.content,
  photos: j.photos,
  is_public: j.isPublic,
  share_id: j.shareId ?? null,
  created_at: j.createdAt,
  updated_at: j.updatedAt,
})

const fromJournalRow = (row: JournalRow): Journal =>
  sanitizeJournalRow({
    id: row.id,
    title: row.title,
    date: row.date,
    category: row.category as Journal['category'],
    tags: row.tags,
    location: row.location ?? undefined,
    summary: row.summary ?? undefined,
    content: row.content,
    photos: row.photos,
    isPublic: row.is_public,
    shareId: row.share_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

const toFoodMenuRow = (f: FoodMenu): FoodMenuRow => ({
  id: f.id,
  name: f.name,
  category: f.category,
  description: f.description ?? null,
  main_ingredients: f.mainIngredients ?? [],
  sub_ingredients: f.subIngredients ?? [],
  recipe: f.recipe ?? null,
  video_url: f.videoUrl ?? null,
  thumbnail_url: f.thumbnailUrl ?? null,
  cooking_time: f.cookingTime ?? null,
  difficulty: f.difficulty ?? null,
  rating: f.rating ?? null,
  last_eaten: f.lastEaten ?? null,
  created_at: f.createdAt,
  updated_at: f.updatedAt,
})

const fromFoodMenuRow = (row: FoodMenuRow): FoodMenu =>
  sanitizeFoodMenuRow({
    id: row.id,
    name: row.name,
    category: row.category as FoodMenu['category'],
    description: row.description ?? undefined,
    mainIngredients: row.main_ingredients,
    subIngredients: row.sub_ingredients,
    recipe: row.recipe ?? undefined,
    videoUrl: row.video_url ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    cookingTime: row.cooking_time ?? undefined,
    difficulty: (row.difficulty as FoodMenu['difficulty']) ?? undefined,
    rating: row.rating ?? undefined,
    lastEaten: row.last_eaten ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

// ---------------------------------------------------------------------------
// Supabase: journals 테이블
// ---------------------------------------------------------------------------

const readJournalsFromSupabase = async (
  client: ReturnType<typeof getSupabaseClient>
): Promise<Journal[]> => {
  if (!client) return defaultData.journals

  const { data, error } = await client
    .from('journals')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('[archive] journals read error', { message: error.message, code: error.code })
    return defaultData.journals
  }

  return (data as JournalRow[]).map(fromJournalRow)
}

const writeJournalsToSupabase = async (
  client: ReturnType<typeof getSupabaseClient>,
  journals: Journal[]
): Promise<void> => {
  if (!client) return

  // 기존 DB에 있는 ID 목록 조회
  const { data: existing, error: fetchError } = await client
    .from('journals')
    .select('id')

  if (fetchError) {
    console.error('[archive] journals fetch ids error', { message: fetchError.message })
    return
  }

  const existingIds = new Set((existing as { id: string }[]).map((r) => r.id))
  const currentIds = new Set(journals.map((j) => j.id))

  // 삭제된 항목 제거
  const toDelete = [...existingIds].filter((id) => !currentIds.has(id))
  if (toDelete.length > 0) {
    const { error: deleteError } = await client
      .from('journals')
      .delete()
      .in('id', toDelete)
    if (deleteError) {
      console.error('[archive] journals delete error', { message: deleteError.message })
    }
  }

  // 신규·수정 항목 upsert
  if (journals.length > 0) {
    const { error: upsertError } = await client
      .from('journals')
      .upsert(journals.map(toJournalRow))
    if (upsertError) {
      console.error('[archive] journals upsert error', { message: upsertError.message, code: upsertError.code })
      throw new Error(`JOURNALS_UPSERT_FAILED: ${upsertError.message}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Supabase: food_menus 테이블
// ---------------------------------------------------------------------------

const readFoodMenusFromSupabase = async (
  client: ReturnType<typeof getSupabaseClient>
): Promise<FoodMenu[]> => {
  if (!client) return defaultData.foodMenus

  const { data, error } = await client
    .from('food_menus')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[archive] food_menus read error', { message: error.message, code: error.code })
    return defaultData.foodMenus
  }

  return (data as FoodMenuRow[]).map(fromFoodMenuRow)
}

const writeFoodMenusToSupabase = async (
  client: ReturnType<typeof getSupabaseClient>,
  foodMenus: FoodMenu[]
): Promise<void> => {
  if (!client) return

  // 기존 DB에 있는 ID 목록 조회
  const { data: existing, error: fetchError } = await client
    .from('food_menus')
    .select('id')

  if (fetchError) {
    console.error('[archive] food_menus fetch ids error', { message: fetchError.message })
    return
  }

  const existingIds = new Set((existing as { id: string }[]).map((r) => r.id))
  const currentIds = new Set(foodMenus.map((f) => f.id))

  // 삭제된 항목 제거
  const toDelete = [...existingIds].filter((id) => !currentIds.has(id))
  if (toDelete.length > 0) {
    const { error: deleteError } = await client
      .from('food_menus')
      .delete()
      .in('id', toDelete)
    if (deleteError) {
      console.error('[archive] food_menus delete error', { message: deleteError.message })
    }
  }

  // 신규·수정 항목 upsert
  if (foodMenus.length > 0) {
    const { error: upsertError } = await client
      .from('food_menus')
      .upsert(foodMenus.map(toFoodMenuRow))
    if (upsertError) {
      console.error('[archive] food_menus upsert error', { message: upsertError.message, code: upsertError.code })
      throw new Error(`FOOD_MENUS_UPSERT_FAILED: ${upsertError.message}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Supabase: archives 테이블 (albums · events · settings)
// ---------------------------------------------------------------------------

const readArchiveMetaFromSupabase = async (
  client: ReturnType<typeof getSupabaseClient>
): Promise<Pick<ArchiveData, 'albums' | 'events' | 'settings'>> => {
  if (!client) return { albums: defaultData.albums, events: defaultData.events, settings: defaultData.settings }

  const { data, error } = await client
    .from('archives')
    .select('data')
    .eq('id', defaultArchiveId)
    .single()

  if (error || !data?.data) {
    if (error) {
      console.error('[archive] archives read error', { message: error.message, code: error.code })
    }
    return { albums: defaultData.albums, events: defaultData.events, settings: defaultData.settings }
  }

  const parsed = data.data as Partial<ArchiveData>
  return {
    albums: parsed.albums ?? defaultData.albums,
    events: parsed.events ?? defaultData.events,
    settings: parsed.settings ?? defaultData.settings,
  }
}

const writeArchiveMetaToSupabase = async (
  client: ReturnType<typeof getSupabaseClient>,
  data: ArchiveData
): Promise<void> => {
  if (!client) return

  const payload = {
    id: defaultArchiveId,
    data: { albums: data.albums, events: data.events, settings: data.settings },
    updated_at: new Date().toISOString(),
  }

  const { error } = await client.from('archives').upsert(payload)
  if (error) {
    console.error('[archive] archives write error', { message: error.message, code: error.code })
    throw new Error(`ARCHIVE_UPSERT_FAILED: ${error.message}${error.code ? ` (code: ${error.code})` : ''}`)
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const readArchiveFromSupabase = async (): Promise<ArchiveData> => {
  const client = getSupabaseClient()
  if (!client) return readArchiveFromFile()

  const [meta, journals, foodMenus] = await Promise.all([
    readArchiveMetaFromSupabase(client),
    readJournalsFromSupabase(client),
    readFoodMenusFromSupabase(client),
  ])

  return {
    ...meta,
    journals,
    foodMenus,
    updatedAt: new Date().toISOString(),
  }
}

const writeArchiveToSupabase = async (data: ArchiveData): Promise<void> => {
  const client = getSupabaseClient()
  if (!client) return writeArchiveToFile(data)

  await Promise.all([
    writeArchiveMetaToSupabase(client, data),
    writeJournalsToSupabase(client, data.journals),
    writeFoodMenusToSupabase(client, data.foodMenus),
  ])
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
