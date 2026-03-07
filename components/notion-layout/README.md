# Notion风格布局组件

融合**和纸质感**与**Notion功能性**的日本陶艺知识库界面设计。

## 设计理念

**和纸数字图书馆**
- 🎨 和纸纹理背景（温润、有呼吸感）
- 🖋️ 墨色层次（从浓墨到淡墨的渐变）
- 🏺 陶土与青瓷色调点缀
- ✨ 手工感的不完美边框
- 🧘 禅意留白与呼吸感

## 组件架构

```
notion-layout/
├── NotionLayout.tsx      # 主布局容器（侧边栏 + 内容区）
├── NotionSidebar.tsx     # 可折叠侧边栏导航树
├── NotionBreadcrumb.tsx  # 面包屑导航
├── DatabaseView.tsx      # 数据库多视图组件
└── README.md             # 本文档
```

## 快速开始

### 1. 颜色系统

已在 `globals.css` 和 `tailwind.config.ts` 中定义：

```css
--washi-white: #faf8f3       /* 和纸白 */
--washi-cream: #f5f1e8       /* 米色和纸 */
--clay-warm: #e8dcc8         /* 陶土暖色 */
--ink-light: #9b8b7e         /* 淡墨 */
--ink-medium: #6b5d52        /* 中墨 */
--ink-dark: #3d3530          /* 浓墨 */
--clay-terracotta: #d4a574   /* 赤陶土 */
--glaze-celadon: #a8c5b0     /* 青瓷绿 */
```

在 Tailwind 中使用：
```tsx
<div className="bg-washi-white text-ink-dark border-clay-warm">
  ...
</div>
```

### 2. 使用布局

```tsx
// app/(notion)/page.tsx
import NotionLayout from '@/components/notion-layout/NotionLayout'
import NotionBreadcrumb from '@/components/notion-layout/NotionBreadcrumb'

export default function Page() {
  return (
    <NotionLayout>
      <NotionBreadcrumb items={[
        { label: '首页', href: '/' },
        { label: '当前页' }
      ]} />

      <h1 className="font-serif text-4xl text-ink-dark">
        页面标题
      </h1>

      {/* 内容 */}
    </NotionLayout>
  )
}
```

### 3. 侧边栏导航

侧边栏会自动显示，支持：
- ✅ 树状导航结构
- ✅ 展开/折叠子项
- ✅ 当前页高亮
- ✅ 全局搜索框
- ✅ 可折叠整个侧边栏

导航数据在 `NotionSidebar.tsx` 的 `navigationData` 中配置。

### 4. 数据库视图

三种视图模式：表格、画廊、列表

```tsx
import DatabaseView from '@/components/notion-layout/DatabaseView'

const items = [
  {
    id: '1',
    slug: 'bizen-yaki',
    nameZh: '备前烧',
    nameJa: '備前焼',
    category: '六古窑',
    region: '冈山县',
    positioning: '无釉陶的代表',
    images: ['/images/bizen.jpg'],
    keywords: ['窑变', '火襷', '胡麻'],
  },
  // ...
]

<DatabaseView
  items={items}
  title="六古窑"
  titleJa="六古窯"
/>
```

## 核心特性

### 1. 响应式侧边栏
- 宽度：288px (72 / 4 = 18rem)
- 可折叠：点击按钮隐藏/显示
- 平滑过渡：300ms ease-out

### 2. 和纸纹理背景
使用SVG噪声滤镜创建纸张质感：
```tsx
<div style={{
  backgroundImage: `url("data:image/svg+xml,...")`
}} />
```

### 3. 墨迹晕染效果
当前激活项带有渐变墨迹指示器：
```tsx
<div className="absolute left-0 w-0.5 h-4 bg-gradient-to-b from-clay-terracotta to-clay-warm" />
```

### 4. 动画系统
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

画廊和列表视图的卡片使用交错动画延迟。

## 视图类型

### 表格视图 (Table)
- 适合：快速浏览大量数据
- 显示：名称、分类、地区、定位
- 特点：紧凑、信息密度高

### 画廊视图 (Gallery)
- 适合：图片丰富的内容
- 显示：图片 + 标题 + 简介 + 关键词
- 特点：视觉化、易于浏览
- 布局：响应式网格 (1-4列)

### 列表视图 (List)
- 适合：详细信息展示
- 显示：图标 + 完整信息
- 特点：信息完整、易于阅读

## 字体系统

使用衬线字体（明朝体）营造日式典雅：

```css
font-family: 'Noto Serif SC', 'Noto Serif JP', 'Crimson Pro', Georgia, serif;
```

在组件中：
```tsx
<h1 className="font-serif text-4xl">标题</h1>
<p className="font-serif text-sm text-ink-light">正文</p>
```

## 交互细节

### Hover 效果
- 卡片：`hover:shadow-xl hover:border-clay-terracotta/30`
- 链接：`hover:text-clay-terracotta`
- 按钮：`hover:bg-clay-warm/40`

### Transition
统一使用：
```tsx
transition-all duration-300
transition-colors duration-200
```

### Focus 状态
```tsx
focus:outline-none
focus:ring-2
focus:ring-clay-terracotta/30
```

## 集成到现有项目

### 方案A：创建新路由组
```
app/
├── (public)/           # 现有布局
│   ├── page.tsx
│   └── ...
└── (notion)/           # Notion布局
    ├── page.tsx
    ├── pottery/
    └── artists/
```

### 方案B：替换现有布局
1. 备份现有组件
2. 更新 `app/layout.tsx` 使用 `NotionLayout`
3. 逐步迁移页面

### 方案C：动态切换
添加布局切换器，让用户选择偏好。

## 自定义导航

编辑 `NotionSidebar.tsx` 中的 `navigationData`：

```tsx
const navigationData: NavItem[] = [
  {
    id: 'custom',
    label: '自定义分类',
    labelJa: 'カスタム',
    icon: <CustomIcon className="w-4 h-4" />,
    children: [
      {
        id: 'sub1',
        label: '子分类',
        href: '/custom/sub1'
      },
    ],
  },
]
```

## 性能优化

- ✅ 使用 Suspense 异步加载数据
- ✅ 图片懒加载（Next.js Image）
- ✅ CSS动画优先于JS动画
- ✅ 虚拟滚动（如果列表很长）

## 可访问性

- ✅ 语义化HTML
- ✅ ARIA标签
- ✅ 键盘导航支持
- ✅ Focus可见性
- ✅ 颜色对比度符合WCAG AA标准

## 浏览器支持

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 示例页面

- 首页：`app/(notion)/page.tsx`
- 陶器列表：`app/(notion)/pottery/page.tsx`

访问 `http://localhost:3000/` 查看效果（需先配置路由）

## 设计灵感

- 🎴 Notion - 功能性与清晰导航
- 📜 和纸 - 纹理与温润质感
- 🖌️ 水墨画 - 墨色层次与留白
- 🏺 陶瓷 - 自然色调与手工感
- 🍵 茶道 - 侘寂美学与禅意

## 维护与扩展

### 添加新颜色
1. 在 `globals.css` 定义 CSS变量
2. 在 `tailwind.config.ts` 添加颜色映射
3. 在组件中使用

### 添加新视图类型
在 `DatabaseView.tsx` 中添加新的视图组件和切换逻辑。

### 优化动画
在 `globals.css` 中定义新的 `@keyframes` 动画。

---

**Created with** 🤖 Claude Code
**Design Philosophy** 和纸数字图书馆 - Washi Digital Library
