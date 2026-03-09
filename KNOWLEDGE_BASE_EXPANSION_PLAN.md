# 知识库扩展计划

**创建日期**: 2026-03-07
**当前状态**: 93 位作家，195 个条目
**目标**: 构建全面的日本陶艺知识库

---

## 📊 当前状态分析

### 作家数据现状

| 指标 | 数值 | 覆盖率 |
|------|------|--------|
| 总作家数 | 93 | - |
| 有 Instagram | 35 | 38% ⚠️ |
| 有粉丝数据 | 0 | 0% ❌ |
| 有官方网站 | 16 | 17% ⚠️ |
| 有窑场信息 | 82 | 88% ✅ |
| 有头像图片 | 0 | 0% ❌ |
| 有出生年份 | 69 | 74% 🟡 |

### 年代分布

| 年代 | 数量 | 占比 | 状态 |
|------|------|------|------|
| 1990后 (Z世代) | 4 | 4% | ❌ 严重不足 |
| 1980-1989 (千禧一代) | 14 | 15% | ⚠️ 不足 |
| 1960-1979 (X世代) | 20 | 22% | 🟡 尚可 |
| 1940-1959 (战后一代) | 5 | 5% | ⚠️ 不足 |
| 1920-1939 (战前一代) | 8 | 9% | 🟡 尚可 |
| 1920前 (明治/大正) | 18 | 19% | ✅ 充分 |
| 未知年代 | 24 | 26% | ❌ 需补充 |

### 内容类型分布

| 类型 | 数量 | 状态 |
|------|------|------|
| 窑系/产地 | 48 | ✅ 充分 |
| 技法相关 | 72 | ✅ 充分 |
| 器物用途 | 28 | 🟡 可扩展 |
| 历史文化 | 29 | 🟡 可扩展 |
| 基础知识 | 24 | 🟡 可扩展 |

---

## 🎯 扩展优先级（P0-P3）

### P0 - 关键缺失（立即执行）

#### 1. Instagram 粉丝数据抓取 🔥

**目标**: 为所有有 Instagram 的作家补充粉丝数据

**执行计划**:
```javascript
// 使用 Instagram API 或爬虫抓取粉丝数
// 目标：35 位现有作家 + 新发现作家
{
  "instagramHandle": "karugane_akari",
  "instagramFollowers": 15000,
  "instagramLastSync": "2026-03-07"
}
```

**预期收益**:
- 可按影响力排序作家
- 识别高人气年轻作家
- 支持推荐算法

**技术方案**:
1. Instagram Graph API (需要官方权限)
2. 第三方 API 服务 (SocialBlade, HypeAuditor)
3. 轻量级爬虫（遵守 robots.txt）

---

#### 2. 收录 Instagram 粉丝 10K+ 日本陶艺作家 🔥

**目标**: 发现并收录 Instagram 粉丝 ≥10,000 的日本陶艺作家

**搜索策略**:
- **Hashtag 搜索**:
  - `#うつわ` (器皿) - 1M+ posts
  - `#陶芸` (陶艺) - 500K+ posts
  - `#陶器` (陶器) - 300K+ posts
  - `#やきもの` (烧物) - 200K+ posts
  - `#ceramic` + `#japan`
  - `#pottery` + `#japanese`

- **账号类型筛选**:
  - Profile bio 包含：陶芸家、pottery、ceramic artist
  - Location: Japan 或日本各地
  - 粉丝数 ≥ 10,000

- **预计收录数量**: 50-100 位新作家

**数据采集要求**:
```json
{
  "artistSlug": "artist-name",
  "nameZh": "中文名",
  "nameJa": "日本名",
  "nameEn": "English Name",
  "bio": "作家简介 (200-300字)",
  "instagramHandle": "handle_name",
  "instagramFollowers": 15000,
  "websiteUrl": "从 Instagram bio 提取",
  "birthYear": "推测或查找",
  "region": "工作室所在地",
  "style": "作品风格",
  "sources": [
    {
      "url": "https://www.instagram.com/handle_name/",
      "title": "Instagram @handle_name",
      "type": "社交媒体"
    }
    // 至少需要3个来源
  ]
}
```

**执行步骤**:
1. **第一阶段**: 自动抓取 Instagram 账号列表（粉丝数 10K+）
2. **第二阶段**: 人工审核确认是日本陶艺作家
3. **第三阶段**: 补充基础信息（姓名、简介、产地）
4. **第四阶段**: 搜索补充来源（至少3个）
5. **第五阶段**: 导入数据库

---

#### 3. 作家头像图片采集 🔥

**目标**: 为所有 93 位作家添加头像

**来源优先级**:
1. Instagram profile picture (最新)
2. 官方网站头像
3. 展览海报/宣传照
4. 新闻报道配图

