import { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '陶芸知識庫 - 日本陶瓷文化典藏',
  description: '探索日本陶瓷文化的完整典藏 - 六古窑、现代名窑、技法、器物、历史文化',
}

export default function NotionRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
