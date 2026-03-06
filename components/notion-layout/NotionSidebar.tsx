'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
  ChevronDown,
  Home,
  Mountain,
  Flame,
  Palette,
  Coffee,
  BookOpen,
  Users,
  Search,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  labelJa?: string
  icon: React.ReactNode
  href?: string
  children?: NavItem[]
}

const navigationData: NavItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: <Home className="w-4 h-4" />,
    href: '/',
  },
  {
    id: 'kilns',
    label: '产地窑系',
    icon: <Mountain className="w-4 h-4" />,
    children: [
      {
        id: 'rokkoyo',
        label: '六古窑',
        icon: null,
        href: '//pottery?category=六古窑',
        children: [
          { id: 'bizen', label: '备前烧', icon: null, href: '//pottery?category=六古窑&region=备前' },
          { id: 'shigaraki', label: '信乐烧', icon: null, href: '//pottery?category=六古窑&region=信乐' },
          { id: 'tokoname', label: '常滑烧', icon: null, href: '//pottery?category=六古窑&region=常滑' },
          { id: 'seto', label: '濑户烧', icon: null, href: '//pottery?category=六古窑&region=濑户' },
          { id: 'tanba', label: '丹波烧', icon: null, href: '//pottery?category=六古窑&region=丹波' },
          { id: 'echizen', label: '越前烧', icon: null, href: '//pottery?category=六古窑&region=越前' },
        ]
      },
      {
        id: 'modern-kilns',
        label: '现代名窑',
        icon: null,
        href: '//pottery?category=现代名窑',
        children: [
          { id: 'arita', label: '有田·伊万里', icon: null, href: '//pottery?category=现代名窑&region=有田' },
          { id: 'hagi', label: '萩烧', icon: null, href: '//pottery?category=现代名窑&region=萩' },
          { id: 'karatsu', label: '唐津烧', icon: null, href: '//pottery?category=现代名窑&region=唐津' },
          { id: 'kutani', label: '九谷烧', icon: null, href: '//pottery?category=现代名窑&region=九谷' },
          { id: 'mino', label: '美浓烧', icon: null, href: '//pottery?category=现代名窑&region=美浓' },
          { id: 'mashiko', label: '益子烧', icon: null, href: '//pottery?category=现代名窑&region=益子' },
          { id: 'raku', label: '乐烧', icon: null, href: '//pottery?category=现代名窑&region=乐' },
          { id: 'kyo', label: '京烧·清水烧', icon: null, href: '//pottery?category=现代名窑&region=京都' },
        ]
      },
    ],
  },
  {
    id: 'techniques',
    label: '制作技法',
    icon: <Palette className="w-4 h-4" />,
    children: [
      { id: 'forming', label: '成型技法', icon: null, href: '//pottery?category=成型技法' },
      { id: 'decoration', label: '装饰技法', icon: null, href: '//pottery?category=装饰技法' },
      { id: 'glaze', label: '釉药技法', icon: null, href: '//pottery?category=釉药技法' },
      { id: 'firing', label: '烧成技法', icon: null, href: '//pottery?category=烧成技法' },
    ],
  },
  {
    id: 'vessels',
    label: '器物用途',
    icon: <Coffee className="w-4 h-4" />,
    children: [
      { id: 'tea-ware', label: '茶道具', icon: null, href: '//pottery?category=茶道具' },
      { id: 'sake-ware', label: '酒器', icon: null, href: '//pottery?category=酒器' },
      { id: 'tableware', label: '日用器', icon: null, href: '//pottery?category=日用器' },
      { id: 'storage', label: '储藏器', icon: null, href: '//pottery?category=储藏器' },
    ],
  },
  {
    id: 'culture',
    label: '历史文化',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { id: 'aesthetics', label: '美学思想', icon: null, href: '//pottery?category=美学思想' },
      { id: 'history', label: '文化史', icon: null, href: '//pottery?category=文化史' },
      { id: 'tea-culture', label: '茶道文化', icon: null, href: '//pottery?category=茶道文化' },
      { id: 'mingei', label: '民艺运动', icon: null, href: '//pottery?category=民艺运动' },
    ],
  },
  {
    id: 'basics',
    label: '基础知识',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { id: 'terms', label: '术语解释', icon: null, href: '//pottery?category=术语解释' },
      { id: 'appreciation', label: '鉴赏体系', icon: null, href: '//pottery?category=鉴赏体系' },
      { id: 'certification', label: '文化认定', icon: null, href: '//pottery?category=文化认定' },
    ],
  },
  {
    id: 'artists',
    label: '陶艺作家',
    icon: <Users className="w-4 h-4" />,
    href: '//artists',
  },
]

