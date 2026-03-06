# Japanese Pottery Source Index Guide

## Purpose

This document summarizes the source patterns used during the latest Japanese pottery enrichment pass so future indexing, retrieval, and source ranking can be more accurate and repeatable.

## Recommended Source Priority

Use this ranking when selecting or replacing sources.

1. Official institution or museum
- Best for: historical artists, terminology, canonical works, cultural-property validation, exhibition history
- Confidence: highest
- Examples:
  - `https://artplatform.go.jp/`
  - `https://www.momat.go.jp/`
  - `https://mingeikan.or.jp/`
  - `https://bunka.nii.ac.jp/`

2. Artist-owned site or kiln site
- Best for: biography basics, kiln/studio name, location, current activity, official profile
- Confidence: high
- Examples:
  - `https://www.suzuki-osamu.jp/`
  - `https://watanabetakayuki.com/`
  - `https://www.nakazato-taroemon.com/`
  - `https://www.hagiyaki-miwa.com/`

3. Association, craft body, or official glossary
- Best for: terminology, process definitions, category explanations
- Confidence: high
- Examples:
  - `https://yakimono.or.jp/information/glossary`
  - `https://hagi-tougei.com/hagiyaki_about/until/`

4. Museum-adjacent exhibition pages and cultural programs
- Best for: verified exhibition records, artist summaries, curatorial framing
- Confidence: medium-high
- Examples:
  - `https://www.cpm-gifu.jp/`
  - `https://fpf.kacf.jp/`
  - `https://www.mashiko-museum.jp/`

5. Gallery and curated commerce pages
- Best for: contemporary artist profiles, current works, medium/style clues, supplemental bio facts
- Confidence: medium
- Examples:
  - `https://www.monoina.com/`
  - `https://www.kikikikraft.com/`
  - `https://www.g-call.com/`
  - `https://www.gendai-tojiki.com/`
  - `https://www.art-onthetable.com/`

6. Lifestyle, design, and exhibition media
- Best for: interviews, maker visits, context, contemporary visibility, exhibition confirmation
- Confidence: medium
- Examples:
  - `https://www.chilchinbito-hiroba.jp/`
  - `https://brutus.jp/`
  - `https://paperc.info/`
  - `https://highsnobiety.jp/`

7. E-commerce pages
- Best for: contemporary long-tail artists when better sources are scarce; can confirm spelling, medium, and active circulation
- Confidence: medium-low
- Use only as supporting evidence, not sole authority for major claims
- Examples:
  - `https://kohoro.jp/`
  - `https://shop.senchado.jp/`
  - `https://coverchord.com/`
  - `https://www.hanautsuwa.jp/`

8. Instagram and artist social accounts
- Best for: active handle confirmation, current activity, studio/website linkage
- Confidence: support-only unless clearly artist-owned
- Use to complement, not replace, institutional/profile sources
- Pattern used in script: `https://www.instagram.com/<handle>/`

## Source Types That Worked Best By Content Class

### Historical artists
Use in this order:
- museum collection page
- Art Platform Japan record
- official kiln/foundation page
- cultural heritage page

Good examples:
- `https://artplatform.go.jp/ja/collections/W811580`
- `https://mingeikan.or.jp/collection_series/hamada_shoji/`
- `https://www.momat.go.jp/craft-museum/exhibitions/570`
- `https://bunka.nii.ac.jp/`

### Contemporary artists
Use in this order:
- artist-owned site or Instagram
- institution/exhibition page
- gallery profile
- curated shop profile
- lifestyle media feature

Good examples:
- `https://www.art-onthetable.com/blogs/artsit-visit/masato-yamawaki`
- `https://www.gendai-tojiki.com/44-yuji-ueda`
- `https://www.chilchinbito-hiroba.jp/event/26511/`
- `https://kogei-artfair.jp/artists/513/`

### Terminology and process entries
Use in this order:
- association glossary
- official museum or heritage explanation
- specialized craft reference or materials supplier page

Good examples:
- `https://yakimono.or.jp/information/glossary`
- `https://bunka.nii.ac.jp/heritages/detail/77352`
- `https://artplatform.go.jp/ja/collections/W509352`
- `https://www.okamoto-syouten.com/`
- `https://www.tougeishop.com/`

## Retrieval Strategy

### Query patterns that performed well

For historical artists:
- `"<artist name>" museum`
- `"<artist name>" artplatform`
- `"<artist name>" 文化遺産`
- `"<artist name>" official`

For contemporary artists:
- `"<artist name>" 陶芸`
- `"<artist name>" 個展`
- `"<artist name>" うつわ`
- `"<artist name>" instagram`
- `"<artist name>" monoina`
- `"<artist name>" kohoro`

For terminology/process:
- `"<term>" 陶芸 用語`
- `"<term>" 焼成`
- `"<term>" 釉薬`
- `site:yakimono.or.jp "<term>"`

## Indexing Rules

### For source normalization
Store each source as:
- `title`
- `url`
- `type`

### For source deduplication
Deduplicate by canonical URL, not title.
Reason: same source may appear with different titles over time.

### For source classification
Use these labels consistently:
- `官方资料`
- `机构资料`
- `作家官网`
- `协会资料`
- `画廊资料`
- `电商`
- `电商/展讯`
- `生活方式媒体`
- `展讯媒体`
- `辞书`
- `工艺资料`
- `专题资料`
- `社交媒体`

## Known Risks

1. Common-name contemporary artists
- Risk: wrong gallery/shop match
- Mitigation: require at least one cross-check from Instagram, exhibition page, or artist-owned source

2. E-commerce pages overstating profile info
- Risk: marketing copy presented as biography fact
- Mitigation: use for support, not for unique claims like awards or kiln history unless corroborated

3. Noisy Instagram handles
- Risk: placeholder or malformed handles
- Mitigation: normalize and verify before converting to a source URL

4. Generic glossary pages
- Risk: page covers many terms, not always term-specific
- Mitigation: acceptable as secondary support for terminology, not sole source for technical assertions

## Recommended Next Index Expansion

Priority domains to keep searching:
- `artplatform.go.jp`
- `bunka.nii.ac.jp`
- `momat.go.jp`
- `mingeikan.or.jp`
- `yakimono.or.jp`
- regional museum domains
- artist-owned domains
- reputable gallery domains with profile pages
- curated Japanese pottery shops with detailed maker pages

Use lower priority only as support:
- general shopping marketplaces
- generic blogs
- repost accounts without artist confirmation
