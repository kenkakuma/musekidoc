#!/usr/bin/env python3
"""
Translate English content in artists-detail-supplemented.json to Chinese.
Rules:
- Romaji artist names are preserved
- English descriptive words are translated
- Japanese/Chinese values are left unchanged
"""

import json
import re
import subprocess
import sys
from pathlib import Path

INPUT_FILE = Path("/Users/eric/musekidoc/artists-detail-supplemented.json")

# ─────────────────────────────────────────────
# 1. studioName exact-match overrides
# ─────────────────────────────────────────────
STUDIO_NAME_EXACT: dict[str, str] = {
    "sgwlab": "sgwlab",
    "Kusunoki Kiln": "楠窑",
    "Kaori Kurihara Ceramique": "Kaori Kurihara 陶瓷工作室",
    "Yuki Kiln": "雪窑",
    "Hamada-gama / Hamada Kiln": "濱田窑",
    "INOUE MANJI KILN": "井上萬二窑",
    "Kaizan-gama": "快山窑",
    "Ochabawan Kiln": "茶碗窑",
    "Bon Kiln": "梵窑",
    "N. Ceramics": "N. 陶艺工作室",
    "Mushimegane Books Studio": "mushimegane books 工作室",
    "Aya Ogawa Ceramics": "小川彩陶艺工作室",
    "Bonoho Ceramics Studio": "bonoho 陶艺工作室",
    "Studio Knot": "studio knot 工作室",
    "Iguchi Daisuke Kiln": "Iguchi Daisuke 窑",
    "Yoshizawa Kiln": "Yoshizawa 窑",
    "Susuke Pottery Studio": "susuke 陶艺工作室",
    "Shōdō Kiln": "Shōdō 窑",
}

# suffix-based fallback for studioName / kilnName
# Ordered from longest to shortest to avoid partial matches
STUDIO_NAME_SUFFIXES: list[tuple[str, str]] = [
    (" Pottery Studio", " 陶艺工作室"),
    (" Ceramique", " 陶瓷工作室"),
    (" Ceramics", " 陶艺工作室"),
    (" Pottery", " 陶艺工作室"),
    (" Studio", " 工作室"),
    (" Kiln", " 窑"),
]

# ─────────────────────────────────────────────
# 2. kilnName exact-match
# ─────────────────────────────────────────────
KILN_NAME_EXACT: dict[str, str] = {
    "Segawa Yuta Studio": "Segawa Yuta 工作室",
    "susuke製陶室": "susuke製陶室",   # already Japanese – no change
    "N. ceramic studio": "N. 陶艺工作室",
    "mushimegane books": "mushimegane books",
    "bonoho": "bonoho",
    "studio knot": "studio knot",
}

# ─────────────────────────────────────────────
# 3. locationArea / locationCity exact-match
# ─────────────────────────────────────────────
LOCATION_EXACT: dict[str, str] = {
    "London": "伦敦",
    "Paris": "巴黎",
    "静岡／London": "静冈／伦敦",
    "京都／Paris": "京都／巴黎",
}

# ─────────────────────────────────────────────
# 4. exhibitions[].title exact-match
# ─────────────────────────────────────────────
EXHIBITION_TITLE_EXACT: dict[str, str] = {
    "LOEWE Craft Prize Exhibition": "LOEWE工艺奖展览",
    "Ceramic Art London": "伦敦陶艺展",
    "Les Journées de la céramique": "陶瓷艺术节（Les Journées de la céramique）",
    "Takuro Kuwata": "Takuro Kuwata 个展",
    "Picking Up Seeds": "《拾种》个展",
    "Memories of Resonating Clays": "《共鸣之土》展",
    "Fair Trade": "《公平贸易》展",
    "My Ceramic Journey 30周年展": "《我的陶艺之旅》30周年展",
    "Kikuchi Biennale V": "菊池双年展第五届",
    "Candied Peel个展": "《糖渍橙皮》个展",
    "Bakuro-cho ART + EAT展": "马喰町ART + EAT展",
    "Handmade in Japan Fes": "Handmade in Japan博览会",
    "KO+GEI 2024展": "KO+GEI 2024展",  # already mixed – preserve
}

