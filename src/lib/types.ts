export type JournalCategory = '데이트' | '연애' | '육아' | '가족' | '여행' | '운동' | '기타'

export type Journal = {
  id: string
  title: string
  date: string
  category: JournalCategory
  tags: string[]
  location?: string
  summary?: string
  content: string
  photos: string[]
  isPublic: boolean
  shareId?: string
  createdAt: string
  updatedAt: string
}

export type Album = {
  id: string
  title: string
  periodStart?: string
  periodEnd?: string
  tags: string[]
  coverUrl?: string
  photos: string[]
  memo?: string
  isPublic: boolean
  shareId?: string
  createdAt: string
  updatedAt: string
}

export type EventType = '청첩장' | '기념일' | '돌잔치' | '가족 모임' | '기타'

export type GuestbookEntry = {
  id: string
  name: string
  message: string
  createdAt: string
}

export type Event = {
  id: string
  title: string
  type: EventType
  date: string
  time?: string
  location?: string
  contact?: string
  greeting?: string
  venueInfo?: string
  transitInfo?: string
  accountInfo?: string
  description: string
  coverUrl?: string
  photos: string[]
  guestbook?: GuestbookEntry[]
  isPublic: boolean
  shareId?: string
  createdAt: string
  updatedAt: string
}

export type FoodCategory = '한식' | '양식' | '중식' | '일식' | '아시안' | '치킨' | '피자' | '패스트푸드' | '간편식' | '기타'

export type FoodMenu = {
  id: string
  name: string
  category: FoodCategory
  description?: string
  mainIngredients?: string[]
  subIngredients?: string[]
  recipe?: string
  videoUrl?: string
  thumbnailUrl?: string
  cookingTime?: number
  difficulty?: '쉬움' | '보통' | '어려움'
  rating?: number
  lastEaten?: string
  createdAt: string
  updatedAt: string
}

export type Settings = {
  defaultVisibility: 'private' | 'link'
  theme: 'cream' | 'navy' | 'olive'
}

export type ArchiveData = {
  journals: Journal[]
  albums: Album[]
  events: Event[]
  foodMenus: FoodMenu[]
  settings: Settings
  updatedAt: string
}
