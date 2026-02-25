# Six Ancient Kilns (Rokkoyo) Pottery Entries - Summary

**Generated:** 2026-02-25
**File Location:** `E:\musekidoc\data\rokkoyo-entries.json`
**Total Entries:** 6

## Overview

This document summarizes the comprehensive pottery entries created for Japan's Six Ancient Kilns (六古窯, Rokkoyo). These six pottery production centers represent the most historically important ceramic traditions in Japan, with continuous production spanning 850-1300 years.

The Six Ancient Kilns were formally designated by ceramic scholar Koyama Fujio (小山富士夫) in 1948 and were recognized as Japan Heritage sites in 2017.

## Entries Created

### 1. Bizen-yaki (備前焼)
- **Slug:** `bizen-yaki`
- **Region:** Okayama Prefecture, Bizen City
- **Type:** Unglazed stoneware (無釉炻器)
- **History:** Over 1,000 years, dating back to Heian period (794-1185)
- **Key Characteristics:**
  - Completely unglazed, relying on natural kiln effects
  - 10-14 day firing at 1200-1300°C
  - Distinctive patterns: hidasuki (緋襷), goma (胡麻), sangiri (桟切)
  - Embodies wabi-sabi aesthetic
- **Notable Artists:** Isezaki Jun (Living National Treasure), Kaneshige Toyo, Fujiwara Kei, Fujiwara Yu, Ishida Kazuya
- **Description Length:** 368 characters

### 2. Tokoname-yaki (常滑焼)
- **Slug:** `tokoname-yaki`
- **Region:** Aichi Prefecture, Tokoname City
- **Type:** Stoneware, teapots (炻器・急須)
- **History:** Dating back to 12th century, largest medieval production center with ~3,000 kilns
- **Key Characteristics:**
  - Famous for shudei (朱泥) red clay teapots
  - Fine-grained, porcelain-like texture
  - Mogake technique for surface patterns
  - Nerikomi layered clay technique
- **Notable Artists:** Yamada Jozan III (Living National Treasure), Yamada Jozan IV, Gyokko, Shoryu
- **Description Length:** 387 characters

### 3. Seto-yaki (瀬戸焼)
- **Slug:** `seto-yaki`
- **Region:** Aichi Prefecture, Seto City
- **Type:** Pottery and porcelain (陶器・瓷器)
- **History:** Dating back to 13th century, "setomono" became generic term for ceramics
- **Key Characteristics:**
  - First region in Japan to use glazes extensively
  - Low-iron white clay suitable for various glaze colors
  - Produces both pottery and porcelain (rare in Japan)
  - Sometsuke (染付) cobalt blue painting technique
- **Notable Artists:** Kato Tokuro, Kato Shuntai, Kato Shirozaemon, Takeuchi Shingo
- **Description Length:** 376 characters

### 4. Shigaraki-yaki (信楽焼)
- **Slug:** `shigaraki-yaki`
- **Region:** Shiga Prefecture, Koka City
- **Type:** Stoneware (炻器)
- **History:** Origins traced to 742 CE (tile production), kilns from Kamakura period
- **Key Characteristics:**
  - Sandy clay from Lake Biwa bed with warm orange color
  - Coarse texture with feldspar inclusions
  - Hiiro (緋色) red blush and natural ash glaze
  - Stone burst (石はぜ) effects
  - Wabi-sabi aesthetic for tea ceremony
- **Notable Artists:** Takahashi Rakusai, Kohara Yasuhiro, Arakawa Satoshi, Fujiwara Jun, Masumoto Keiko
- **Description Length:** 406 characters

### 5. Tamba-yaki / Tachikui-yaki (丹波焼・立杭焼)
- **Slug:** `tamba-yaki`
- **Region:** Hyogo Prefecture, Sasayama City, Tachikui
- **Type:** Stoneware (炻器)
- **History:** Late Heian period (794-1185), production center moved to Tachikui in Meiji period
- **Key Characteristics:**
  - Natural ash-covered glaze from 60-hour firing
  - Fired at ~1300°C in climbing kilns with pine wood
  - Akadobe (赤土部) iron-rich slip with reddish-brown color
  - Counter-clockwise rotating wheel (unique tradition)
  - 120-year-old "Snake Kiln" still in use