# ─────────────────────────────────────────────
# 5. exhibitions[].venue exact-match
# ─────────────────────────────────────────────
EXHIBITION_VENUE_EXACT: dict[str, str] = {
    "东京草月会馆、维多利亚和阿尔伯特博物馆伦敦、洛杉矶郡艺术博物馆、马德里LOEWE Foundation":
        "东京草月会馆、维多利亚和阿尔伯特博物馆（伦敦）、洛杉矶郡艺术博物馆、马德里LOEWE基金会",
    "B-OWND Gallery": "B-OWND画廊",
    "纽约Ippodo Gallery": "纽约Ippodo画廊",
    "Alp Shop & Studio": "Alp工作室兼商店",
    "东京IDÉE GALLERY": "东京IDÉE画廊",
    "Gallery NOW": "Gallery NOW画廊",
    "London / Tokyo / Los Angeles": "伦敦／东京／洛杉矶",
    "东京Lapin Art Gallery": "东京Lapin Art画廊",
    "Guild Gallery NY": "Guild Gallery纽约",
    "Kurashi Japanese Crafts": "Kurashi日本工艺",
    "Brutal Ceramics画廊": "Brutal Ceramics画廊",  # preserve as-is
}

# ─────────────────────────────────────────────
# 6. awards[] exact-match
# ─────────────────────────────────────────────
AWARD_EXACT: dict[str, str] = {
    "2019年LOEWE Craft Prize入选": "2019年LOEWE工艺奖入选",
    "2019年 LOEWE Craft Prize ファイナリスト": "2019年LOEWE工艺奖决选入围",
    "V&A と LACMA に作品収蔵": "维多利亚与阿尔伯特博物馆（V&A）及洛杉矶郡艺术博物馆（LACMA）收藏",
    "伦敦陶艺周Featured Artist": "伦敦陶艺周特邀艺术家",
    "2022年Maison & Objet Paris Rising Talent Awards Craft":
        "2022年巴黎家居装饰博览会（Maison & Objet）新锐才华奖·工艺类",
    "2018年LOEWE Craft Prize特别提名": "2018年LOEWE工艺奖特别提名",
    "2018年 LOEWE Craft Prize 特別賞候補": "2018年LOEWE工艺奖特别奖候选",
    "国际知名画廊代理（Kaikai Kiki, Blum & Poe）": "国际知名画廊代理（Kaikai Kiki、Blum & Poe）",
    "独立30周年纪念作品集《My Ceramic Journey》出版": "独立30周年纪念作品集《我的陶艺之旅》出版",
    "2013年菊池寛実記念智美術館Kikuchi Biennale V荣誉提名":
        "2013年菊池宽实纪念智美术馆陶艺双年展第五届荣誉提名",
    "师从大阪木村明広(Ceramic Studio Tomole)": "师从大阪木村明広（Ceramic Studio Tomole）",
    "2022年第6回First Patronage Program入选": "2022年第6届First Patronage Program入选",
    "19世纪英国slipware影响": "受19世纪英国slipware风格影响",
}

# ─────────────────────────────────────────────
# 7. sources[].title exact-match
# ─────────────────────────────────────────────
SOURCE_TITLE_EXACT: dict[str, str] = {
    "Mahteh Ceramic Akari Karugane": "Mahteh陶艺 苅谷明展示页",
    "Kura Monzen Gallery Hashimoto Tomonari": "藏前画廊 橋本知成页面",
    "WWDJAPAN LOEWE Craft Prize 2019": "WWD JAPAN LOEWE工艺奖2019报道",
    "Ippodo Gallery 作家简介": "Ippodo画廊 作家简介",
    "Gendai Tojiki Yuji Ueda": "现代陶磁 上田勇児",
    "Art Collaboration Kyoto 2022 - Yuji Ueda": "Art Collaboration Kyoto 2022 - 上田勇児",
    "Moderne Gallery - Yuji Ueda": "Moderne Gallery - 上田勇児",
    "Japan House London Muraki Yuji": "Japan House London 村木雄児",
    "Terra Delft": "Terra Delft画廊",
}


# ─────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────

def is_already_localized(value: str) -> bool:
    """Return True if value contains CJK characters (already Japanese/Chinese)."""
    return bool(re.search(r'[\u3040-\u9fff\u4e00-\u9fff]', value))


def translate_studio_name(value: str) -> str | None:
    """Return translated studio name or None if no change needed."""
    if not value:
        return None
    # Exact match first
    if value in STUDIO_NAME_EXACT:
        result = STUDIO_NAME_EXACT[value]
        return result if result != value else None
    # Already CJK – skip
    if is_already_localized(value):
        return None
    # Suffix fallback
    for suffix, replacement in STUDIO_NAME_SUFFIXES:
        if value.endswith(suffix):
            result = value[: -len(suffix)] + replacement
            return result
    return None


def translate_kiln_name(value: str) -> str | None:
    if not value:
        return None
    if value in KILN_NAME_EXACT:
        result = KILN_NAME_EXACT[value]
        return result if result != value else None
    if is_already_localized(value):
        return None
    # Try suffix fallback same as studio
    for suffix, replacement in STUDIO_NAME_SUFFIXES:
        if value.endswith(suffix):
            result = value[: -len(suffix)] + replacement
            return result
    return None


