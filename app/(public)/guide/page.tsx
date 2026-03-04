import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Sparkles,
  MapPin,
  Palette,
  ChevronRight,
  Flame,
  Droplets,
  Users,
  ArrowRight
} from 'lucide-react'

export const metadata = {
  title: '日本陶艺导览 - 入门指南',
  description: '了解日本陶艺的基础知识、历史发展、主要分类和鉴赏要点',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen washi-texture">
      {/* Breadcrumb */}
      <nav className="container-zen pb-0">
        <div className="breadcrumb-zen animate-ink-wash">
          <Link href="/" className="brush-underline">首页</Link>
          <ChevronRight className="w-3 h-3 breadcrumb-zen-separator" />
          <span className="text-foreground">陶艺导览</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-zen pt-8">
        <div className="max-w-4xl stagger-reveal">
          <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-2 rounded-full">
            <BookOpen className="w-4 h-4 mr-2" />
            入门导览
          </Badge>

          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-balance leading-tight">
            日本陶艺导览
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            探索日本陶艺的千年历史，从基础概念到鉴赏要点，开启您的陶艺之旅
          </p>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Main Content */}
      <section className="container-zen">
        <div className="max-w-5xl mx-auto space-zen-y">
          {/* 基础概念 */}
          <div className="card-zen animate-ink-wash">
            <h2 className="text-3xl font-serif font-medium mb-6 seasonal-accent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              基础概念
            </h2>

            <div className="space-y-6 prose prose-lg max-w-none">
              <div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-3">陶器与瓷器的区别</h3>
                <p className="text-foreground/90 leading-relaxed">
                  日本的陶瓷艺术主要分为<strong>陶器（陶磁器）</strong>和<strong>瓷器（磁器）</strong>两大类。
                  陶器烧制温度较低（约800-1200℃），质地较为疏松，吸水性强，多呈现自然的土色和质感。
                  瓷器则需要在1200℃以上的高温烧制，质地坚硬致密，不吸水，釉面光滑细腻。
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 not-prose">
                <div className="card-zen bg-sand/10 p-6">
                  <h4 className="font-serif font-medium text-lg mb-3 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent" />
                    陶器特点
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>烧制温度：800-1200℃</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>质地疏松，有吸水性</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>釉色自然，土味浓厚</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>代表：备前烧、信乐烧、益子烧</span>
                    </li>
                  </ul>
                </div>

                <div className="card-zen bg-ivory/20 p-6">
                  <h4 className="font-serif font-medium text-lg mb-3 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-accent" />
                    瓷器特点
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>烧制温度：1200℃以上</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>质地坚硬，不吸水</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>釉面光滑，色泽明亮</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">◆</span>
                      <span>代表：有田烧、九谷烧、清水烧</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 主要产地 */}
          <div className="card-zen bg-sand/5 animate-ink-wash" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-serif font-medium mb-6 seasonal-accent flex items-center gap-3">
              <MapPin className="w-8 h-8 text-accent" />
              六大古窑
            </h2>

            <p className="text-foreground/90 leading-relaxed mb-8">
              日本陶艺史上最重要的六个古老窑场，被称为"日本六古窑"，
              它们自中世纪以来就延续至今，代表了日本传统陶艺的精髓。
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: '濑户烧', region: '爱知县', feature: '釉药技术精湛，被称为"瀬戸物"' },
                { name: '常滑烧', region: '爱知县', feature: '红褐色陶土，朱泥急须闻名' },
                { name: '越前烧', region: '福井县', feature: '粗犷豪放，自然釉美' },
                { name: '信乐烧', region: '滋贺县', feature: '火色变化丰富，狸猫摆件著名' },
                { name: '丹波烧', region: '兵庫县', feature: '古朴厚重，灰釉自然流动' },
                { name: '备前烧', region: '冈山县', feature: '无釉烧制，窑变纹理独特' },
              ].map((kiln, index) => (
                <div key={kiln.name} className="card-zen bg-card hover:bg-accent/5 transition-all duration-300">
                  <div className="p-5">
                    <h3 className="font-serif font-medium text-xl mb-2 text-accent">{kiln.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3.5 h-3.5 inline mr-1" />
                      {kiln.region}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{kiln.feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 鉴赏要点 */}
          <div className="card-zen animate-ink-wash" style={{ animationDelay: '200ms' }}>
            <h2 className="text-3xl font-serif font-medium mb-6 seasonal-accent flex items-center gap-3">
              <Palette className="w-8 h-8 text-accent" />
              鉴赏要点
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-medium mb-4">观察维度</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: '器型',
                      desc: '观察器物的整体造型是否协调匀称，线条是否流畅自然，是否符合使用功能。'
                    },
                    {
                      title: '釉色',
                      desc: '欣赏釉面的色泽、光泽、流动感，以及窑变产生的自然肌理和色彩变化。'
                    },
                    {
                      title: '质感',
                      desc: '触摸感受陶器的质地，细腻或粗犷，光滑或凹凸，都是不同美感的体现。'
                    },
                    {
                      title: '装饰',
                      desc: '品味纹样装饰的意境，绘画技法，以及与器型的搭配是否和谐统一。'
                    }
                  ].map((point) => (
                    <div key={point.title} className="p-5 rounded-lg bg-accent/5 border border-accent/10">
                      <h4 className="font-medium text-lg mb-2 text-accent">{point.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-zen bg-ivory/30 border-accent/20">
                <h3 className="text-xl font-serif font-medium mb-4">侘寂美学</h3>
                <p className="text-foreground/90 leading-relaxed">
                  日本陶艺深受"侘寂（Wabi-Sabi）"美学影响，追求<strong>朴素、自然、不完美</strong>之美。
                  器物表面的裂纹、色差、不对称等"缺陷"，恰恰是时间流逝和自然造化的印记，
                  体现了一种接受无常、珍惜当下的生活哲学。
                </p>
              </div>
            </div>
          </div>

          {/* 快速入口 */}
          <div className="card-zen bg-gradient-to-br from-sand/20 via-ivory/30 to-sand/20 border-accent/20 animate-ink-wash" style={{ animationDelay: '300ms' }}>
            <h2 className="text-2xl font-serif font-medium mb-8 text-center">深入探索</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/pottery" className="btn-zen flex-col h-auto py-8 text-center">
                <BookOpen className="w-12 h-12 text-accent mb-4 mx-auto" />
                <span className="font-serif font-medium text-lg mb-2">浏览条目</span>
                <span className="text-sm text-muted-foreground">探索所有陶器作品</span>
                <ArrowRight className="w-5 h-5 mt-4 mx-auto" />
              </Link>

              <Link href="/categories" className="btn-zen flex-col h-auto py-8 text-center">
                <MapPin className="w-12 h-12 text-accent mb-4 mx-auto" />
                <span className="font-serif font-medium text-lg mb-2">分类目录</span>
                <span className="text-sm text-muted-foreground">按产地和类型浏览</span>
                <ArrowRight className="w-5 h-5 mt-4 mx-auto" />
              </Link>

              <Link href="/artists" className="btn-zen flex-col h-auto py-8 text-center">
                <Users className="w-12 h-12 text-accent mb-4 mx-auto" />
                <span className="font-serif font-medium text-lg mb-2">陶艺作家</span>
                <span className="text-sm text-muted-foreground">认识日本陶艺大师</span>
                <ArrowRight className="w-5 h-5 mt-4 mx-auto" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
