# Japan Pottery Knowledge Base (日本陶艺知识库)

> A comprehensive knowledge base for Japanese pottery, ceramics, and artists, built with Next.js 14, TypeScript, and PostgreSQL.

**Version**: 1.0.0 (MVP)
**Status**: Phase 1 Complete ✅
**Progress**: 83% (15/18 core tasks completed)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## 🎯 Overview

This project aims to build a scalable knowledge base for Japanese pottery (陶器) and ceramics, supporting 500-2000 entries with:

- Public browsing interface with search and filtering
- Admin panel for content management
- AI-friendly content creation workflows
- Bulk import/export functionality
- Multi-language support (Chinese, Japanese, English)
- Future integration with e-commerce platforms

---

## ✨ Features

### Phase 1: MVP (Current) ✅

#### **Public Frontend**
- 🏺 **Pottery Entry Listing** - Grid view with search, pagination, and filtering
- 📄 **Detailed Entry Pages** - Complete information with image galleries
- 👨‍🎨 **Artist Pages** - Artist profiles with their works
- 🔍 **Full-Text Search** - MiniSearch powered, supports CN/JP/EN mixed queries
- 📱 **Responsive Design** - Mobile-friendly layout

#### **Admin Backend**
- 🔐 **Simple Authentication** - Password-based login system
- ✏️ **Entry Editor** - Rich form with AI-friendly field descriptions
- 📥 **Bulk Import** - JSON batch import for rapid content filling
- 📤 **Data Export** - Export all data as JSON
- 🖼️ **Image Upload** - Multi-image upload with automatic optimization (WebP)
- 📊 **Dashboard** - Statistics and quick actions

#### **API**
- 🔌 **RESTful API** - Complete CRUD for entries and artists
- 🔎 **Search API** - Full-text search with autocomplete suggestions
- 📁 **Import/Export API** - Bulk operations
- 🖼️ **Upload API** - Image handling with Sharp optimization

---

## 🛠️ Tech Stack

### **Core**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7

### **Frontend**
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Noto Sans (CN/JP)

### **Backend**
- **Validation**: Zod
- **Image Processing**: Sharp
- **Search**: MiniSearch
- **Authentication**: Simple token-based (Phase 1)

