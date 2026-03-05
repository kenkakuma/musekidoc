# 剩余32位作家深度搜索执行计划

**创建日期**: 2026-03-05
**当前进度**: 48/80 完成 (60%)
**剩余**: 32位作家 (40%)

## 执行状态

### 已完成批次 ✅
- Batch 1: 15位人间国宝级大师
- Batch 2: 5位大师
- Batch 3: 10位超新锐作家 (1985-1995)
- Batch 4: 14位中坚/成熟作家 (1970-1984)
- Batch 5: 4位女性及其他作家

### 剩余作家分类

根据原始搜索计划（`artist-search-plan.md`），剩余作家分为以下几批：

## 第六批：剩余中坚/成熟作家（约8-10位）

### 执行步骤
```bash
# 1. 并行搜索（每次5位）
# 2. 整理为JSON格式
# 3. 创建 data/artists-awards-exhibitions-batch-6.json
# 4. 执行更新: curl -X POST http://localhost:3000/api/admin/update-artist-awards-exhibitions -H "Content-Type: application/json" -d '{"batch": 6}'
```

### 搜索列表
1. **上田勇二** (Ueda Yuji, 1975, 滋贺信乐)
   - 搜索词: `上田勇二 陶芸 滋賀 信楽 展覧会 受賞`
   - 搜索词: `Yuji Ueda ceramic Shigaraki exhibition`

2. **吉沢寛郎** (Yoshizawa Hiro, 1974, 栃木益子)
   - 搜索词: `吉沢寛郎 陶芸 栃木 益子 展覧会`
   - 搜索词: `Yoshizawa Hiro pottery Mashiko`

3. **亀田文** (Kameda Fumi, 1973, 大分别府)
   - 搜索词: `亀田文 陶芸 大分 別府 展覧会 女性作家`
   - 搜索词: `Kameda Fumi ceramic artist Beppu`

4. **田鶴濱守人** (Tazuruhama Morito, 1973, 爱知半田)
   - 搜索词: `田鶴濱守人 陶芸 愛知 半田 展覧会`
   - 搜索词: `Tazuruhama Morito pottery Handa`

5. **石原稔久** (Ishihara Toshihisa, 1973, 福冈宫若) - 已有部分信息
   - 需补充：获奖记录

6. **其他未搜索的1970年代出生作家**

## 第七批：资深当代作家（1960年代，约5-8位）

### 搜索列表
1. **額賀章夫** (Nukaga Akio, 1963, 茨城) - 已完成 ✅

2. **石川若彦** (Ishikawa Wakahiko, 1960, 栃木益子)
   - 搜索词: `石川若彦 陶芸 益子 展覧会 受賞`
   - 搜索词: `Ishikawa Wakahiko pottery Mashiko`

3. **尾形篤** (Ogata Atsushi, 1960, 奈良宇陀)
   - 搜索词: `尾形篤 陶芸 奈良 宇陀 展覧会`
   - 搜索词: `Ogata Atsushi ceramic Nara Uda`

## 第八批：女性作家专场（约10-12位）

### 已完成女性作家 ✅
- 故金あかり (Batch 3)
- 栗原香織 (Batch 3)
- 秀野真希 (Batch 3)
- 鈴木敬子 (Batch 4)
- 厚川文子 (Batch 4)
- 吉川裕子 (Batch 5)
- 石原ゆきえ (Batch 5)
- 鳥居美希 (Batch 5)

### 待搜索女性作家
1. **小川彩** (Ogawa Aya)
   - 搜索词: `小川彩 陶芸 女性 展覧会`
   - 备用: `Aya Ogawa ceramic artist Japan`

2. **内田可織** (Uchida Kaori)
   - 搜索词: `内田可織 陶芸 女性作家 展覧会`
   - 备用: `Uchida Kaori pottery`

3. **川原幸子** (Kawahara Sachiko)
   - 搜索词: `川原幸子 陶芸 展覧会`
   - 备用: `Kawahara Sachiko ceramic`

4. **熊淵未紗** (Kumafuchi Misa)
   - 搜索词: `熊淵未紗 陶芸 女性 展覧会`
   - 备用: `Kumafuchi Misa pottery`

5. **佐藤朱理** (Sato Akari/Shuri)
   - 搜索词: `佐藤朱理 陶芸 女性 展覧会`
   - 备用: `Sato Akari ceramic artist`

6. **加藤あゐ** (Kato Ai)
   - 搜索词: `加藤あゐ 陶芸 女性 展覧会`
   - 备用: `Kato Ai pottery artist`

7. **高田かえ** (Takada Kae)
   - 搜索词: `高田かえ 陶芸 女性 展覧会`
   - 备用: `Takada Kae ceramic`

## 第九批：特殊地域/风格作家（约5-7位）

### 搜索策略
- 海外活跃作家：重点英文搜索
- 地方窑口传承：重点日文地域搜索
- 当代新锐：Instagram、画廊网站

### 待确认作家列表
需要通过以下命令获取完整未完成列表：
```bash
curl -s http://localhost:3000/api/admin/list-artists | jq '.artists | map(select((.awards | length == 0) or (.exhibitions | length == 0))) | .[].slug'
```

## 执行建议

### 每批执行时间
- 搜索阶段：30-40分钟（5位作家 × 3次搜索）
- 整理阶段：10-15分钟
- 导入验证：5分钟
- **总计每批约50-60分钟**

### 预计总时间
- 第六批：1小时
- 第七批：1小时
- 第八批：1.5小时
- 第九批：1小时
- **总计：约4.5-5小时**

## 质量检查清单

每批完成后验证：
- [ ] 每位作家至少2个奖项或成就
- [ ] 每位作家至少2个展览记录
- [ ] exhibitionCount已估算
- [ ] 至少2个可靠来源
- [ ] JSON格式正确无误
- [ ] API返回success: true

## 快速恢复命令

### 查看当前状态
```bash
curl -s http://localhost:3000/api/admin/list-artists | jq '.analysis'
```

### 执行下一批
```bash
# 1. 搜索并创建JSON
# 2. 执行导入
curl -X POST http://localhost:3000/api/admin/update-artist-awards-exhibitions \
  -H "Content-Type: application/json" \
  -d '{"batch": 6}'
```

### 查看未完成作家
```bash
curl -s http://localhost:3000/api/admin/list-artists | \
  jq '.artists | map(select((.awards | length == 0) or (.exhibitions | length == 0))) |
  .[] | {slug, nameZh, nameJa, birthYear}'
```

## 注意事项

1. **搜索效率**：
   - 优先日文搜索（成功率更高）
   - 英文搜索作为补充
   - 画廊网站直接查询
   - Instagram作为辅助

2. **信息不足应对**：
   - 如果3次搜索仍无结果，标注"暂无公开资料"
   - 记录基础信息（出生年、地域、风格）
   - 可补充艺术家陈述或工艺特点

3. **Token管理**：
   - 每批完成后休息
   - 控制单次搜索深度
   - 优先完成高优先级作家

## 下次执行时

1. 读取此文档
2. 查看当前完成度
3. 从第六批开始执行
4. 每批完成后更新此文档进度
5. 最终达成80/80完成度 🎯
