'use client'

import { useState } from 'react'
import type { FoodMenu } from '@/lib/types'
import { useArchiveData } from '@/lib/useArchiveData'

export default function FoodClient() {
  const { data, ready } = useArchiveData()
  const [selectedMenu, setSelectedMenu] = useState<FoodMenu | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  if (!ready) {
    return <div className="text-sm text-sand-600">데이터를 불러오는 중...</div>
  }

  // 랜덤 메뉴 선택 함수
  const selectRandomMenu = () => {
    if (data.foodMenus.length === 0) return

    setIsSpinning(true)
    setSelectedMenu(null)

    // 스피닝 효과를 위한 딜레이
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * data.foodMenus.length)
      setSelectedMenu(data.foodMenus[randomIndex])
      setIsSpinning(false)
    }, 1500)
  }

  // 9x9 만다라트 그리드 생성 (81개 셀)
  const renderMandalartGrid = () => {
    const cells = []
    for (let i = 0; i < 81; i++) {
      const menu = data.foodMenus[i] // 실제 데이터 사용
      const isEmpty = i >= data.foodMenus.length
      
      cells.push(
        <div
          key={i}
          className={`
            aspect-square border border-sand-200 bg-white p-2 text-xs
            flex items-center justify-center text-center
            ${isEmpty ? 'bg-sand-50 text-sand-400' : 'hover:bg-sand-50 cursor-pointer'}
            ${i % 9 === 2 || i % 9 === 5 ? 'border-r-2 border-r-sand-400' : ''}
            ${Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5 ? 'border-b-2 border-b-sand-400' : ''}
          `}
          onClick={() => !isEmpty && setSelectedMenu(menu)}
        >
          {isEmpty ? '빈 메뉴' : menu.name}
        </div>
      )
    }
    return cells
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">음식 메뉴</h2>
          <p className="mt-2 text-sm text-sand-600">
            만다라트 형식으로 메뉴를 확인하고 랜덤으로 선택해보세요.
          </p>
        </div>
        <a className="button" href="/food/new">
          새 메뉴 추가
        </a>
      </header>

      {/* 랜덤 선택 섹션 */}
      <section className="card p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">오늘 뭐 먹지?</h3>
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-32 h-32 rounded-full border-4 border-sand-200 
              flex items-center justify-center text-center p-4
              ${isSpinning ? 'animate-spin border-sand-400' : ''}
              ${selectedMenu ? 'bg-sand-100 border-sand-400' : 'bg-sand-50'}
            `}>
              {isSpinning ? (
                <span className="text-sm text-sand-600">선택 중...</span>
              ) : selectedMenu ? (
                <div>
                  <div className="font-medium text-sand-900">{selectedMenu.name}</div>
                  <div className="text-xs text-sand-600 mt-1">{selectedMenu.category}</div>
                </div>
              ) : (
                <span className="text-sm text-sand-500">?</span>
              )}
            </div>
            <button
              className="button"
              onClick={selectRandomMenu}
              disabled={isSpinning}
            >
              {isSpinning ? '선택 중...' : '랜덤 선택'}
            </button>
          </div>
        </div>
      </section>

      {/* 만다라트 그리드 */}
      <section className="card p-6">
        <h3 className="text-lg font-medium mb-4">메뉴 만다라트</h3>
        <div className="grid grid-cols-9 gap-0 max-w-4xl mx-auto border-2 border-sand-400 rounded-lg overflow-hidden">
          {renderMandalartGrid()}
        </div>
        <p className="text-xs text-sand-500 mt-4 text-center">
          메뉴를 클릭하면 선택됩니다. 빈 칸은 나중에 메뉴를 추가할 수 있어요.
        </p>
      </section>

      {/* 선택된 메뉴 정보 */}
      {selectedMenu && (
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">선택된 메뉴</h3>
            <button
              className="button-outline text-sm"
              onClick={() => setSelectedMenu(null)}
            >
              선택 해제
            </button>
          </div>
          <div className="bg-sand-50 rounded-lg p-4 space-y-4">
            <div className="flex gap-4">
              {selectedMenu.thumbnailUrl && (
                <img
                  src={selectedMenu.thumbnailUrl}
                  alt={selectedMenu.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-sand-900 text-lg">{selectedMenu.name}</h4>
                <p className="text-sm text-sand-600 mt-1">{selectedMenu.category}</p>
                {selectedMenu.description && (
                  <p className="text-sm text-sand-700 mt-2">{selectedMenu.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-sand-500">
                  {selectedMenu.cookingTime && (
                    <span>조리시간: {selectedMenu.cookingTime}분</span>
                  )}
                  {selectedMenu.difficulty && (
                    <span>난이도: {selectedMenu.difficulty}</span>
                  )}
                </div>
              </div>
            </div>
            
            {(selectedMenu.mainIngredients?.length || selectedMenu.subIngredients?.length) && (
              <div className="grid gap-3 md:grid-cols-2">
                {selectedMenu.mainIngredients?.length && (
                  <div>
                    <p className="text-sm font-medium text-sand-800 mb-2">주 재료</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMenu.mainIngredients.map((ingredient, index) => (
                        <span key={index} className="badge bg-sand-200 text-sand-700">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMenu.subIngredients?.length && (
                  <div>
                    <p className="text-sm font-medium text-sand-800 mb-2">부 재료</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMenu.subIngredients.map((ingredient, index) => (
                        <span key={index} className="badge bg-sand-100 text-sand-600">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedMenu.recipe && (
              <div>
                <p className="text-sm font-medium text-sand-800 mb-2">요리법</p>
                <p className="text-sm text-sand-700 leading-relaxed whitespace-pre-line">
                  {selectedMenu.recipe}
                </p>
              </div>
            )}

            {selectedMenu.videoUrl && (
              <div>
                <p className="text-sm font-medium text-sand-800 mb-2">참고 영상</p>
                <a
                  href={selectedMenu.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  영상 보러가기 →
                </a>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}