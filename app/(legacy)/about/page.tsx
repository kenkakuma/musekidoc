import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Target,
  Lightbulb,
  Heart,
  Github,
  Mail,
  ExternalLink
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* 头部 */}
      <div className="bg-white border-b border-amber-200">
        <div className="container mx-auto px-4 py-8">
          <nav className="text-sm text-slate-600 mb-4 max-w-4xl mx-auto">
            <Link href="/" className="hover:text-amber-600">首页</Link>
            <span className="mx-2">/</span>
            <span>关于项目</span>
          </nav>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              关于本项目
            </h1>
            <p className="text-xl text-slate-600">
              致力于打造全面的日本陶艺知识库
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 项目简介 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="w-6 h-6 text-amber-600" />
                项目简介
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed">
                日本陶艺知识库（Japan Pottery Knowledge Base）是一个综合性的数字化平台，
                旨在系统化地收集、整理和展示日本陶器、瓷器以及陶艺家的相关信息。
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                本项目通过结构化的数据管理和友好的用户界面，帮助陶艺爱好者、收藏家、
                研究者以及普通公众更好地了解日本陶艺的历史传承、技艺特点和艺术价值。
              </p>
            </CardContent>
          </Card>

          {/* 项目目标 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-orange-600" />
                项目目标
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">📚 知识普及</h3>
                  <p className="text-sm text-slate-700">
                    为公众提供准确、全面的日本陶艺知识，促进文化传播与交流
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">🎨 艺术推广</h3>
                  <p className="text-sm text-slate-700">
                    展示传统与当代陶艺家的作品，推动日本陶艺文化的传承与发展
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">🔍 研究支持</h3>
                  <p className="text-sm text-slate-700">
                    为学者和研究者提供结构化的数据资源，支持学术研究工作
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">💼 商业对接</h3>
                  <p className="text-sm text-slate-700">
                    为收藏家和商家提供权威的陶艺信息，促进市场健康发展
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 功能特色 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lightbulb className="w-6 h-6 text-amber-600" />
                功能特色
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge className="mt-1 bg-amber-600">1</Badge>
                  <div>
                    <h4 className="font-semibold text-slate-900">多语言支持</h4>
                    <p className="text-sm text-slate-600">支持中文、日文、英文三语信息展示</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1 bg-orange-600">2</Badge>
                  <div>
                    <h4 className="font-semibold text-slate-900">智能搜索</h4>
                    <p className="text-sm text-slate-600">强大的全文搜索和智能建议功能</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1 bg-red-600">3</Badge>
                  <div>
                    <h4 className="font-semibold text-slate-900">分类浏览</h4>
                    <p className="text-sm text-slate-600">按产地、类型、作家等多维度分类浏览</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1 bg-amber-600">4</Badge>
                  <div>
                    <h4 className="font-semibold text-slate-900">图文并茂</h4>
                    <p className="text-sm text-slate-600">高质量图片展示，支持图片库浏览</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge className="mt-1 bg-orange-600">5</Badge>
                  <div>
                    <h4 className="font-semibold text-slate-900">持续更新</h4>
                    <p className="text-sm text-slate-600">定期添加新条目，保持信息的时效性</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 技术栈 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">技术实现</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Badge variant="secondary" className="justify-center py-2">
                  Next.js 14
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  TypeScript
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  PostgreSQL
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  Prisma ORM
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  Tailwind CSS
                </Badge>
                <Badge variant="secondary" className="justify-center py-2">
                  Shadcn/ui
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 联系方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="w-6 h-6 text-red-600" />
                联系我们
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-700">
                  如果您有任何建议、意见或想要贡献内容，欢迎通过以下方式联系我们：
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://github.com/kenkakuma/musekidoc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub 仓库</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:contact@pottery-kb.com"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="w-5 h-5" />
                    <span>电子邮件</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 返回首页按钮 */}
          <div className="text-center pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
