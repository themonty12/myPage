export type JournalCategory = '데이트' | '연애' | '육아' | '가족' | '여행' | '기타'

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

export type Settings = {
  defaultVisibility: 'private' | 'link'
  theme: 'cream' | 'navy' | 'olive'
}

export type ArchiveData = {
  journals: Journal[]
  albums: Album[]
  events: Event[]
  settings: Settings
  updatedAt: string
}
