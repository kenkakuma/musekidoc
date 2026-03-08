# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v0.3.1] - 2026-03-08

### 🔍 Romaji 来源补全 + 数据质量修正

数据质量专项迭代：80 位艺术家罗马字来源批量补全、错误 Wikipedia 来源修正、全库英文字段汉化。

### Added
- **Romaji 来源批量补全**（batch-001 ～ batch-009）
  - 覆盖全部 80 位艺术家，每批 20 位
  - 28 位（35%）成功补全 Wikipedia ja 或官方页来源
  - 新增 `data/artist-romaji-source-batches/` 目录（9 个批次结果 + README）
  - 新增 `data/artist-romaji-source-search-plan.json`（80 位搜索计划与状态追踪）
  - 新增 `data/artist-romaji-source-batches/rerun-focus-list-2026-03-08.json`（补跑汇总）
- **罗马字批次脚本**
  - `scripts/enrich-artists-romaji-batch20.js`（主批次脚本，每次处理 20 位）
  - `scripts/enrich-artists-romaji-source-first.js`（首轮来源发现脚本）

### Fixed
- **错误 Wikipedia 来源**（同名异人）
  - `yamada-yoji`：删除指向日本电影导演山田洋次的 Wikipedia 链接
  - `yoshikawa-yuko`：删除指向古典小提琴家吉川裕子的 Wikipedia 链接
  - 两者 `patchNotes` 已标注修正原因

### Changed
- **全库英文字段汉化**（116 处）
  - `studioName`（62 条）：`Studio → 工作室`、`Kiln → 窑`、`Ceramics/Ceramique → 陶瓷工作室`；特殊窑名直译（楠窑、雪窑、濱田窑、快山窑、茶碗窑、梵窑、井上萬二窑）
  - `locationArea/City`（4 条）：London → 伦敦，Paris → 巴黎
  - `exhibitions.title/venue`（24 条）：LOEWE工艺奖展览、伦敦陶艺展、伦敦／东京／洛杉矶等
  - `awards`（12 条）：V&A/LACMA 全称、Maison & Objet 新锐才华奖等
  - `sources.title`（12 条）：现代陶磁、藏前画廊等
  - 罗马字人名、品牌固有名称、陶艺罗马字术语（tebineri、nobori-gama 等）均保留原文

### Data
- `artists-detail-supplemented.json`：80 位艺术家，28 位补全 Wikipedia 来源，116 处英文翻译，4 处字段回填（websiteUrl、instagramHandle）

---

## [v0.3.0] - 2026-03-07

### 🎉 Instagram Artist Discovery Complete

Major release focusing on Instagram artist discovery, data quality improvements, and frontend optimization.

### Added
- **17 New Instagram Artists** (93 → 110 total artists)
  - Abe Haruya (阿部春弥) - 320,000 followers
  - Iwamura En (岩村远) - 133,000 followers
  - Koga Takahiro (古贺崇洋) - 82,000 followers
  - Kobayashi Tetsuya (小林徹也) - 67,000 followers
  - Sakaguchi Chika (坂口知香) - 62,000 followers 👩
  - Yamamoto Masahiko (山本雅彦) - 61,000 followers
  - Hosono Hitomi (细野仁美) - 51,000 followers 👩
  - Otani Tetsuya (大谷哲也) - 44,000 followers
  - Suzuki Takashi (铃木隆) - 39,000 followers
  - Yamada Yukico (山田由起子) - 31,000 followers 👩
  - Anayama Daisuke (穴山大辅) - 26,000 followers
  - Shinohara Nozomi (篠原希) - 24,000 followers
  - Abe Shintaro (阿部慎太朗) - 21,000 followers
  - Yashiro Narumi (矢代成美) - 18,000 followers 👩
  - Shimura Kazuaki (志村和晃) - 13,000 followers
  - Teramura Kosuke (寺村光辅) - 12,000 followers
  - Uchida Midori (内田翠) - 11,000 followers 👩

- **Instagram Discovery Tools**
  - `scripts/review-instagram-discovery.js` - Automated quality review script
  - `scripts/import-instagram-discovery-tiered.js` - Tiered import system (Tier 1-4)
  - `scripts/verify-imported-artists.js` - Import verification tool
  - `scripts/check-remaining-artists.js` - Check unimported artists
  - `scripts/import-remaining-discovery-artists.js` - Batch import remaining artists