export default function NotionSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(['kilns', 'rokkoyo', 'modern-kilns', 'techniques', 'vessels', 'culture', 'basics'])
  )
  const pathname = usePathname()

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isActive = item.href === pathname

    return (
      <div className="select-none">
        <div
          className={`
            group relative flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer
            transition-all duration-200
            ${isActive ? 'bg-clay-warm/30 text-ink-dark shadow-sm' : 'text-ink-medium hover:bg-washi-cream'}
            ${depth > 0 ? 'ml-6' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id)
            }
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center text-ink-light">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          )}

          {/* Item Icon */}
          {item.icon && (
            <div className={`${hasChildren ? '' : 'ml-0'} text-ink-medium group-hover:text-ink-dark transition-colors`}>
              {item.icon}
            </div>
          )}

          {/* Item Label */}
          {item.href ? (
            <Link
              href={item.href}
              className="flex-1 flex items-baseline gap-2 font-serif"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">{item.label}</span>
              {item.labelJa && (
                <span className="text-xs text-ink-light">{item.labelJa}</span>
              )}
            </Link>
          ) : (
            <div className="flex-1 flex items-baseline gap-2 font-serif">
              <span className="text-sm">{item.label}</span>
              {item.labelJa && (
                <span className="text-xs text-ink-light">{item.labelJa}</span>
              )}
            </div>
          )}

          {/* Active Indicator - 墨迹效果 */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gradient-to-b from-clay-terracotta to-clay-warm rounded-full" />
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <NavItemComponent key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-washi-white border-r border-ink-light/10
          transition-all duration-300 ease-out z-40
          ${collapsed ? 'w-0 -translate-x-full opacity-0' : 'w-72 translate-x-0 opacity-100'}
        `}
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(250, 248, 243, 0.95) 0%, rgba(245, 241, 232, 0.98) 100%),
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
          `,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 pb-4 border-b border-ink-light/10">
            <Link href="/" className="block group">
              <h1 className="font-serif text-xl text-ink-dark mb-1 tracking-wide">
                陶芸知識庫
              </h1>
              <p className="text-xs text-ink-light font-serif tracking-wider">
                日本陶瓷文化典藏
              </p>
            </Link>

            {/* Search Box */}
            <div className="mt-4 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="text"
                placeholder="搜索陶器、作家、技法..."
                className="
                  w-full pl-10 pr-4 py-2 bg-white/60 border border-ink-light/20 rounded-lg
                  text-sm font-serif text-ink-dark placeholder:text-ink-light/60
                  focus:outline-none focus:ring-2 focus:ring-clay-terracotta/30 focus:border-clay-terracotta/50
                  transition-all duration-200
                "
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-ink-light/20 scrollbar-track-transparent">
            {navigationData.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-ink-light/10">
            <div className="text-xs text-ink-light font-serif text-center space-y-1">
              <p>总计 127 条目</p>
              <p className="text-ink-light/60">持续更新中</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          fixed top-6 z-50 p-2 bg-washi-white border border-ink-light/20 rounded-lg
          shadow-lg hover:shadow-xl transition-all duration-300
          text-ink-medium hover:text-ink-dark
          ${collapsed ? 'left-6' : 'left-[19rem]'}
        `}
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        {collapsed ? (
          <PanelLeft className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>
    </>
  )
}
