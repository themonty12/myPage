# Supabase 테이블 구조 - journals

## 테이블 생성 SQL

```sql
create table if not exists public.journals (
  id           text        primary key,
  title        text        not null,
  date         text        not null,
  category     text        not null,
  tags         text[]      not null default '{}',
  location     text,
  summary      text,
  content      text        not null default '',
  photos       text[]      not null default '{}',
  is_public    boolean     not null default false,
  share_id     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
```

## 컬럼 설명

| 컬럼명       | 타입        | 필수 | 설명                                                    |
|-------------|-------------|------|---------------------------------------------------------|
| id          | text        | ✅   | 고유 식별자 (예: `journal-xxxx`)                        |
| title       | text        | ✅   | 일기 제목                                               |
| date        | text        | ✅   | 날짜 (`YYYY-MM-DD` 형식)                                |
| category    | text        | ✅   | 카테고리 (`데이트`, `연애`, `육아`, `가족`, `여행`, `운동`, `기타`) |
| tags        | text[]      | ✅   | 태그 배열                                               |
| location    | text        |      | 장소                                                    |
| summary     | text        |      | 요약 (본문 앞 60자)                                     |
| content     | text        | ✅   | 본문 내용                                               |
| photos      | text[]      | ✅   | 사진 Data URL 배열                                      |
| is_public   | boolean     | ✅   | 공개 여부 (기본값: `false`)                             |
| share_id    | text        |      | 공유 링크용 고유 ID (예: `share-xxxx`)                  |
| created_at  | timestamptz | ✅   | 생성 시각                                               |
| updated_at  | timestamptz | ✅   | 수정 시각                                               |

## 인덱스 (선택)

```sql
-- 날짜 기준 정렬 성능 향상
create index if not exists journals_date_idx on public.journals (date desc);

-- 공유 ID 조회 성능 향상
create index if not exists journals_share_id_idx on public.journals (share_id)
  where share_id is not null;

-- 카테고리 필터 성능 향상
create index if not exists journals_category_idx on public.journals (category);
```

## RLS (Row Level Security) 설정

```sql
-- RLS 활성화
alter table public.journals enable row level security;

-- 서비스 롤(server-side)에서 전체 접근 허용
create policy "service role full access"
  on public.journals
  using (true)
  with check (true);
```

## TypeScript 타입 매핑

```typescript
// src/lib/types.ts 기준
export type JournalCategory =
  | '데이트' | '연애' | '육아' | '가족'
  | '여행'  | '운동' | '기타'

export type Journal = {
  id:        string
  title:     string
  date:      string           // YYYY-MM-DD
  category:  JournalCategory
  tags:      string[]
  location?: string
  summary?:  string
  content:   string
  photos:    string[]         // Data URL[]
  isPublic:  boolean          // → is_public
  shareId?:  string           // → share_id
  createdAt: string           // → created_at
  updatedAt: string           // → updated_at
}
```

## 참고

- 현재 앱은 `archives` 단일 JSONB 테이블에 모든 데이터를 저장하는 방식을 사용합니다.
- 위 테이블은 journals를 독립 테이블로 분리할 경우의 스키마입니다.
- 분리 시 `archiveStore.ts`의 읽기/쓰기 로직도 함께 변경이 필요합니다.
