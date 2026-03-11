'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { FoodCategory } from '@/lib/types'
import { uploadImagesToBlob } from '@/lib/blob'
import { useArchiveData } from '@/lib/useArchiveData'

const categories: FoodCategory[] = ['한식', '양식', '중식', '일식', '아시안', '브런치', '패스트푸드', '간편식', '기타']

type Props = {
  id: string
}

export default function FoodDetailClient({ id }: Props) {
  const router = useRouter()
  const { data, ready, update } = useArchiveData()
  const menu = data.foodMenus.find((item) => item.id === id)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<FoodCategory>('한식')
  const [description, setDescription] = useState('')
  const [mainIngredients, setMainIngredients] = useState('')
  const [subIngredients, setSubIngredients] = useState('')
  const [recipe, setRecipe] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [cookingTime, setCookingTime] = useState('')
  const [difficulty, setDifficulty] = useState<'쉬움' | '보통' | '어려움'>('쉬움')
  const [isUploading, setIsUploading] = useState(false)

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  if (!menu) {
    return (
      <div className="card p-6 text-sm text-sand-600">
        해당 메뉴를 찾을 수 없어요.
      </div>
    )
  }

  const handleStartEdit = () => {
    setName(menu.name)
    setCategory(menu.category)
    setDescription(menu.description ?? '')
    setMainIngredients(menu.mainIngredients?.join(', ') ?? '')
    setSubIngredients(menu.subIngredients?.join(', ') ?? '')
    setRecipe(menu.recipe ?? '')
    setVideoUrl(menu.videoUrl ?? '')
    setThumbnailUrl(menu.thumbnailUrl ?? '')
    setCookingTime(menu.cookingTime ? String(menu.cookingTime) : '')
    setDifficulty(menu.difficulty ?? '쉬움')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleThumbnailChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const uploaded = await uploadImagesToBlob(files, 1, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        mimeType: 'image/webp',
      })      
      if (uploaded.length > 0) setThumbnailUrl(uploaded[0])
    } catch {
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('메뉴 이름을 입력해주세요.')
      return
    }
    update((prev) => ({
      ...prev,
      foodMenus: prev.foodMenus.map((item) =>
        item.id === menu.id
          ? {
              ...item,
              name: name.trim(),
              category,
              description: description.trim() || undefined,
              mainIngredients: mainIngredients.split(',').map((v) => v.trim()).filter(Boolean),
              subIngredients: subIngredients.split(',').map((v) => v.trim()).filter(Boolean),
              recipe: recipe.trim() || undefined,
              videoUrl: videoUrl.trim() || undefined,
              thumbnailUrl: thumbnailUrl || undefined,
              cookingTime: cookingTime ? parseInt(cookingTime, 10) : undefined,
              difficulty,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }))
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!window.confirm('이 메뉴를 삭제할까요?')) return
    update((prev) => ({
      ...prev,
      foodMenus: prev.foodMenus.filter((item) => item.id !== menu.id),
    }))
    router.push('/food')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <a className="text-sm text-sand-600 hover:text-sand-900" href="/food">
            ← 음식 메뉴
          </a>
          <h2 className="mt-1 text-2xl font-semibold">{menu.name}</h2>
          <p className="mt-1 text-sm text-sand-600">{menu.category}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button className="button-outline" type="button" onClick={handleCancelEdit}>
                취소
              </button>
              <button className="button" type="button" onClick={handleSave}>
                저장
              </button>
            </>
          ) : (
            <>
              <button className="button-outline" type="button" onClick={handleStartEdit}>
                수정
              </button>
              <button
                className="button-outline text-rose-500 hover:text-rose-600"
                type="button"
                onClick={handleDelete}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </header>

      {isEditing ? (
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">메뉴 이름 *</p>
              <input
                className="input mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <p className="label">분류</p>
              <select
                className="input mt-2"
                value={category}
                onChange={(event) => setCategory(event.target.value as FoodCategory)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="label">설명</p>
            <input
              className="input mt-2"
              placeholder="예: 매콤하고 시원한 김치찌개"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">주 재료</p>
              <input
                className="input mt-2"
                placeholder="쉼표로 구분해 입력"
                value={mainIngredients}
                onChange={(event) => setMainIngredients(event.target.value)}
              />
            </div>
            <div>
              <p className="label">부 재료</p>
              <input
                className="input mt-2"
                placeholder="쉼표로 구분해 입력"
                value={subIngredients}
                onChange={(event) => setSubIngredients(event.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="label">요리법</p>
            <textarea
              className="textarea mt-2 min-h-[120px]"
              value={recipe}
              onChange={(event) => setRecipe(event.target.value)}
            />
          </div>

          <div>
            <p className="label">참고 영상 경로</p>
            <input
              className="input mt-2"
              placeholder="YouTube URL 또는 영상 링크"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
            />
          </div>

          <div>
            <p className="label">섬네일 이미지</p>
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-6">
                <span className="text-sm text-sand-500">
                  {isUploading ? '업로드 중...' : '메뉴 사진을 변경할 수 있어요.'}
                </span>
                <label className={`button-outline ml-auto ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  {isUploading ? '업로드 중...' : '파일 선택'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {thumbnailUrl && (
                <div className="relative">
                  <img
                    src={thumbnailUrl}
                    alt="섬네일 미리보기"
                    className="h-32 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-white p-1 text-xs text-rose-500 shadow-md hover:text-rose-600"
                    onClick={() => setThumbnailUrl('')}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">조리 시간 (분)</p>
              <input
                className="input mt-2"
                type="number"
                placeholder="예: 30"
                value={cookingTime}
                onChange={(event) => setCookingTime(event.target.value)}
              />
            </div>
            <div>
              <p className="label">난이도</p>
              <select
                className="input mt-2"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as '쉬움' | '보통' | '어려움')}
              >
                <option value="쉬움">쉬움</option>
                <option value="보통">보통</option>
                <option value="어려움">어려움</option>
              </select>
            </div>
          </div>
        </section>
      ) : (
        <section className="card space-y-6 p-6 text-sm text-sand-700">
          {menu.thumbnailUrl && (
            <img
              src={menu.thumbnailUrl}
              alt={menu.name}
              className="h-48 w-full rounded-xl object-cover"
            />
          )}

          {menu.description && (
            <p className="text-sand-700">{menu.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-sand-500">
            {menu.cookingTime && <span className="badge">⏱ {menu.cookingTime}분</span>}
            {menu.difficulty && <span className="badge">난이도: {menu.difficulty}</span>}
            {menu.lastEaten && <span className="badge">마지막: {menu.lastEaten}</span>}
          </div>

          {(menu.mainIngredients?.length || menu.subIngredients?.length) ? (
            <div className="grid gap-4 md:grid-cols-2">
              {menu.mainIngredients?.length ? (
                <div>
                  <p className="label mb-2">주 재료</p>
                  <div className="flex flex-wrap gap-1">
                    {menu.mainIngredients.map((ingredient, index) => (
                      <span key={index} className="badge bg-sand-200 text-sand-700">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {menu.subIngredients?.length ? (
                <div>
                  <p className="label mb-2">부 재료</p>
                  <div className="flex flex-wrap gap-1">
                    {menu.subIngredients.map((ingredient, index) => (
                      <span key={index} className="badge bg-sand-100 text-sand-600">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {menu.recipe && (
            <div>
              <p className="label mb-2">요리법</p>
              <p className="leading-relaxed whitespace-pre-line text-sand-700">{menu.recipe}</p>
            </div>
          )}

          {menu.videoUrl && (
            <div>
              <p className="label mb-2">참고 영상</p>
              <a
                href={menu.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                영상 보러가기 →
              </a>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