- **Notable Artists:** Shimizu Takeshi, Ichino Isaku, Imanishi Kimihiko
- **Description Length:** 572 characters

### 6. Echizen-yaki (越前焼)
- **Slug:** `echizen-yaki`
- **Region:** Fukui Prefecture, Echizen Town
- **Type:** Stoneware (炻器)
- **History:** Origins ~1,300 years ago, production center history ~850 years
- **Key Characteristics:**
  - Iron-rich clay with excellent heat resistance
  - Fired at ~1300°C without glaze
  - Natural ash glaze from wood firing
  - Nejitate seikei coil-building technique
  - Dense, durable texture with water resistance
- **Notable Artists:** Koyama Fujio (scholar), Mizuno Kyuemon (scholar)
- **Description Length:** 564 characters

## Data Structure

Each entry includes the following comprehensive fields:

### Core Fields
- `slug`: URL-friendly identifier
- `nameZh`: Chinese name
- `nameJa`: Japanese name
- `nameEn`: English name
- `category`: "六古窯（Six Ancient Kilns）"
- `region`: Production region
- `type`: Pottery type classification

### Content Fields
- `description`: Comprehensive historical and technical description (200+ characters)
- `positioning`: Market positioning and significance
- `signatureFeatures`: Array of distinctive characteristics (7-9 features per entry)
- `keywords`: Array of relevant keywords (10 keywords per entry)
- `notableArtists`: Array of famous potters and artists (3-5 per entry)
- `representativeForms`: Array of typical pottery forms (6-8 forms per entry)

### Metadata
- `sources`: Array of authoritative sources (3 sources per entry)
- `published`: Boolean (all set to `true`)

## Sources Used

All entries are based on authoritative English-language sources including:

1. **Wikipedia** - Historical overviews and basic information
2. **Specialty Pottery Websites** - Technical details and characteristics
   - Potter Potter, Japan Objects, Artistic Nippon
3. **Cultural Organizations** - Official kiln sites and heritage organizations
4. **Gallery and Museum Sites** - Artist information and contemporary developments

Total sources referenced: 18 unique URLs across 6 entries

## Usage Instructions

This JSON file is formatted for bulk import via the API endpoint:

```
POST /api/entries/bulk
```

The file includes `"updateExisting": true` to allow updating any existing Bizen-yaki entry if present.

### Import Format Compliance

The entries comply with the `BulkEntrySchema` from `app/api/entries/bulk/route.ts`:
- All required fields are present
- Arrays are properly formatted
- Source objects include `title` and `url` fields
- Descriptions exceed 200 character minimum
- All entries are marked as `published: true`

## Key Insights

1. **Historical Continuity:** All six kilns have maintained continuous production for 850-1,000+ years
2. **Technical Diversity:** Each kiln developed unique techniques:
   - Bizen: Unglazed kiln effects
   - Tokoname: Red clay teapots
   - Seto: Glazing pioneer
   - Shigaraki: Coarse clay with feldspar
   - Tamba: Natural ash glaze
   - Echizen: Unglazed functional ware

3. **Cultural Significance:**
   - Multiple Living National Treasures associated with these traditions
   - Deep connection to tea ceremony culture
   - Designated as Japan Heritage in 2017

4. **Geographic Distribution:** Located across central and western Japan, from Fukui to Okayama

## Next Steps

1. Import entries using bulk API endpoint
2. Verify entries in database
3. Consider adding image assets for each entry
4. Link to existing artist entries where applicable
5. Create category entry for "Six Ancient Kilns" if needed

---

**Research completed by:** Claude Code Assistant
**Date:** 2026-02-25
**Quality assurance:** JSON validated, all required fields present, comprehensive descriptions provided
