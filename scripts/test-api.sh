#!/bin/bash

# 测试 API 端点

echo "🧪 开始测试 API 端点..."
echo ""

# 1. 测试 GET /api/entries（公开）
echo "1️⃣ 测试 GET /api/entries（获取列表）..."
curl -s http://localhost:3000/api/entries | head -n 20
echo ""
echo ""

# 2. 测试 GET /api/entries?search=备前（搜索）
echo "2️⃣ 测试搜索功能..."
curl -s "http://localhost:3000/api/entries?search=备前" | head -n 20
echo ""
echo ""

# 3. 测试 POST /api/entries（需要认证）
echo "3️⃣ 测试 POST /api/entries（创建条目）..."
curl -s -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{
    "slug": "test-pottery",
    "nameZh": "测试陶器",
    "nameJa": "テスト",
    "category": "陶器",
    "region": "测试地区",
    "description": "这是一个用于测试API的陶器条目。需要至少100个字符才能通过验证。这是一个用于测试API的陶器条目。需要至少100个字符才能通过验证。这是一个用于测试API的陶器条目。",
    "positioning": "这是定位说明文本，至少10个字符",
    "signatureFeatures": ["测试特征1"],
    "keywords": ["测试", "陶器", "API"],
    "notableArtists": [],
    "representativeForms": [],
    "sources": [{"title": "测试来源", "url": "https://example.com"}],
    "published": false
  }' | head -n 20
echo ""
echo ""

echo "✅ API 测试完成！"
