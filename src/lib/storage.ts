import type { Album, ArchiveData, Event, FoodMenu, Journal, Settings } from './types'

const STORAGE_KEY = 'lifeArchiveData'

const now = () => new Date().toISOString()

export const defaultSettings: Settings = {
  defaultVisibility: 'private',
  theme: 'cream',
}

export const defaultData: ArchiveData = {
  journals: [
    {
      id: 'journal-1',
      title: '따뜻했던 오후',
      date: '2026-01-15',
      category: '데이트',
      tags: ['산책', '카페'],
      location: '서교동',
      summary: '작은 산책과 커피 한 잔을 기록했어요.',
      content:
        '오후의 공기는 맑고 따뜻했어요. 천천히 걸으며 이야기를 나누고, 작은 카페에 들어가 창가에 앉았어요.',
      photos: [],
      isPublic: false,
      shareId: 'share-journal-1',
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  albums: [
    {
      id: 'album-1',
      title: '봄 여행',
      periodStart: '2025-04-02',
      periodEnd: '2025-04-05',
      tags: ['여행', '봄'],
      coverUrl: '',
      photos: [],
      memo: '가족과 함께한 봄 여행 사진을 모아두었어요.',
      isPublic: false,
      shareId: 'share-album-1',
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  events: [
    {
      id: 'event-1',
      title: '청첩장',
      type: '청첩장',
      date: '2026-03-21',
      time: '14:00',
      location: '서울 웨딩홀 3층',
      contact: '010-0000-0000',
      greeting: '소중한 분들을 초대합니다. 함께 축하해 주시면 감사하겠습니다.',
      venueInfo: '서울 웨딩홀 3층 라벤더홀',
      transitInfo: '지하철 2호선 강남역 5번 출구 도보 8분',
      accountInfo: '신랑 김OO 123-456-789 (OO은행)',
      description:
        '소중한 분들을 초대합니다. 편안한 마음으로 오셔서 함께 축하해 주세요.',
      coverUrl: '',
      photos: [],
      guestbook: [
        {
          id: 'guestbook-1',
          name: '지인',
          message: '결혼 진심으로 축하해요!',
          createdAt: now(),
        },
      ],
      isPublic: true,
      shareId: 'share-event-1',
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  foodMenus: [
    {
      id: 'food-1',
      name: '김치찌개',
      category: '한식',
      description: '매콤하고 시원한 김치찌개',
      mainIngredients: ['김치', '돼지고기'],
      subIngredients: ['두부', '대파', '양파'],
      cookingTime: 30,
      difficulty: '쉬움',
      rating: 5,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-2',
      name: '파스타',
      category: '양식',
      description: '크림 파스타',
      mainIngredients: ['면', '크림'],
      subIngredients: ['베이컨', '양파', '마늘'],
      cookingTime: 20,
      difficulty: '보통',
      rating: 4,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-3',
      name: '라면',
      category: '간편식',
      description: '간단한 라면',
      mainIngredients: ['라면'],
      subIngredients: ['계란', '파', '김치'],
      cookingTime: 5,
      difficulty: '쉬움',
      rating: 3,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-4',
      name: '치킨',
      category: '치킨',
      description: '바삭한 후라이드 치킨',
      cookingTime: 40,
      difficulty: '어려움',
      rating: 5,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-5',
      name: '피자',
      category: '양식',
      description: '치즈 피자',
      mainIngredients: ['도우', '치즈'],
      subIngredients: ['토마토소스', '올리브오일'],
      cookingTime: 25,
      difficulty: '보통',
      rating: 4,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-6',
      name: '초밥',
      category: '일식',
      description: '신선한 초밥',
      mainIngredients: ['밥', '생선'],
      subIngredients: ['와사비', '간장', '생강'],
      cookingTime: 60,
      difficulty: '어려움',
      rating: 5,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-7',
      name: '짜장면',
      category: '중식',
      description: '달콤한 짜장면',
      mainIngredients: ['면', '춘장'],
      subIngredients: ['양파', '돼지고기', '양배추'],
      cookingTime: 25,
      difficulty: '보통',
      rating: 4,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-8',
      name: '햄버거',
      category: '패스트푸드',
      description: '맛있는 햄버거',
      mainIngredients: ['번', '패티'],
      subIngredients: ['야채', '소스', '치즈'],
      cookingTime: 15,
      difficulty: '쉬움',
      rating: 4,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'food-9',
      name: '비빔밥',
      category: '한식',
      description: '영양 만점 비빔밥',
      mainIngredients: ['밥', '나물'],
      subIngredients: ['고추장', '계란', '참기름'],
      cookingTime: 20,
      difficulty: '보통',
      rating: 5,
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  settings: defaultSettings,
  updatedAt: now(),
}

const isBrowser = () => typeof window !== 'undefined'

export const formatDate = (date?: string) => {
  if (!date) return ''
  return date.replaceAll('-', '.')
}

export const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const loadData = (): ArchiveData => {
  if (!isBrowser()) return defaultData
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultData
  try {
    const parsed = JSON.parse(raw) as ArchiveData
    return {
      ...defaultData,
      ...parsed,
      journals: parsed.journals ?? defaultData.journals,
      albums: parsed.albums ?? defaultData.albums,
      events: parsed.events ?? defaultData.events,
      foodMenus: parsed.foodMenus ?? defaultData.foodMenus,
      settings: parsed.settings ?? defaultData.settings,
    }
  } catch {
    return defaultData
  }
}

export const saveData = (data: ArchiveData) => {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const initData = () => {
  if (!isBrowser()) return defaultData
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    saveData(defaultData)
    return defaultData
  }
  return loadData()
}

const sanitizeStrings = (value: unknown, fallback?: string) =>
  typeof value === 'string' ? value : fallback

const sanitizeRequiredString = (value: unknown, fallback = '') =>
  sanitizeStrings(value, fallback) ?? fallback

const sanitizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []

const sanitizeBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback

const sanitizeJournal = (item: Partial<Journal>): Journal => ({
  id: sanitizeRequiredString(item.id, createId('journal')),
  title: sanitizeRequiredString(item.title, ''),
  date: sanitizeRequiredString(item.date, ''),
  category: (item.category as Journal['category']) ?? '기타',
  tags: sanitizeStringArray(item.tags),
  location: sanitizeStrings(item.location, undefined),
  summary: sanitizeStrings(item.summary, undefined),
  content: sanitizeRequiredString(item.content, ''),
  photos: sanitizeStringArray(item.photos),
  isPublic: sanitizeBoolean(item.isPublic),
  shareId: sanitizeStrings(item.shareId, undefined),
  createdAt: sanitizeRequiredString(item.createdAt, now()),
  updatedAt: sanitizeRequiredString(item.updatedAt, now()),
})

const sanitizeAlbum = (item: Partial<Album>): Album => ({
  id: sanitizeRequiredString(item.id, createId('album')),
  title: sanitizeRequiredString(item.title, ''),
  periodStart: sanitizeStrings(item.periodStart, undefined),
  periodEnd: sanitizeStrings(item.periodEnd, undefined),
  tags: sanitizeStringArray(item.tags),
  coverUrl: sanitizeStrings(item.coverUrl, undefined),
  photos: sanitizeStringArray(item.photos),
  memo: sanitizeStrings(item.memo, undefined),
  isPublic: sanitizeBoolean(item.isPublic),
  shareId: sanitizeStrings(item.shareId, undefined),
  createdAt: sanitizeRequiredString(item.createdAt, now()),
  updatedAt: sanitizeRequiredString(item.updatedAt, now()),
})

const sanitizeEvent = (item: Partial<Event>): Event => ({
  id: sanitizeRequiredString(item.id, createId('event')),
  title: sanitizeRequiredString(item.title, ''),
  type: (item.type as Event['type']) ?? '기타',
  date: sanitizeRequiredString(item.date, ''),
  time: sanitizeStrings(item.time, undefined),
  location: sanitizeStrings(item.location, undefined),
  contact: sanitizeStrings(item.contact, undefined),
  greeting: sanitizeStrings(item.greeting, undefined),
  venueInfo: sanitizeStrings(item.venueInfo, undefined),
  transitInfo: sanitizeStrings(item.transitInfo, undefined),
  accountInfo: sanitizeStrings(item.accountInfo, undefined),
  description: sanitizeRequiredString(item.description, ''),
  coverUrl: sanitizeStrings(item.coverUrl, undefined),
  photos: sanitizeStringArray(item.photos),
  guestbook: Array.isArray(item.guestbook)
    ? item.guestbook
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => ({
          id: sanitizeStrings((entry as { id?: string }).id) ?? createId('guestbook'),
          name: sanitizeStrings((entry as { name?: string }).name) ?? '익명',
          message: sanitizeStrings((entry as { message?: string }).message) ?? '',
          createdAt: sanitizeRequiredString((entry as { createdAt?: string }).createdAt, now()),
        }))
    : [],
  isPublic: sanitizeBoolean(item.isPublic),
  shareId: sanitizeStrings(item.shareId, undefined),
  createdAt: sanitizeRequiredString(item.createdAt, now()),
  updatedAt: sanitizeRequiredString(item.updatedAt, now()),
})

const sanitizeFoodMenu = (item: Partial<FoodMenu>): FoodMenu => ({
  id: sanitizeRequiredString(item.id, createId('food')),
  name: sanitizeRequiredString(item.name, ''),
  category: (item.category as FoodMenu['category']) ?? '기타',
  description: sanitizeStrings(item.description, undefined),
  mainIngredients: sanitizeStringArray(item.mainIngredients),
  subIngredients: sanitizeStringArray(item.subIngredients),
  recipe: sanitizeStrings(item.recipe, undefined),
  videoUrl: sanitizeStrings(item.videoUrl, undefined),
  thumbnailUrl: sanitizeStrings(item.thumbnailUrl, undefined),
  cookingTime: typeof item.cookingTime === 'number' ? item.cookingTime : undefined,
  difficulty: (item.difficulty as FoodMenu['difficulty']) ?? undefined,
  rating: typeof item.rating === 'number' ? item.rating : undefined,
  lastEaten: sanitizeStrings(item.lastEaten, undefined),
  createdAt: sanitizeRequiredString(item.createdAt, now()),
  updatedAt: sanitizeRequiredString(item.updatedAt, now()),
})

const sanitizeSettings = (value: Partial<Settings> | undefined): Settings => ({
  defaultVisibility:
    value?.defaultVisibility === 'link' ? 'link' : defaultSettings.defaultVisibility,
  theme:
    value?.theme === 'navy' || value?.theme === 'olive' ? value.theme : defaultSettings.theme,
})

export const exportData = (data: ArchiveData) => {
  return JSON.stringify(
    {
      ...data,
      updatedAt: now(),
    },
    null,
    2
  )
}

export const importData = (raw: string): ArchiveData => {
  const parsed = JSON.parse(raw) as Partial<ArchiveData>
  return {
    journals: (parsed.journals ?? []).map((item) => sanitizeJournal(item as Partial<Journal>)),
    albums: (parsed.albums ?? []).map((item) => sanitizeAlbum(item as Partial<Album>)),
    events: (parsed.events ?? []).map((item) => sanitizeEvent(item as Partial<Event>)),
    foodMenus: (parsed.foodMenus ?? []).map((item) => sanitizeFoodMenu(item as Partial<FoodMenu>)),
    settings: sanitizeSettings(parsed.settings),
    updatedAt: now(),
  }
}

export const sortByDateDesc = <T extends { date?: string }>(items: T[]) => {
  return [...items].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export const getLatestJournal = (journals: Journal[]) =>
  sortByDateDesc(journals)[0]

export const getRecentJournals = (journals: Journal[], count = 3) =>
  sortByDateDesc(journals).slice(0, count)

export const getRecentEvents = (events: Event[], count = 2) =>
  sortByDateDesc(events).slice(0, count)

export const getRecentAlbums = (albums: Album[], count = 2) =>
  [...albums].slice(0, count)
