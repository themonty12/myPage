'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { FoodCategory } from '@/lib/types'
import { readFilesAsDataUrls } from '@/lib/files'
import { createId } from '@/lib/storage'
import { useArchiveData } from '@/lib/useArchiveData'

const categories: FoodCategory[] = ['한식', '양식', '중식', '일식', '아시안', '치킨', '피자', '패스트푸드', '간편식', '기타']

export default function FoodFormClient() {
  const router = useRouter()
  const { update } = useArchiveData()

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

  const handleThumbnailChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const uploaded = await readFilesAsDataUrls([files[0]], 1, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        mimeType: 'image/webp',
      })
      if (uploaded.length > 0) {
        setThumbnailUrl(uploaded[0])
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('메뉴 이름을 입력해주세요.')
      return
    }

    const id = createId('food')
    const parsedCookingTime = cookingTime ? parseInt(cookingTime, 10) : undefined

    update((prev) => ({
      ...prev,
      foodMenus: [
        {
          id,
          name: name.trim(),
          category,
          description: description.trim() || undefined,
          mainIngredients: mainIngredients
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          subIngredients: subIngredients
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          recipe: recipe.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          cookingTime: parsedCookingTime,
          difficulty,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev.foodMenus,
      ],
    }))

    router.push('/food')
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">새 메뉴 추가</h2>
        <p className="mt-2 text-sm text-sand-600">
          새로운 음식 메뉴를 추가해보세요.
        </p>
      </header>

      <section className="card space-y-6 p-6 text-sm text-sand-700">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="label">메뉴 이름 *</p>
            <input
              className="input mt-2"
              placeholder="예: 김치찌개"
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
                <option key={item} value={item}>
                  {item}
                </option>
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
              placeholder="쉼표로 구분해 입력 (예: 김치, 돼지고기)"
              value={mainIngredients}
              onChange={(event) => setMainIngredients(event.target.value)}
            />
          </div>
          <div>
            <p className="label">부 재료</p>
            <input
              className="input mt-2"
              placeholder="쉼표로 구분해 입력 (예: 두부, 대파, 양파)"
              value={subIngredients}
              onChange={(event) => setSubIngredients(event.target.value)}
            />
          </div>
        </div>

        <div>
          <p className="label">요리법</p>
          <textarea
            className="textarea mt-2 min-h-[120px]"
            placeholder="요리 과정을 자세히 적어주세요..."
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
                {isUploading ? '업로드 중...' : '메뉴 사진을 추가해보세요.'}
              </span>
              <label className="button-outline ml-auto cursor-pointer">
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

        <div className="flex flex-wrap gap-3">
          <button 
            className="button-outline" 
            type="button"
            onClick={() => router.push('/food')}
          >
            취소
          </button>
          <button className="button" type="button" onClick={handleSubmit}>
            메뉴 추가하기
          </button>
        </div>
      </section>
    </div>
  )
}