import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: '나만의 라이프 아카이브',
  description: '기록과 사진을 모아두는 개인 아카이브 공간',
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-sand-600">my life archive</p>
          <h1 className="text-2xl font-semibold">나만의 사이트</h1>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-sand-700">
          <a className="hover:text-sand-900" href="/">
            Home
          </a>
          <a className="hover:text-sand-900" href="/journal">
            일기장
          </a>
          <a className="hover:text-sand-900" href="/albums">
            사진첩
          </a>
          <a className="hover:text-sand-900" href="/events">
            특별한 날들
          </a>
          <a className="hover:text-sand-900" href="/food">
            음식 메뉴
          </a>
          <a className="hover:text-sand-900" href="/search">
            찾기
          </a>
          <a className="hover:text-sand-900" href="/settings">
            내 공간
          </a>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-12 border-t border-sand-100 pt-6 text-xs text-sand-500">
        나의 기록을 차분하게 모아두는 개인 공간
      </footer>
    </div>
  )
}