### **Development**
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Git**: GitHub

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 9+
- PostgreSQL 16
- Docker (recommended for PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd musekidoc
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup PostgreSQL**

   **Option A: Docker (Recommended)**
   ```bash
   docker run --name postgres-pottery \
     -e POSTGRES_PASSWORD=postgres \
     -p 5433:5432 \
     -d postgres:16
   ```

   **Option B: Local Installation**
   - Install PostgreSQL 16
   - Create database: `pottery_kb`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/pottery_kb"
   ADMIN_PASSWORD="your-secure-password"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Run database migrations**
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

7. **Open in browser**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin (password: from .env)
   - Prisma Studio: `pnpm prisma studio` → http://localhost:5555

---

## 📁 Project Structure

```
E:\musekidoc/
├── app/
│   ├── (public)/              # Public-facing pages
│   │   ├── page.tsx           # Homepage (pottery list)
│   │   ├── pottery/[slug]/    # Pottery detail page
│   │   └── artists/           # Artist pages
│   ├── admin/                 # Admin panel
│   │   ├── login/             # Login page
│   │   ├── page.tsx           # Dashboard
│   │   ├── entries/           # Entry management
│   │   └── import/            # Bulk import
│   └── api/                   # API routes
│       ├── entries/           # Pottery CRUD
│       ├── artists/           # Artists CRUD
│       ├── search/            # Search & suggestions
│       ├── upload/            # Image upload
│       ├── auth/              # Authentication
│       └── export/            # Data export
├── components/
│   ├── public/                # Public components
│   │   ├── PotteryCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── ImageGallery.tsx
│   └── admin/                 # Admin components
│       ├── PotteryEntryForm.tsx
│       ├── ImageUpload.tsx
│       └── BulkImportForm.tsx
├── lib/
│   ├── db/                    # Database
│   │   ├── client.ts          # Prisma client
│   │   └── types.ts           # TypeScript types
│   ├── validations/           # Zod schemas
│   │   ├── entry.ts
│   │   └── artist.ts
│   ├── auth/                  # Authentication
│   │   ├── session.ts
│   │   └── middleware.ts
│   └── search/                # Search engine
│       └── index.ts           # MiniSearch setup
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Migration history
├── public/
│   └── uploads/               # Uploaded images
├── docs/
│   ├── api.md                 # API documentation ✅
│   ├── DAILY-LOG.md           # Daily work log
│   ├── RESUME-WORK.md         # Resume guide
│   ├── AI-CONTENT-GUIDE.md    # AI content filling guide
│   └── plans/                 # Project plans
└── README.md                  # This file
```

---

## 💻 Development

### Key Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm prisma studio          # Open Prisma Studio
pnpm prisma generate        # Generate Prisma Client
pnpm prisma migrate dev     # Run migrations
pnpm prisma db seed         # Seed database

# Code Quality
pnpm lint                   # Run ESLint
pnpm type-check             # Run TypeScript checks
```

### Database Schema

**Key Models**:
- `PotteryEntry` - Pottery/ceramic entries
- `Artist` - Artist information
- `Category` - Hierarchical categories
- `User` - Admin users

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

### Adding New Entries

**Method 1: Admin UI** (Recommended for single entries)
1. Login to `/admin/login`
2. Click "New Entry"
3. Fill in all fields
4. Upload images
5. Save as draft or publish

**Method 2: Bulk Import** (For batch additions)
1. Prepare JSON file (see template in `/admin/import`)
2. Upload via `/admin/import`
3. Review and confirm

**Method 3: API** (For automation)
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d @entry.json
```

---

## 📚 API Documentation

Full API documentation available at [docs/api.md](docs/api.md).

**Quick Reference**:

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/entries` | GET | List entries | No |
| `/api/entries` | POST | Create entry | Yes |
| `/api/entries/[id]` | GET | Get entry | No |
| `/api/entries/[id]` | PUT | Update entry | Yes |
| `/api/entries/[id]` | DELETE | Delete entry | Yes |
| `/api/search` | POST | Full-text search | No |
| `/api/search/suggestions` | GET | Search suggestions | No |
| `/api/upload` | POST | Upload images | Yes |
| `/api/export/json` | GET | Export all data | No |
| `/api/entries/bulk` | POST | Bulk import | Yes |

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect to GitHub**
   - Import project in Vercel dashboard

2. **Configure environment variables**
   ```
   DATABASE_URL=postgresql://...
   ADMIN_PASSWORD=...
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. **Deploy**
   - Vercel will auto-build and deploy

### Docker

```bash
# Build
docker build -t pottery-kb .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e ADMIN_PASSWORD="..." \
  pottery-kb
```

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Current - 83% Complete)

- [x] Project setup
- [x] Database schema
- [x] API routes (Entries, Artists)
- [x] Public frontend (List, Detail, Artist pages)
- [x] Admin backend (Auth, Editor, Dashboard)
- [x] Bulk import/export
- [x] Image upload
- [ ] Full-text search (code complete, testing pending)
- [ ] Final testing
- [ ] Documentation

**Expected Completion**: 2026-02-25

---

### 🔜 Phase 2: Content & Performance (4-6 weeks)

- [ ] Performance optimization (ISR, caching)
- [ ] Advanced filtering
- [ ] Batch editing in admin
- [ ] Content review workflow
- [ ] Statistics dashboard
- [ ] SEO optimization
- [ ] **Content Goal**: 50 → 200-500 entries

---

### 🔮 Phase 3: Advanced Features (4-6 weeks)

- [ ] Instagram data sync
- [ ] Map view (Leaflet.js)
- [ ] Timeline visualization
- [ ] UI customization (Japanese aesthetics)
- [ ] E-commerce integration API
- [ ] Multi-language support
- [ ] User comments
- [ ] **Content Goal**: 500+ entries

---

## 🤝 Contributing

This project is currently in active development. Contributions welcome after Phase 1 completion.

---

## 📄 License

[Specify license]

---

## 📞 Contact

For questions or support, refer to project documentation in `/docs/`.

---

**Last Updated**: 2026-02-24
**Phase 1 Completion**: ~2026-02-25