- **Documentation**
  - `INSTAGRAM_DISCOVERY_FINAL_ANALYSIS.md` - Comprehensive review analysis
  - `INSTAGRAM_DISCOVERY_PUBLICATION_READY.md` - Publication readiness summary
  - `INSTAGRAM_DISCOVERY_REVIEW_REPORT.md` - Automated review findings
  - `PROJECT_STATUS.md` - Current project status and progress
  - `CHANGELOG.md` - This changelog

- **Data Files**
  - `data/discovered-instagram-artists-master.json` - 42 discovered artists
  - `data/discovered-instagram-artists-publish-ready.json` - Tier 1+2 artists
  - `data/discovered-instagram-artists-needs-review.json` - Tier 3+4 artists

### Changed
- **Database Growth**
  - Published artists: 93 → 110 (+18.3%)
  - Instagram artists: 35 → 52 (+48.6%)
  - Female artists: 2 → 5 (+150%)
  - Total sources: ~450 → ~600 (+33%)

- **Regional Coverage**
  - Mashiko region: +2 artists
  - Shigaraki region: +3 artists
  - Kyoto region: +2 artists
  - Seto/Tajimi region: +3 artists

### Fixed
- **Instagram Image Loading** (#issue-001)
  - Configured Instagram CDN domains in `next.config.js`
  - Added `**.cdninstagram.com` to image remotePatterns
  - Fixed 500 errors on Instagram artist pages
  - All 17 new artist pages now load correctly

- **Image Configuration**
  - Updated `next.config.js` with proper image domain patterns
  - Instagram profile pictures now display correctly
  - No more Next.js image optimization errors

### Quality Metrics
- ✅ 100% artist review completion (42/42 artists)
- ✅ 0 duplicate artists found
- ✅ 0 blocking issues
- ✅ 100% import success rate
- ✅ 100% quality compliance (10K+ followers, 3+ sources, 150+ char bio)

### Technical
- **Commits**: 4 commits
  - 4092ef1 - feat: review and import Instagram discovery Tier 1 artists
  - 7342f72 - feat: import Instagram discovery Tier 2 artists
  - 05da380 - feat: complete Instagram discovery import
  - 01e9510 - fix: configure Instagram CDN domains for next/image
- **Files Changed**: 15+ files
- **Lines Added**: ~4,800 lines
- **Tests**: Comprehensive frontend validation

---

## [v0.2.1] - 2026-03-05

### Fixed
- Route 404 errors for pottery entries
- Removed `/notion/` prefix from all pottery links
- Updated `app/artists/[slug]/page.tsx` route references
- Updated `components/notion-layout/DatabaseView.tsx` with correct routes

### Changed
- Version bump from v0.2.0 to v0.2.1

---

## [v0.2.0] - 2026-03-03

### Added
- **Notion-style UI Layout**
  - Collapsible sidebar navigation
  - Database views (Table, Gallery, List)
  - Breadcrumb navigation
  - Japanese aesthetic design (wabi-sabi inspired)

- **Data Import Completion**
  - 80 artists imported with complete information
  - 15 glaze techniques imported
  - Multi-language name support (Chinese, Japanese, English, Kana)
  - Source tracking system

### Changed
- Major UI redesign to Notion-style layout
- Color scheme to Japanese aesthetic (beige, warm gray)
- Typography to serif fonts (Noto Serif)
- Navigation structure with hierarchical categories

### Technical
- Next.js 14 App Router implementation
- Tailwind CSS custom design system
- Prisma schema updates for multi-language support
- PostgreSQL database optimization

---

## [v0.1.0] - 2026-02-20

### Added
- Initial project setup
- Database schema design
- Basic Next.js application structure
- Prisma ORM configuration
- PostgreSQL database connection

### Features
- Basic pottery entry model
- Artist model
- Category hierarchy
- User authentication model

---

## Future Releases

### [v0.4.0] - Planned
- Search functionality
- Filter and sort improvements
- Mobile optimization
- Performance enhancements

### [v0.5.0] - Planned
- User authentication
- Admin panel
- Content management system
- Batch operations

### [v1.0.0] - Planned
- E-commerce integration
- User collections
- Social features
- Full internationalization

---

**Legend**:
- 🎉 Major feature
- ✨ New feature
- 🐛 Bug fix
- 📝 Documentation
- 🔧 Configuration
- ⚡ Performance
- 👩 Female artist