def translate_location(value: str) -> str | None:
    if not value:
        return None
    if value in LOCATION_EXACT:
        result = LOCATION_EXACT[value]
        return result if result != value else None
    return None


def translate_exhibition_title(value: str) -> str | None:
    if not value:
        return None
    if value in EXHIBITION_TITLE_EXACT:
        result = EXHIBITION_TITLE_EXACT[value]
        return result if result != value else None
    return None


def translate_exhibition_venue(value: str) -> str | None:
    if not value:
        return None
    if value in EXHIBITION_VENUE_EXACT:
        result = EXHIBITION_VENUE_EXACT[value]
        return result if result != value else None
    return None


def translate_award(value: str) -> str | None:
    if not value:
        return None
    if value in AWARD_EXACT:
        result = AWARD_EXACT[value]
        return result if result != value else None
    return None


def translate_source_title(value: str) -> str | None:
    if not value:
        return None
    if value in SOURCE_TITLE_EXACT:
        result = SOURCE_TITLE_EXACT[value]
        return result if result != value else None
    return None


# ─────────────────────────────────────────────
# Main processing
# ─────────────────────────────────────────────

def process(data: list[dict]) -> int:
    """Mutate data in place. Return count of changes made."""
    changes = 0

    for artist in data:
        slug = artist.get("artistSlug", "?")

        # 1. studioName
        if artist.get("studioName"):
            translated = translate_studio_name(artist["studioName"])
            if translated is not None:
                print(f"[studioName] {slug}: {artist['studioName']!r} → {translated!r}")
                artist["studioName"] = translated
                changes += 1

        # 2. kilnName
        if artist.get("kilnName"):
            translated = translate_kiln_name(artist["kilnName"])
            if translated is not None:
                print(f"[kilnName]   {slug}: {artist['kilnName']!r} → {translated!r}")
                artist["kilnName"] = translated
                changes += 1

        # 3. locationArea
        if artist.get("locationArea"):
            translated = translate_location(artist["locationArea"])
            if translated is not None:
                print(f"[locationArea] {slug}: {artist['locationArea']!r} → {translated!r}")
                artist["locationArea"] = translated
                changes += 1

        # 4. locationCity
        if artist.get("locationCity"):
            translated = translate_location(artist["locationCity"])
            if translated is not None:
                print(f"[locationCity] {slug}: {artist['locationCity']!r} → {translated!r}")
                artist["locationCity"] = translated
                changes += 1

        # 5. exhibitions[].title and .venue
        for ex in artist.get("exhibitions", []):
            if ex.get("title"):
                translated = translate_exhibition_title(ex["title"])
                if translated is not None:
                    print(f"[ex.title]  {slug}: {ex['title']!r} → {translated!r}")
                    ex["title"] = translated
                    changes += 1
            if ex.get("venue"):
                translated = translate_exhibition_venue(ex["venue"])
                if translated is not None:
                    print(f"[ex.venue]  {slug}: {ex['venue']!r} → {translated!r}")
                    ex["venue"] = translated
                    changes += 1

        # 6. awards[]
        new_awards = []
        for aw in artist.get("awards", []):
            translated = translate_award(aw)
            if translated is not None:
                print(f"[award]     {slug}: {aw!r} → {translated!r}")
                new_awards.append(translated)
                changes += 1
            else:
                new_awards.append(aw)
        if "awards" in artist:
            artist["awards"] = new_awards

        # 7. sources[].title
        for src in artist.get("sources", []):
            if src.get("title"):
                translated = translate_source_title(src["title"])
                if translated is not None:
                    print(f"[src.title] {slug}: {src['title']!r} → {translated!r}")
                    src["title"] = translated
                    changes += 1

    return changes


def main() -> None:
    print(f"Reading {INPUT_FILE} …")
    with open(INPUT_FILE, encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} artists.\n")

    total_changes = process(data)

    print(f"\nTotal changes: {total_changes}")
    print(f"Writing back to {INPUT_FILE} …")

    output = json.dumps(data, ensure_ascii=False, indent=2)
    with open(INPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)
        f.write("\n")  # trailing newline

    print("Validating JSON …")
    result = subprocess.run(
        ["python3", "-m", "json.tool", str(INPUT_FILE)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("ERROR: JSON validation failed!")
        print(result.stderr)
        sys.exit(1)
    else:
        print("JSON is valid.")
        print("Done.")


if __name__ == "__main__":
    main()
