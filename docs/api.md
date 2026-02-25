# Japan Pottery Knowledge Base - API Documentation

**Version**: 1.0
**Base URL**: `http://localhost:3000/api`
**Authentication**: Bearer token (for write operations)

---

## Table of Contents

- [Authentication](#authentication)
- [Pottery Entries API](#pottery-entries-api)
- [Artists API](#artists-api)
- [Search API](#search-api)
- [Upload API](#upload-api)
- [Import API](#import-api)
- [Export API](#export-api)
- [Error Handling](#error-handling)

---

## Authentication

Most **write operations** (POST, PUT, DELETE) require authentication.

**Headers**:
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
```

**Environment Variable**: `ADMIN_PASSWORD` (default: `admin123`)

**Example**:
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Pottery Entries API

### GET /api/entries

Get a paginated list of pottery entries.

**Query Parameters**:
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `category` (string, optional) - Filter by category
- `region` (string, optional) - Filter by region
- `published` (boolean, optional) - Filter by published status
- `search` (string, optional) - Full-text search query

**Example Request**:
```bash
curl "http://localhost:3000/api/entries?page=1&pageSize=20&published=true"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "bizen-yaki",
      "nameZh": "备前烧",
      "nameJa": "備前焼",
      "nameEn": "Bizen ware",
      "category": "陶器 / 无釉 / 薪窑",
      "region": "冈山县・备前市",
      "description": "...",
      "published": true,
      "artist": {
        "id": "uuid",
        "nameZh": "金重陶陽",
        "nameJa": "金重陶陽"
      },
      "createdAt": "2026-02-24T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### GET /api/entries/[id]

Get a single pottery entry by ID.

**Example Request**:
```bash
curl "http://localhost:3000/api/entries/uuid-here"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "bizen-yaki",
    "nameZh": "备前烧",
    "nameJa": "備前焼",
    "signatureFeatures": ["无釉高温烧成", "窯变分类"],
    "keywords": ["備前焼", "無釉", "焼締"],
    "notableArtists": ["金重陶陽", "藤原雄"],
    "sources": [
      {
        "title": "六古窯：Bizen",
        "url": "https://en.sixancientkilns.jp/bizen/"
      }
    ],
    "images": [
      {
        "id": "uuid",
        "url": "/uploads/pottery/uuid/medium.webp",
        "alt": "备前烧茶碗",
        "width": 800,
        "height": 600
      }
    ]
  }
}
```

---

### POST /api/entries

Create a new pottery entry. **Requires authentication**.

**Request Body**:
```json
{
  "slug": "unique-slug",
  "nameZh": "陶器名称",
  "nameJa": "日本語名",
  "nameEn": "English Name",
  "category": "陶器",
  "region": "产地",
  "description": "详细描述（至少100字）",
  "positioning": "定位说明",
  "signatureFeatures": ["特征1", "特征2"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "notableArtists": ["作家1", "作家2"],
  "representativeForms": ["器型1", "器型2"],
  "sources": [
    {
      "title": "来源标题",
      "url": "https://example.com"
    }
  ],
  "published": false
}
```

**Response**: Created entry object with status 201.

---

### PUT /api/entries/[id]

Update an existing pottery entry. **Requires authentication**.

**Request Body**: Same as POST, but all fields are optional (partial update).

**Response**: Updated entry object.

---

### DELETE /api/entries/[id]

Delete a pottery entry. **Requires authentication**.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

---

## Artists API

### GET /api/artists

Get a paginated list of artists.

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `search` (string, optional)
- `published` (boolean, optional)

**Example Request**:
```bash
curl "http://localhost:3000/api/artists?published=true"
```

---

### GET /api/artists/[id]

Get a single artist by ID, including their pottery entries.

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "kaneshige-toyo",
    "nameZh": "金重陶陽",
    "nameJa": "金重陶陽",
    "bio": "日本陶艺大师，人间国宝...",
    "birthYear": 1896,
    "deathYear": 1967,
    "region": "冈山县",
    "style": "备前烧",
    "potteryEntries": [
      {
        "id": "uuid",
        "nameZh": "备前烧茶碗"
      }
    ]
  }
}
```

---

### POST /api/artists

Create a new artist. **Requires authentication**.

**Request Body**:
```json
{
  "slug": "unique-slug",
  "nameZh": "作家名",
  "nameJa": "日本語名",
  "bio": "作家简介（至少50字）",
  "birthYear": 1950,
  "region": "产地",
  "style": "风格",
  "sources": [
    {
      "title": "来源标题",
      "url": "https://example.com"
    }
  ],
  "published": false
}
```

---

### PUT /api/artists/[id]

Update an artist. **Requires authentication**.

---

### DELETE /api/artists/[id]

Delete an artist. **Requires authentication**.

**Note**: Cannot delete if artist has associated pottery entries.

---

## Search API

### POST /api/search

Perform full-text search across pottery entries.

**Request Body**:
```json
{
  "query": "备前烧",
  "limit": 20,
  "offset": 0
}
```

**Features**:
- Searches across: nameZh, nameJa, nameEn, description, keywords, region, category
- Fuzzy matching (0.2 tolerance)
- Prefix search support
- Weighted fields (nameZh and nameJa have highest priority)

**Response**:
```json
{
  "success": true,
  "data": [/* array of pottery entries */],
  "meta": {
    "total": 15,
    "page": 1,
    "pageSize": 20,
    "query": "备前烧"
  }
}
```

---

### GET /api/search/suggestions

Get search suggestions for autocomplete.

**Query Parameters**:
- `q` (string, required) - Search query
- `limit` (number, default: 5) - Max suggestions

**Example Request**:
```bash
curl "http://localhost:3000/api/search/suggestions?q=备前&limit=5"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    "备前烧",
    "备前",
    "备前市"
  ]
}
```

---

## Upload API

### POST /api/upload

Upload images for pottery entries or artists. **Requires authentication**.

**Request**: `multipart/form-data`

**Form Fields**:
- `images` (file[]) - Image files (max 10 files, max 5MB each)
- Supported formats: JPEG, PNG, WebP

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer admin123" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "id": "uuid",
        "url": "/uploads/pottery/uuid/medium.webp",
        "thumbnail": "/uploads/pottery/uuid/thumb.webp",
        "original": "/uploads/pottery/uuid/original.jpg",
        "width": 1920,
        "height": 1080
      }
    ]
  }
}
```

**Processing**:
- Automatically converts to WebP format
- Generates thumbnail (400×300px)
- Limits max width to 1920px (preserves aspect ratio)

---

## Import API

### POST /api/entries/bulk

Batch import pottery entries. **Requires authentication**.

**Request Body**:
```json
{
  "entries": [
    {
      "slug": "entry-1",
      "nameZh": "条目1",
      "nameJa": "エントリ1",
      "category": "陶器",
      "region": "产地",
      "description": "描述...",
      "positioning": "定位",
      "signatureFeatures": ["特征1"],
      "keywords": ["关键词1", "关键词2", "关键词3"],
      "notableArtists": [],
      "representativeForms": [],
      "sources": [{"title": "来源", "url": "https://..."}],
      "published": false
    }
  ],
  "updateExisting": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "imported": 10,
    "updated": 0,
    "failed": 0,
    "results": [/* array of results */],
    "errors": []
  }
}
```

---

### POST /api/artists/bulk

Batch import artists. **Requires authentication**.

---

## Export API

### GET /api/export/json

Export all data as JSON.

**Query Parameters**:
- `format` (string, default: 'pretty') - 'pretty' or 'compact'
- `include` (string, default: 'all') - 'all', 'entries', 'artists', 'categories'

**Example Request**:
```bash
curl "http://localhost:3000/api/export/json?format=pretty&include=all" -O
```

**Response**: JSON file download

**File Structure**:
```json
{
  "exportedAt": "2026-02-24T10:00:00.000Z",
  "version": "1.0",
  "data": {
    "entries": [/* array */],
    "entriesCount": 50,
    "artists": [/* array */],
    "artistsCount": 10,
    "categories": [/* array */],
    "categoriesCount": 5
  }
}
```

---

### POST /api/export/json

Export selected entries as JSON.

**Request Body**:
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"],
  "format": "pretty"
}
```

---

## Error Handling

All API responses follow this format:

**Success Response**:
```json
{
  "success": true,
  "data": {/* result data */},
  "meta": {/* optional metadata */}
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {/* optional error details */}
  }
}
```

**Common Error Codes**:
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Input validation failed
- `DUPLICATE_SLUG` (400) - Slug already exists
- `SERVER_ERROR` (500) - Internal server error

**Validation Error Example**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据验证失败",
    "details": [
      {
        "field": "nameZh",
        "message": "中文名称至少 2 个字符"
      }
    ]
  }
}
```

---

## Rate Limiting

Currently not implemented. Consider adding in production:
- 60 requests per minute per IP for public endpoints
- 120 requests per minute for authenticated endpoints

---

## CORS

**Development**: All origins allowed
**Production**: Configure allowed origins in environment variables

---

## Changelog

### Version 1.0 (2026-02-24)
- Initial API implementation
- Pottery entries CRUD
- Artists CRUD
- Full-text search with MiniSearch
- Bulk import/export
- Image upload with optimization

---

**Last Updated**: 2026-02-24
**Contact**: For API support, refer to project documentation