**技术规格**:
- 格式: JPG/PNG
- 尺寸: 至少 400x400px
- 存储: Supabase Storage 或 CDN
- 文件名: `{artistSlug}-avatar.jpg`

**版权处理**:
- 优先使用公开的官方宣传照
- 标注来源 URL
- 遵守 CC 协议或获取授权

---

### P1 - 重要补充（30天内）

#### 4. 年轻作家扩展 (1980后)

**目标**: 将 1980后作家从 18 位增加到 50+ 位

**搜索重点**:
- Instagram 粉丝 5K-20K 的年轻作家
- 参加过当代陶艺展的新锐作家
- 益子、信乐、美浓等年轻作家聚集地

**重点平台**:
- Instagram: `#若手陶芸家` (年轻陶艺家)
- KOGEI Art Fair Kanazawa 参展作家
- 日本当代陶艺协会新人奖获得者

**预期收录**: 30-40 位

---

#### 5. 补充作家基础信息

**目标**: 填补 24 位缺失出生年份的作家信息

**信息来源**:
- 作家官网传记
- 画廊资料
- 美术馆展览目录
- 新闻报道

**补充字段**:
- `birthYear` (24 位)
- `deathYear` (5 位疑似已故)
- `websiteUrl` (77 位)
- `avatar` (93 位全部)

---

#### 6. 器物类型条目扩展

**目标**: 从 28 个增加到 50+ 个

**新增类型**:
- **茶道具细分**:
  - 抹茶碗 (详细分类：乐茶碗、萩茶碗、志野茶碗等)
  - 水指 (水罐)
  - 建水 (废水器)
  - 香合 (香盒)

- **酒器细分**:
  - 德利 (酒壶)
  - 猪口 (酒杯)
  - ぐい呑み (小酒杯)

- **日用器细分**:
  - 饭碗
  - 汤碗
  - 盘子 (大皿、小皿、取皿)
  - 花器

**每个条目包含**:
- 器型定义
- 历史演变
- 尺寸规格
- 使用场景
- 代表作家
- 图片示例

---

### P2 - 内容深化（60天内）

#### 7. 历史文化内容扩展

**目标**: 从 29 个增加到 60+ 个

**新增主题**:

**美学思想系列**:
- わび・さび (侘寂) 深度解析
- もののあわれ (物哀) 与陶艺
- 幽玄 (幽玄) 美学
- 渋み (涩味) 概念

**历史人物系列**:
- 千利休与茶道美学
- 河井寛次郎与民艺运动
- 北大路魯山人与美食器
- 富本宪吉与现代陶艺

**历史事件系列**:
- 桃山时代茶陶革命
- 明治维新对陶艺的影响
- 战后陶艺复兴
- 当代陶艺国际化

---

#### 8. 技法类条目深化

**目标**: 为现有 72 个技法条目增加视频/图解

**增强内容**:
- 技法演示视频链接 (YouTube)
- 分步图解教程
- 工具材料清单
- 常见问题解答
- 大师技法对比

**新增技法**:
- **成型技法**:
  - 紐作り (盘条法)
  - タタラ (板作法)
  - 鋳込み (注浆法)

- **装饰技法细分**:
  - 象嵌 (镶嵌) 的 10 种变体
  - 掻き落とし (刮花) 技法
  - 印花技法

---

#### 9. 产地窑系条目扩展

**目标**: 补充中小窑系，从 48 个增加到 80+ 个

**新增产地**:
- **北海道**: 小樽烧
- **东北**: 会津本乡烧、相马烧
- **关东**: 笠间烧、结城紬烧
- **中部**: 小石原烧、高田烧
- **关西**: 丹波立杭烧、赤膚烧
- **中国**: 布志名烧、出西窑
- **四国**: 砥部烧
- **九州**: 小鹿田烧、波佐见烧

**每个产地包含**:
- 历史沿革（建立年代、发展历程）
- 地理位置（都道府县、具体地区）
- 代表特征（土质、釉色、技法）
- 代表窑场（3-5 个）
- 代表作家（5-10 位）
- 参观信息（窑址、美术馆）

---

### P3 - 高级功能（90天内）

#### 10. 作家关系网络

**目标**: 构建作家间的师承、合作、影响关系

**数据结构**:
```json
{
  "artistId": "uuid",
  "relationships": [
    {
      "relatedArtistId": "uuid",
      "type": "师承", // 师承、学生、合作、影响、同窑
      "description": "关系描述",
      "startYear": 1980,
      "endYear": 2000
    }
  ]
}
```

**可视化**:
- 师承谱系图
- 影响力网络图
- 同窑艺术家关系

---

#### 11. 作品图片库

**目标**: 为每位作家收录 10-20 件代表作品

**数据结构**:
```json
{
  "workId": "uuid",
  "artistId": "uuid",
  "title": "作品名称",
  "year": 2020,
  "category": "茶碗",
  "technique": "志野釉",
  "dimensions": "高12cm × 直径15cm",
  "description": "作品描述",
  "images": ["url1", "url2"],
  "collection": "收藏机构",
  "price": "市场价格区间"
}
```

