# Supabase 테이블 구조 - food_menus

## 테이블 생성 SQL

```sql
create table if not exists public.food_menus (
  id                text        primary key,
  name              text        not null,
  category          text        not null,
  description       text,
  main_ingredients  text[]      not null default '{}',
  sub_ingredients   text[]      not null default '{}',
  recipe            text,
  video_url         text,
  thumbnail_url     text,
  cooking_time      integer,
  difficulty        text,
  rating            integer,
  last_eaten        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

## 컬럼 설명

| 컬럼명              | 타입        | 필수 | 설명                                                                        |
|--------------------|-------------|------|-----------------------------------------------------------------------------|
| id                 | text        | ✅   | 고유 식별자 (예: `food-xxxx`)                                               |
| name               | text        | ✅   | 메뉴 이름                                                                   |
| category           | text        | ✅   | 분류 (`한식`, `양식`, `중식`, `일식`, `아시안`, `브런치`, `패스트푸드`, `간편식`, `기타`) |
| description        | text        |      | 메뉴 설명                                                                   |
| main_ingredients   | text[]      | ✅   | 주 재료 배열                                                                |
| sub_ingredients    | text[]      | ✅   | 부 재료 배열                                                                |
| recipe             | text        |      | 요리법 (단계별 설명)                                                        |
| video_url          | text        |      | 참고 영상 URL (YouTube 등)                                                  |
| thumbnail_url      | text        |      | 섬네일 이미지 (Data URL 또는 외부 URL)                                      |
| cooking_time       | integer     |      | 조리 시간 (분 단위)                                                         |
| difficulty         | text        |      | 난이도 (`쉬움`, `보통`, `어려움`)                                           |
| rating             | integer     |      | 평점 (1 ~ 5)                                                                |
| last_eaten         | text        |      | 마지막으로 먹은 날짜 (`YYYY-MM-DD` 형식)                                    |
| created_at         | timestamptz | ✅   | 생성 시각                                                                   |
| updated_at         | timestamptz | ✅   | 수정 시각                                                                   |

## 제약 조건 (선택)

```sql
-- category 허용값 제한
alter table public.food_menus
  add constraint food_menus_category_check
  check (category in ('한식','양식','중식','일식','아시안','브런치','패스트푸드','간편식','기타'));

-- difficulty 허용값 제한
alter table public.food_menus
  add constraint food_menus_difficulty_check
  check (difficulty is null or difficulty in ('쉬움','보통','어려움'));

-- rating 범위 제한
alter table public.food_menus
  add constraint food_menus_rating_check
  check (rating is null or (rating >= 1 and rating <= 5));

-- cooking_time 양수 제한
alter table public.food_menus
  add constraint food_menus_cooking_time_check
  check (cooking_time is null or cooking_time > 0);
```

## 인덱스 (선택)

```sql
-- 카테고리 필터 성능 향상
create index if not exists food_menus_category_idx on public.food_menus (category);

-- 이름 검색 성능 향상
create index if not exists food_menus_name_idx on public.food_menus (name);

-- 최근 추가 순 정렬 성능 향상
create index if not exists food_menus_created_at_idx on public.food_menus (created_at desc);
```

## RLS (Row Level Security) 설정

```sql
-- RLS 활성화
alter table public.food_menus enable row level security;

-- 서비스 롤(server-side)에서 전체 접근 허용
create policy "service role full access"
  on public.food_menus
  using (true)
  with check (true);
```

## TypeScript 타입 매핑

```typescript
// src/lib/types.ts 기준
export type FoodCategory =
  | '한식' | '양식' | '중식' | '일식'
  | '아시안' | '브런치' | '패스트푸드' | '간편식' | '기타'

export type FoodMenu = {
  id:               string
  name:             string
  category:         FoodCategory
  description?:     string
  mainIngredients?: string[]    // → main_ingredients
  subIngredients?:  string[]    // → sub_ingredients
  recipe?:          string
  videoUrl?:        string      // → video_url
  thumbnailUrl?:    string      // → thumbnail_url
  cookingTime?:     number      // → cooking_time
  difficulty?:      '쉬움' | '보통' | '어려움'
  rating?:          number
  lastEaten?:       string      // → last_eaten (YYYY-MM-DD)
  createdAt:        string      // → created_at
  updatedAt:        string      // → updated_at
}
```

## 참고

- 현재 앱은 `archives` 단일 JSONB 테이블에 모든 데이터를 저장하는 방식을 사용합니다.
- 위 테이블은 food_menus를 독립 테이블로 분리할 경우의 스키마입니다.
- 분리 시 `archiveStore.ts`의 읽기/쓰기 로직도 함께 변경이 필요합니다.
- `thumbnail_url`이 Data URL(base64)인 경우 데이터 크기가 커질 수 있으므로, 추후 Supabase Storage로 이전을 고려하세요.
