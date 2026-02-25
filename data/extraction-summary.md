# 作家信息提取总结

## 执行日期
2026-02-25

## 源文件
E:\musekidoc\docs\pottery_kb.md

## 提取结果

### Batch 2: 普通作家 (artists-batch-2.json)
- **文件位置**: E:\musekidoc\data\artists-batch-2.json
- **作家数量**: 38位
- **数据来源**: pottery_kb.md 第6-295行（普通作家条目）
- **特点**:
  - 所有作家均有完整的中文简介（bio字段 ≥ 50字）
  - 所有作家均有至少1个有效参考来源URL
  - 移除了所有 null 值字段
  - 已跳过已导入的3位作家（hatta-toru, kurokawa-toru, iguchi-daisuke）

### Batch 3: Instagram人气作家 (artists-batch-3.json)
- **文件位置**: E:\musekidoc\data\artists-batch-3.json
- **作家数量**: 17位
- **数据来源**: pottery_kb.md 第296行开始（Instagram作家条目）
- **筛选标准**: Instagram粉丝数 ≥ 10,000
- **特点**:
  - 包含 instagramHandle 字段（不含@符号）
  - 包含 instagramFollowers 字段（粉丝数）
  - 所有作家均有完整的简介和来源
  - 已跳过已导入的作家

## 作家列表

### Batch 2 普通作家（38位）
1. 村木雄児 (muraki-yuji) - 1953年生，静冈伊东市
2. 田鶴濱守人 (tazuruhama-morito) - 1973年生，爱知县半田市
3. 高田谷将宏 (takataya-masahiro) - 常滑
4. 石原祥充 (ishihara-yoshimitsu) - 福冈县宫若市
5. 石原稔久 (ishihara-toshihisa) - 1973年生，福冈县宫若市
6. 山田隆太郎 (yamada-ryutaro) - 1984年生，神奈川县相模原市
7. 川原幸子 (kawahara-sachiko) - 福冈
8. 稲吉善光 (inayoshi-yoshimitsu) - 茨城县笠间市
9. 尾形篤 (ogata-atsushi) - 1960年生，奈良县宇陀市
10. 岩切秀央 (iwakiri-shuo) - 1991年生
11. 二階堂明弘 (nikaido-akihiro) - 1977年生
12. 内田鋼一 (uchida-koichi) - 1969年生
13. 成田周平 (narita-shuhei)
14. 大谷哲也 (otani-tetsuya) - 1971年生，信乐
15. 熊淵未紗 (kumabuchi-misa) - 兵库县
16. 石原ゆきえ (ishihara-yukie) - 爱知县津岛市
17. 加藤惠津子 (kato-etsuko)
18. 厚川文子 (atsukawa-fumiko) - 1975年生，岐阜县多治见
19. 高田かえ (takada-kae)
20. 加藤あゐ (kato-ai) - 长野
21. 故金あかり (kokane-akari) - 1995年生，多治见市
22. 内田可織 (uchida-kaori)
23. 佐藤朱理 (sato-akari) - 岐阜
24. 鈴木敬子 (suzuki-keiko) - 1982年生，福冈
25. 鳥居美希 (torii-miki)
26. 五嶋穂波 (goshima-honami) - 岐阜县瑞浪市
27. 水谷智美 (mizutani-tomomi)
28. 秀野真希 (shuno-maki) - 1986年生，京都府南丹市
29. 掛谷康樹 (kakeya-koki) - 1969年生，广岛县福山市
30. 石川若彦 (ishikawa-wakahiko) - 1960年生，益子
31. 山脇将人 (yamawaki-masato) - 南九州宫崎
32. 山田洋次 (yamada-yoji)
33. 下村淳 (shimomura-atsushi) - 1985年生，神奈川县相模原
34. 馬野真吾 (umano-shingo) - 1987年生，德岛县阿波市
35. 片瀬和宏 (katase-kazuhiro) - 爱知县丰田市
36. 渡辺隆之 (watanabe-takayuki) - 1981年生，伊豆の国市
37. 亀田文 (kameda-fumi) - 1973年生，大分县别府市
38. 吉川裕子 (yoshikawa-yuko)
39. 吉沢寛郎 (yoshizawa-hiroo) - 1974年生，益子町
40. 岩田哲宏 (iwata-tetsuhiro) - 1981年生，东京

