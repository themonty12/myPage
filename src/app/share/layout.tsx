import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '청첩장',
  description: '소중한 분들을 초대합니다.',
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