---

#### 12. 展览与活动数据

**目标**: 收录当代作家的展览信息

**数据来源**:
- KOGEI Art Fair
- 各大画廊展讯
- 美术馆特展
- 作家个展

**实时更新**:
- 每月抓取最新展讯
- 自动更新作家 exhibitions 字段

---

## 🛠️ 技术实现方案

### Instagram 粉丝数据抓取

**方案 A: Instagram Graph API**
```javascript
// 需要 Facebook Developer 账号
const getFollowerCount = async (username) => {
  const response = await fetch(
    `https://graph.instagram.com/v12.0/${username}?fields=followers_count&access_token=${TOKEN}`
  );
  return response.json();
};
```

**方案 B: 第三方 API**
- SocialBlade API
- Instagram Scraper NPM packages
- Apify Instagram scrapers

**方案 C: 自建爬虫**
```javascript
// 使用 Playwright 抓取公开数据
const getInstagramData = async (handle) => {
  const page = await browser.newPage();
  await page.goto(`https://www.instagram.com/${handle}/`);

  const data = await page.evaluate(() => {
    const metaTag = document.querySelector('meta[property="og:description"]');
    const content = metaTag?.content || '';
    const match = content.match(/(\d+[\d,]*) Followers/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  });

  return data;
};
```

---

### 作家发现自动化流程

```javascript
// 1. Hashtag 搜索
const searchHashtags = ['うつわ', '陶芸', '陶器', 'やきもの'];

// 2. 提取账号
const extractAccounts = async (hashtag) => {
  // 获取使用该 hashtag 的账号列表
  // 筛选：followers >= 10000
  // 筛选：bio 包含 "陶" / "pottery" / "ceramic"
};

// 3. 数据验证
const validateArtist = (account) => {
  return (
    account.followers >= 10000 &&
    account.bio.match(/陶|pottery|ceramic/i) &&
    account.location.match(/japan|日本|JP/i)
  );
};

// 4. 信息补充
const enrichArtistData = async (account) => {
  return {
    instagramHandle: account.username,
    instagramFollowers: account.followers,
    websiteUrl: extractWebsiteFromBio(account.bio),
    // 需要人工补充的字段
    nameZh: null,
    nameJa: null,
    birthYear: null,
    bio: null,
    sources: [] // 需要搜索补充
  };
};
```

---

## 📅 实施时间表

### 第一周 (3/7 - 3/14)
- [ ] 开发 Instagram 粉丝数抓取脚本
- [ ] 为现有 35 位作家补充粉丝数
- [ ] 开始搜索 10K+ 粉丝作家（目标：发现 30 位）

### 第二周 (3/14 - 3/21)
- [ ] 收录 30 位新作家（10K+ 粉丝）
- [ ] 补充 3+ 来源
- [ ] 开始采集作家头像（目标：50 位）

### 第三周 (3/21 - 3/28)
- [ ] 继续收录新作家（目标：再增加 20 位）
- [ ] 完成所有现有作家头像采集
- [ ] 补充缺失的出生年份（24 位）

### 第四周 (3/28 - 4/4)
- [ ] 扩展器物类型条目（新增 20 个）
- [ ] 开始历史文化内容创作
- [ ] 数据质量审核

---

## 🎯 阶段性目标

### 30 天目标 (4月初)
- 作家数量: 93 → **150+** (增加 60%)
- Instagram 覆盖: 38% → **80%**
- 粉丝数据: 0% → **100%**
- 头像覆盖: 0% → **100%**
- 年轻作家 (1980后): 18 → **50+**

### 60 天目标 (5月初)
- 作家数量: **200+**
- 条目数量: 195 → **300+**
- 器物类型: 28 → **50+**
- 历史文化: 29 → **60+**
- 产地窑系: 48 → **80+**

### 90 天目标 (6月初)
- 作家数量: **250+**
- 条目数量: **400+**
- 作品图片库启动
- 作家关系网络上线
- 展览活动数据接入

---

## 💡 优先执行建议

基于当前分析，**立即执行以下 3 项**:

1. **Instagram 粉丝数据抓取** (最快见效)
   - 技术难度: 低
   - 时间成本: 2-3 天
   - 价值: 高 (支持排序、推荐)

2. **收录 10K+ 粉丝作家** (最大增量)
   - 预计新增: 50-100 位
   - 时间成本: 2-3 周
   - 价值: 极高 (填补年轻作家空白)

3. **作家头像采集** (用户体验提升)
   - 技术难度: 低
   - 时间成本: 1 周
   - 价值: 高 (视觉体验大幅提升)

---

**需要立即开始吗？我可以帮你创建自动化脚本开始执行！**
