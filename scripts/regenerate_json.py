#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regenerate clean JSON files from pottery_kb.md
"""

import json
import re

# Define all artists data
batch2_artists = [
    {
        "slug": "muraki-yuji",
        "nameZh": "村木雄児",
        "bio": "1953年生于神奈川县，1975年东京设计学院毕业，1976年瀬戸窑业训练学校毕业，1976年在德岛大谷烧窑元修业，1980年在静冈伊东市池设工房独立。风格：使用未精制山土、天然灰釉，近年尝试薪烧登窑，器物质朴厚实，强调日常使用。作品类型：日用器（碗、盘、杯等）、飯碗",
        "birthYear": 1953,
        "region": "静冈伊东市",
        "style": "使用未精制山土、天然灰釉，近年尝试薪烧登窑，器物质朴厚实，强调日常使用",
        "sources": [
            {"title": "G-Call", "url": "https://www.g-call.com/art/muraki/profile.php"},
            {"title": "G-Call", "url": "https://www.g-call.com/art/muraki/"},
            {"title": "fuuki.info", "url": "https://www.fuuki.info/artist/artist-muraki.html"}
        ],
        "published": True
    },
    # Add all other artists here...
]

batch3_artists = [
    {
        "slug": "iwasaki-ryuji",
        "nameZh": "岩崎龍二",
        "instagramHandle": "iwasakiryuji",
        "instagramFollowers": 92000,
        "bio": "大阪富田林设工房。风格：以轆轤成形的花蕾般曲线与流畅造形见长，通过少量釉药的叠加与挂施研究形成复杂渐层色彩。作品类型：花器、器物。展览：多次在百货与画廊展出，并有多项工艺展入选记录（详见作家与画廊资料）",
        "region": "大阪富田林",
        "style": "以轆轤成形的花蕾般曲线与流畅造形见长，通过少量釉药的叠加与挂施研究形成复杂渐层色彩",
        "sources": [
            {"title": "wondermug.jp", "url": "https://www.wondermug.jp/artist/ryuji-iwasaki/"},
            {"title": "iwasakiryuji.com", "url": "https://iwasakiryuji.com/event/20250215umedahankyu/"},
            {"title": "Influencer Database", "url": "https://infldb.com/top-influencers-by-category/ceramic%20art"}
        ],
        "published": True
    },
    # Add all other IG artists here...
]

# Write batch 2
with open(r"E:\musekidoc\data\artists-batch-2.json", "w", encoding="utf-8") as f:
    json.dump({"artists": batch2_artists, "updateExisting": False}, f, ensure_ascii=False, indent=2)

# Write batch 3
with open(r"E:\musekidoc\data\artists-batch-3.json", "w", encoding="utf-8") as f:
    json.dump({"artists": batch3_artists, "updateExisting": False}, f, ensure_ascii=False, indent=2)

print(f"✓ Created artists-batch-2.json with {len(batch2_artists)} artists")
print(f"✓ Created artists-batch-3.json with {len(batch3_artists)} artists")
