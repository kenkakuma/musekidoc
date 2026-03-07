# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