### Batch 3 Instagram人气作家（17位）
1. 岩崎龍二 (iwasaki-ryuji) - 92,000粉丝 - 大阪富田林
2. 酒井智也 (sakai-tomoya) - 71,300粉丝 - 1989年生，濑户
3. 遠藤岳 (endo-takashi) - 53,500粉丝 - 神奈川
4. 桑田卓郎 (kuwata-takuro) - 53,400粉丝 - 1981年生，岐阜多治见
5. 栗原香織 (kurihara-kaori) - 45,800粉丝 - 1987年生，巴黎
6. 瀬川裕太 (segawa-yuta) - 36,000粉丝 - 1988年生，伦敦
7. 石田和也 (ishida-kazuya) - 29,600粉丝 - 1986年生，备前
8. 竹内真吾 (takeuchi-shingo) - 26,500粉丝 - 1955年生，濑户
9. 福村龍太 (fukumura-ryuta) - 24,100粉丝 - 1989年生，福冈县うきは市
10. 額賀章夫 (nukaga-akio) - 23,600粉丝 - 1963年生，茨城
11. 浜田友緒 (hamada-tomoo) - 23,400粉丝 - 1967年生，益子
12. 橋本知成 (hashimoto-tomonari) - 17,800粉丝 - 1990年生，信乐
13. 氏家昂大 (ujiie-kodai) - 17,200粉丝 - 1990年生，岐阜多治见
14. 佐藤尚理 (sato-naomichi) - 15,200粉丝
15. 上田勇二 (ueda-yuji) - 13,400粉丝 - 1975年生，滋贺信乐
16. 星野友幸 (hoshino-tomoyuki) - 11,400粉丝 - 1976年生，东京国分寺
17. 小川彩 (ogawa-aya) - 11,826粉丝 - 东京

## 跳过的作家（已导入）
1. 八田亨 (hatta-toru)
2. 黒川徹 (kurokawa-toru)
3. 井口大輔 (iguchi-daisuke)

## 数据质量检查

### 必填字段完整性
- ✅ slug: 所有作家都有唯一的URL友好slug
- ✅ nameZh: 所有作家都有中文名
- ✅ bio: 所有作家的简介都 ≥ 50字
- ✅ sources: 所有作家都至少有1个有效参考来源
- ✅ published: 所有作家都设置为 true

### 可选字段覆盖率
- birthYear: ~60% 作家有出生年份
- region: ~75% 作家有工作地信息
- style: ~80% 作家有风格描述
- instagramHandle: 仅Batch 3包含
- instagramFollowers: 仅Batch 3包含

### Slug命名规范
- 格式: 姓名拼音小写，用连字符分隔
- 示例: muraki-yuji, kumabuchi-misa, iwasaki-ryuji
- 已确保所有slug唯一且符合URL规范

## 使用方法

### 导入到数据库
```bash
# 导入普通作家
curl -X POST http://localhost:3000/api/artists/batch \
  -H "Content-Type: application/json" \
  -d @data/artists-batch-2.json

# 导入Instagram人气作家
curl -X POST http://localhost:3000/api/artists/batch \
  -H "Content-Type: application/json" \
  -d @data/artists-batch-3.json
```

### JSON文件格式
```json
{
  "artists": [...],
  "updateExisting": false
}
```

## 注意事项
1. 所有null值字段已自动移除
2. 姓名拼音转换基于常见日语读音，建议在导入前核对
3. Instagram粉丝数为第三方统计数据，可能与实时数据有差异
4. 部分作家的nameJa、nameEn等字段因源文件未提供而省略
5. exhibitions字段未包含，因大部分展览信息为文本描述而非结构化数据

## 生成脚本
E:\musekidoc\scripts\extract_artists.py
