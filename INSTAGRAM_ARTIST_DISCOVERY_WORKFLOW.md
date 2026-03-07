# Instagram 高人气作家发现与导入工作流

**目标**: 通过 Instagram 搜索粉丝 10K+ 的日本陶艺作家，补充到知识库

---

## 📋 完整流程（4 个步骤）

### 步骤 1: Instagram 搜索与筛选

#### 1.1 访问 Instagram 搜索

打开 Instagram 网页版或 App，搜索以下 hashtags：

**日语 Hashtags**（推荐，结果更精准）：
- `#うつわ` (器皿) - 1M+ 帖子 ⭐ 最佳
- `#陶芸` (陶艺) - 500K+ 帖子 ⭐ 最佳
- `#陶器` (陶器) - 300K+ 帖子
- `#やきもの` (烧物) - 200K+ 帖子
- `#陶芸家` (陶艺家) - 专业作家
- `#うつわ好き` (器皿爱好者)
- `#うつわのある暮らし` (有器皿的生活)

**英语 Hashtags**（补充搜索）：
- `#japanesepottery`
- `#japaneseceramics`
- `#ceramicartist` + location: Japan

#### 1.2 筛选标准

**必须满足**：
- ✅ 粉丝数 ≥ 10,000
- ✅ Bio 包含陶艺关键词：陶芸/pottery/ceramic/窯/作家
- ✅ 地点显示日本或日本地名
- ✅ 帖子内容确认是陶艺作品（非转发、非收藏品展示）

**加分项**：
- 🌟 有官方网站链接
- 🌟 标注窑场/工作室名称
- 🌟 显示地点信息
- 🌟 参加过知名展览（KOGEI Art Fair 等）

#### 1.3 记录信息

对于每位符合条件的作家，记录：

```
Instagram 用户名: @username
显示名称: 日文名字
粉丝数: 15,000
Bio: 陶芸家｜益子焼｜https://website.com
地点: 栃木県益子町
```

---

### 步骤 2: 使用发现工具生成模板

#### 2.1 打开脚本文件

编辑 `scripts/discover-instagram-artists.js`

#### 2.2 填入发现的作家数据

找到 `DISCOVERED_ARTISTS` 数组，按格式添加：

```javascript
const DISCOVERED_ARTISTS = [
  {
    username: 'example_username',      // Instagram 用户名（不含 @）
    displayName: '山田太郎',           // Instagram 显示名
    followers: 25000,                  // 粉丝数
    bio: '陶芸家｜益子焼｜https://example.com', // Bio 原文
    profilePicUrl: null                // 保持 null，后续自动提取
  },
  {
    username: 'another_artist',
    displayName: '佐藤花子',
    followers: 18000,
    bio: '陶器作家｜信楽',
    profilePicUrl: null
  },
  // 继续添加...
];
```

#### 2.3 运行脚本生成模板

```bash
node scripts/discover-instagram-artists.js
```

**输出**：
- 生成文件：`data/discovered-artists-batch.json`
- 包含自动提取的信息：
  - Instagram 账号和粉丝数 ✅
  - 从 Bio 提取的网站链接 ✅
  - 从 Bio 提取的地点信息 ✅
- 标记需要补充的字段 ⚠️

---

### 步骤 3: 补充作家信息

#### 3.1 打开生成的模板

编辑 `data/discovered-artists-batch.json`

#### 3.2 逐个补充必填字段

对于每位作家，需要补充：

**基础信息**：
```json
{
  "artistSlug": "yamada-taro",        // 🔧 改为合适的 URL slug
  "nameZh": "山田太郎",                // 🔧 添加中文名
  "nameJa": "山田太郎",                // ✅ 已自动填充
  "nameEn": "Taro Yamada",           // 🔧 添加英文名（可选）

  "bio": "山田太郎，1985年生于栃木县益子町...", // 🔧 补充完整简介（200-300字）
  "birthYear": 1985,                  // 🔧 搜索补充出生年份
  "region": "栃木县",                  // 🔧 确认产地
  "style": "现代益子烧，简约自然风格",  // 🔧 补充作品风格
}
```

**窑场/工作室信息**（如果能找到）：
```json
{
  "kilnName": "山田窑",
  "studioName": "太郎工房",
  "locationPrefecture": "栃木県",
  "locationCity": "益子町",
  "locationArea": "城内坂"
}
```

**来源补充** ⭐ 重要：
```json
{
  "sources": [
    {
      "url": "https://www.instagram.com/username/",
      "title": "Instagram @username",
      "type": "社交媒体",
      "accessedAt": "2026-03-07"
    },
    // 🔧 必须添加至少 2 个额外来源
    {
      "url": "https://artist-website.com",
      "title": "山田太郎 公式网站",
      "type": "作家官网",
      "accessedAt": "2026-03-07"
    },
    {
      "url": "https://gallery.com/artist/yamada",
      "title": "XX画廊 山田太郎页面",
      "type": "画廊资料",
      "accessedAt": "2026-03-07"
    }
  ]
}
```

#### 3.3 寻找额外来源的方法

**Google 搜索**：
```
"山田太郎" 陶芸
"山田太郎" 益子焼
"Taro Yamada" pottery
```

**推荐来源类型**（按优先级）：
1. ✅ 作家官方网站
2. ✅ 画廊页面（代理画廊）
3. ✅ 展览记录（KOGEI Art Fair、美术馆展讯）
4. ✅ 媒体报道（BRUTUS、チルチンびと等）
5. ✅ 电商平台（KOHORO、日常茶飯等）

