#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract artist information from pottery_kb.md and convert to JSON format
"""

import json
import re
from typing import Dict, List, Optional

def extract_sources(source_text: str) -> List[Dict[str, str]]:
    """Extract sources with title and URL"""
    sources = []
    # Find all URLs in the text
    url_pattern = r'https?://[^\s)）;；]+'
    urls = re.findall(url_pattern, source_text)

    for url in urls:
        # Try to extract title from context
        title = ""
        if "discoverjapan" in url.lower():
            title = "Discover Japan"
        elif "g-call" in url.lower():
            title = "G-Call"
        elif "brutus" in url.lower():
            title = "BRUTUS"
        elif "note.com" in url.lower():
            title = "note"
        elif "gallery" in url.lower():
            title = "Gallery"
        elif "museum" in url.lower():
            title = "Museum"
        elif "tokyoartbeat" in url.lower():
            title = "Tokyo Art Beat"
        elif "infldb" in url.lower():
            title = "Influencer Database"
        else:
            # Use domain as title
            domain = url.split("//")[1].split("/")[0]
            title = domain.replace("www.", "")

        sources.append({"title": title, "url": url})

    return sources if sources else []

def romanize_name(name_zh: str) -> str:
    """Convert Japanese name to romanized slug"""
    # Mapping of Japanese names to romanization
    name_map = {
        "村木雄児": "muraki-yuji",
        "田鶴濱守人": "tazuruhama-morito",
        "高田谷将宏": "takataya-masahiro",
        "石原祥充": "ishihara-yoshimitsu",
        "石原捻久": "ishihara-toshihisa",
        "石原稔久": "ishihara-toshihisa",
        "山田隆太郎": "yamada-ryutaro",
        "川原幸子": "kawahara-sachiko",
        "稲吉善光": "inayoshi-yoshimitsu",
        "尾形篤": "ogata-atsushi",
        "尾形アツシ": "ogata-atsushi",
        "岩切秀央": "iwakiri-shuo",
        "二階堂明弘": "nikaido-akihiro",
        "内田鋼一": "uchida-koichi",
        "成田周平": "narita-shuhei",
        "大谷哲也": "otani-tetsuya",
        "熊渕未紗": "kumabuchi-misa",
        "熊淵未紗": "kumabuchi-misa",
        "石原ゆきえ": "ishihara-yukie",
        "加藤惠津子": "kato-etsuko",
        "厚川文子": "atsukawa-fumiko",
        "高田かえ": "takada-kae",
        "加藤ある": "kato-ai",
        "加藤あゐ": "kato-ai",
        "故金あかり": "kokane-akari",
        "内田可織": "uchida-kaori",
        "佐藤朱理": "sato-akari",
        "鈴木敬子": "suzuki-keiko",
        "鳥居美希": "torii-miki",
        "五島穗波": "goshima-honami",
        "五嶋穂波": "goshima-honami",
        "水谷智美": "mizutani-tomomi",
        "秀野真希": "shuno-maki",
        "掛谷康樹": "kakeya-koki",
        "石川若彦": "ishikawa-wakahiko",
        "山脇将人": "yamawaki-masato",
        "山田洋次": "yamada-yoji",
        "下村淳": "shimomura-atsushi",
        "馬野真吾": "umano-shingo",
        "片瀬和宏": "katase-kazuhiro",
        "渡辺隆之": "watanabe-takayuki",
        "亀田文": "kameda-fumi",
        "吉川裕子": "yoshikawa-yuko",
        "吉泽宽郎": "yoshizawa-hiroo",
        "吉沢寛郎": "yoshizawa-hiroo",
        "岩田哲宏": "iwata-tetsuhiro",
        "黒川徹": "kurokawa-toru",
        "岩崎龙二": "iwasaki-ryuji",
        "岩崎龍二": "iwasaki-ryuji",
        "酒井智也": "sakai-tomoya",
        "远藤岳": "endo-takashi",
        "遠藤岳": "endo-takashi",
        "桑田卓郎": "kuwata-takuro",
        "石田和也": "ishida-kazuya",
        "竹内真吾": "takeuchi-shingo",
        "額賀章夫": "nukaga-akio",
        "滨田友绪": "hamada-tomoo",
        "浜田友緒": "hamada-tomoo",
        "桥本知成": "hashimoto-tomonari",
        "橋本知成": "hashimoto-tomonari",
        "氏家昂大": "ujiie-kodai",
        "佐藤尚理": "sato-naomichi",
        "上田勇二": "ueda-yuji",
        "星野友幸": "hoshino-tomoyuki",
        "小川彩": "ogawa-aya",
        "井口大輔": "iguchi-daisuke",
        "栗原香織": "kurihara-kaori",
        "瀬川裕太": "segawa-yuta",
        "福村龍太": "fukumura-ryuta",
    }

    return name_map.get(name_zh, name_zh.lower().replace(" ", "-"))

def parse_artist_section(lines: List[str], start_idx: int) -> Optional[Dict]:
    """Parse a single artist section"""
    if not lines[start_idx].startswith("## "):
        return None

    # Extract primary name
    name_line = lines[start_idx][3:].strip()
    name_zh = re.sub(r'[（(].*?[）)]', '', name_line).strip()

    # Initialize artist data
    artist = {
        "nameZh": name_zh,
        "slug": romanize_name(name_zh),
        "bio": "",
        "published": True
    }

    # Parse content lines
    i = start_idx + 1
    basic_info = ""
    style = ""
    works = ""
    exhibitions = ""
    sources_text = ""

    while i < len(lines) and not lines[i].startswith("## ") and not lines[i].startswith("### "):
        line = lines[i].strip()

        if line.startswith("- 基本信息："):
            basic_info = line[7:]
        elif line.startswith("- 风格与技法："):
            style = line[8:]
        elif line.startswith("- 器形：") or line.startswith("- 代表作品/类型："):
            works = line.split("：", 1)[1] if "：" in line else ""
        elif line.startswith("- 展览/获奖："):
            exhibitions = line[7:]
        elif line.startswith("- 参考来源："):
            sources_text = line[7:]

        i += 1

    # Build bio
    bio_parts = []
    if basic_info:
        bio_parts.append(basic_info)
    if style:
        bio_parts.append(f"风格：{style}")
    if works:
        bio_parts.append(f"作品类型：{works}")
    if exhibitions and "资料" not in exhibitions and "暂缺" not in exhibitions:
        bio_parts.append(f"展览：{exhibitions}")

    artist["bio"] = "。".join(bio_parts)

    # Extract sources
    if sources_text:
        artist["sources"] = extract_sources(sources_text)

    # Extract birth year if present
    year_match = re.search(r'(\d{4})年?生', basic_info)
    if year_match:
        artist["birthYear"] = int(year_match.group(1))

    # Extract region
    region_patterns = [
        r'([^、；。]+?[都道府県市町村])(?:在住|作陶|制作|設工房|建窑)',
        r'現[於于]([^、；。]+?[都道府県市町村])',
        r'([^、；。]+?[都道府県市町村])(?:の|で)作陶'
    ]
    for pattern in region_patterns:
        match = re.search(pattern, basic_info)
        if match:
            artist["region"] = match.group(1)
            break

    if style:
        artist["style"] = style

    # Only return if we have minimum required data
    if len(artist["bio"]) >= 50 and artist.get("sources"):
        return artist

    return None

def parse_instagram_artist(lines: List[str], start_idx: int) -> Optional[Dict]:
    """Parse Instagram artist section (different format)"""
    if not lines[start_idx].startswith("### @"):
        return None

    # Extract Instagram handle and name
    header = lines[start_idx][5:].strip()
    match = re.match(r'(\w+)[（(]([^）)]+)[）)]', header)
    if not match:
        return None

    instagram_handle = match.group(1)
    name_zh = match.group(2)

    # Initialize artist data
    artist = {
        "nameZh": name_zh,
        "slug": romanize_name(name_zh),
        "instagramHandle": instagram_handle,
        "bio": "",
        "published": True
    }

    # Parse content lines
    i = start_idx + 1
    basic_info = ""
    followers = ""
    style = ""
    works = ""
    exhibitions = ""
    sources_text = ""

    while i < len(lines) and not lines[i].startswith("### "):
        line = lines[i].strip()

        if line.startswith("- 基本信息："):
            basic_info = line[7:]
        elif line.startswith("- 粉丝量：") or line.startswith("- 粉丝数："):
            followers_match = re.search(r'(\d+\.?\d*)\s*[KkKＫ万]', line)
            if followers_match:
                num = float(followers_match.group(1))
                if "K" in line or "k" in line or "Ｋ" in line:
                    artist["instagramFollowers"] = int(num * 1000)
                elif "万" in line:
                    artist["instagramFollowers"] = int(num * 10000)
        elif line.startswith("- 风格与技法："):
            style = line[8:]
        elif line.startswith("- 代表作品/类型："):
            works = line[9:]
        elif line.startswith("- 展览/获奖："):
            exhibitions = line[7:]
        elif line.startswith("- 参考来源："):
            sources_text = line[7:]

        i += 1

    # Build bio
    bio_parts = []
    if basic_info:
        bio_parts.append(basic_info)
    if style:
        bio_parts.append(f"风格：{style}")
    if works:
        bio_parts.append(f"作品类型：{works}")
    if exhibitions and "资料" not in exhibitions and "暂缺" not in exhibitions:
        bio_parts.append(f"展览：{exhibitions}")

    artist["bio"] = "。".join(bio_parts)

    # Extract sources
    if sources_text:
        artist["sources"] = extract_sources(sources_text)

    # Extract birth year
    year_match = re.search(r'(\d{4})\s*年?生', basic_info)
    if year_match:
        artist["birthYear"] = int(year_match.group(1))

    # Extract region
    region_patterns = [
        r'([^、；。]+?[都道府県市町村])(?:在住|作陶|制作|設工房|建窑)',
        r'現[於于居]([^、；。]+?[都道府県市町村])',
    ]
    for pattern in region_patterns:
        match = re.search(pattern, basic_info)
        if match:
            artist["region"] = match.group(1)
            break

    if style:
        artist["style"] = style

    # Only return if we have minimum required data
    if len(artist["bio"]) >= 50 and artist.get("sources"):
        return artist

    return None

def clean_artist_data(artist: Dict) -> Dict:
    """Remove null values from artist data"""
    return {k: v for k, v in artist.items() if v is not None and v != "" and v != []}

def main():
    # Read the markdown file
    with open(r"E:\musekidoc\docs\pottery_kb.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Skip already imported artists
    skip_slugs = {"hatta-toru", "kurokawa-toru", "iguchi-daisuke"}

    # Parse regular artists (lines 6-295)
    regular_artists = []
    i = 5  # Start from line 6 (0-indexed)
    while i < len(lines) and i < 295:
        if lines[i].startswith("## "):
            artist = parse_artist_section(lines, i)
            if artist and artist["slug"] not in skip_slugs:
                regular_artists.append(clean_artist_data(artist))
        i += 1

    # Parse Instagram artists (lines 296+)
    instagram_artists = []
    i = 295
    while i < len(lines):
        if lines[i].startswith("### @"):
            artist = parse_instagram_artist(lines, i)
            if artist and artist["slug"] not in skip_slugs:
                instagram_artists.append(clean_artist_data(artist))
        i += 1

    # Separate Instagram artists by followers
    high_follower_artists = [a for a in instagram_artists if a.get("instagramFollowers", 0) >= 10000]

    # Create batch 2 (regular artists)
    batch2 = {
        "artists": regular_artists,
        "updateExisting": False
    }

    # Create batch 3 (Instagram popular artists)
    batch3 = {
        "artists": high_follower_artists,
        "updateExisting": False
    }

    # Write JSON files
    with open(r"E:\musekidoc\data\artists-batch-2.json", "w", encoding="utf-8") as f:
        json.dump(batch2, f, ensure_ascii=False, indent=2)

    with open(r"E:\musekidoc\data\artists-batch-3.json", "w", encoding="utf-8") as f:
        json.dump(batch3, f, ensure_ascii=False, indent=2)

    print(f"✓ 已提取 {len(regular_artists)} 位普通作家 → artists-batch-2.json")
    print(f"✓ 已提取 {len(high_follower_artists)} 位Instagram人气作家 → artists-batch-3.json")
    print(f"\n跳过的作家（已导入）：{', '.join(skip_slugs)}")

if __name__ == "__main__":
    main()