**验证来源质量**：
- 确保 URL 可访问
- 内容确实关于该作家
- 避免重复相似来源

#### 3.4 标记为已完成

信息补充完整后：
```json
{
  "published": true,        // 🔧 改为 true
  "needsReview": false      // 🔧 改为 false
}
```

---

### 步骤 4: 导入数据库

#### 4.1 验证数据质量

运行验证脚本（创建中...）：
```bash
node scripts/validate-discovered-artists.js
```

检查：
- ✅ 所有必填字段已填写
- ✅ 至少 3 个来源
- ✅ artistSlug 唯一且格式正确
- ✅ URL 格式正确

#### 4.2 执行导入

```bash
node scripts/import-discovered-artists.js
```

**导入流程**：
1. 读取 `data/discovered-artists-batch.json`
2. 筛选 `published: true` 的作家
3. 检查是否已存在（按 artistSlug 或 instagramHandle）
4. 插入新作家到数据库
5. 生成导入报告

#### 4.3 验证导入结果

```bash
node scripts/verify-import.js
```

检查：
- 数据库作家总数是否增加
- 新作家 Instagram 信息是否正确
- 来源数据是否完整

---

## 📊 批量处理建议

### 第一批：小规模测试（5-10 位）

**目标**: 验证流程，调整模板

1. 选择 5-10 位明确符合标准的作家
2. 完整补充所有信息
3. 导入并验证
4. 总结问题，优化流程

**预计时间**: 4-6 小时

---

### 第二批：中等规模（20-30 位）

**目标**: 扩大规模，建立信息补充流程

1. 重点搜索特定产地（益子、信乐、美浓等）
2. 按产地分批处理
3. 建立来源搜索快捷方式

**预计时间**: 2-3 天

---

### 第三批：大规模（50+ 位）

**目标**: 系统化量产

1. 可以考虑多人协作
2. 使用自动化工具辅助（如果开发）
3. 建立质量审核机制

**预计时间**: 1-2 周

---

## 🔧 自动化增强（可选）

### 使用 Playwright 自动提取 Instagram 数据

如果手动复制粘贴太慢，可以使用浏览器自动化：

```javascript
// scripts/auto-extract-instagram.js
const { chromium } = require('playwright');

async function extractInstagramData(username) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(`https://www.instagram.com/${username}/`);

  const data = await page.evaluate(() => {
    // 提取粉丝数
    const followersText = document.querySelector('a[href*="/followers/"] span')?.textContent;

    // 提取 Bio
    const bio = document.querySelector('section > main h1')?.parentElement?.parentElement?.querySelector('span')?.textContent;

    return {
      followers: followersText,
      bio: bio
    };
  });

  await browser.close();
  return data;
}
```

**注意**: Instagram 可能有反爬虫措施，建议：
- 添加延迟（避免过快请求）
- 使用已登录的浏览器 session
- 遵守 Instagram 使用条款

---

## 📝 数据质量标准

### 最低标准（必须满足才能导入）

- ✅ Instagram 账号有效且粉丝 ≥ 10,000
- ✅ 中文名或日文名至少一个
- ✅ 简介至少 100 字
- ✅ 至少 3 个来源（包括 Instagram）
- ✅ 产地信息（至少到都道府县级别）

### 推荐标准（追求高质量）

- 🌟 中文名、日文名、英文名齐全
- 🌟 简介 200-300 字
- 🌟 至少 5 个来源，包括：
  - Instagram
  - 官方网站或画廊页面
  - 展览记录或媒体报道
  - 至少 1 个机构来源（美术馆/协会）
- 🌟 出生年份
- 🌟 窑场/工作室信息
- 🌟 作品风格描述

---

## 🎯 推荐搜索策略

### 按产地搜索

**益子烧** (`#益子焼` + `#益子`)：
- 年轻作家多
- Instagram 活跃度高
- 预计可找到 20-30 位

**信乐烧** (`#信楽焼` + `#信楽`)：
- 传统与现代结合
- 预计可找到 15-20 位

**美浓烧** (`#美濃焼`)：
- 种类丰富
- 预计可找到 15-20 位

### 按技法/风格搜索

**粉引** (`#粉引`)：
- 当代流行技法
- 年轻作家多

**志野** (`#志野`)：
- 传统名窑技法

---

## 💡 小技巧

1. **使用 Instagram 的 "Related Accounts" 功能**
   - 找到一位优质作家后
   - 查看 Instagram 推荐的相似账号
   - 往往能发现同一产地或风格的其他作家

2. **关注画廊和展会账号**
   - KOGEI Art Fair (`@kogeiartfair`)
   - 知名画廊的 tagged photos
   - 可以批量发现参展作家

3. **使用 Google 辅助验证**
   - 搜索作家名字确认真实性
   - 查找官方网站和展览记录
   - 避免收录非专业作家

4. **建立个人备忘**
   - 记录已搜索的 hashtags
   - 标记已审查的账号
   - 避免重复工作

---

## 🚀 开始执行

现在就可以开始了！

1. **打开 Instagram**，搜索 `#うつわ`
2. **找到 5 位** 粉丝 10K+ 的作家
3. **填入** `scripts/discover-instagram-artists.js`
4. **运行脚本**，生成模板
5. **补充信息**，导入数据库

第一批建议只做 5 位，熟悉流程后再扩大规模！

---

**预计成果**：
- 第一周：新增 10-20 位作家
- 第一个月：新增 50-80 位作家
- 三个月：新增 150+ 位作家

让我们开始吧！ 🎉
