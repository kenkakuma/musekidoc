# 快速开始：Instagram 作家发现

**5 分钟上手，开始扩充你的艺术家库！**

---

## 🚀 超简单 3 步流程

### 第 1 步：搜索 Instagram（5-10 分钟）

1. 打开 Instagram，搜索 **`#うつわ`** 或 **`#陶芸`**
2. 找到 **5 位** 粉丝 10K+ 的日本陶艺作家
3. 记录他们的信息：
   - Instagram 用户名
   - 显示名字
   - 粉丝数
   - Bio（简介）

---

### 第 2 步：填入脚本（2 分钟）

编辑 `scripts/discover-instagram-artists.js`，找到这个数组：

```javascript
const DISCOVERED_ARTISTS = [
  // 👇 在这里添加你找到的作家
  {
    username: 'karugane_akari',       // Instagram 用户名
    displayName: '故金あかり',        // 显示名字
    followers: 15000,                 // 粉丝数
    bio: '陶芸家｜金沢',               // Bio 原文
    profilePicUrl: null
  },
  // 继续添加...
];
```

---

### 第 3 步：生成模板并补充信息（10-15 分钟/人）

运行脚本生成模板：
```bash
node scripts/discover-instagram-artists.js
```

会生成 `data/discovered-artists-batch.json`，打开编辑：

**最少需要补充这些**：
```json
{
  "artistSlug": "karugane-akari",     // 改一个合适的 slug
  "nameZh": "故金明",                  // 加中文名
  "bio": "故金明，日本陶艺家...",      // 写简介（至少 100 字）
  "birthYear": 1990,                  // 找出生年份（Google 搜索）
  "style": "现代风格，简约自然",       // 描述风格

  "sources": [
    // Instagram 已经自动添加了 ✅
    // 👇 需要再加 2 个来源（Google 搜"作家名字 陶艺"）
    {
      "url": "https://example-gallery.com/artist",
      "title": "XX 画廊作家页面",
      "type": "画廊资料"
    },
    {
      "url": "https://example-exhibition.com",
      "title": "XX 展览参展信息",
      "type": "展讯媒体"
    }
  ],

  "published": true  // 改成 true 表示准备导入
}
```

---

### 第 4 步：导入数据库（1 分钟）

```bash
node scripts/import-discovered-artists.js
```

完成！访问 http://localhost:3000/artists 查看新作家。

---

## 📝 信息补充技巧

### 快速找到额外来源（每位作家 5 分钟）

**Google 搜索**：
```
"作家名字" 陶芸
"作家名字" pottery
```

**推荐来源网站**（直接搜索）：
- 画廊：搜 `"作家名字" gallery`
- 展讯：搜 `"作家名字" KOGEI Art Fair`
- 媒体：搜 `"作家名字" BRUTUS` 或 `"作家名字" チルチンびと`
- 电商：搜 `"作家名字" KOHORO` 或 `"作家名字" 日常茶飯`

只要找到 **任意 2 个** 提到这位作家的页面就可以！

---

## ✅ 质量检查清单

导入前确保：
- [ ] 中文名或日文名至少填了一个
- [ ] 简介至少 100 字
- [ ] 总共有 3 个来源（Instagram + 2 个其他）
- [ ] 没有 "TODO" 字样
- [ ] `published: true`

---

## 🎯 推荐搜索 Hashtags

**最佳** 🌟：
- `#うつわ` - 器皿，最多结果
- `#陶芸` - 陶艺，专业作家多

**备选**：
- `#陶器` - 陶器
- `#やきもの` - 烧物
- `#陶芸家` - 陶艺家

---

## 💡 小建议

1. **第一次先做 3-5 位**，熟悉流程
2. **从粉丝最多的开始**，他们信息更容易找
3. **优先选有官网链接的**（Bio 里有 URL），信息更完整
4. **看看 Instagram 的 "Related Accounts"**，一次找一堆

---

## 🆘 常见问题

**Q: 找不到作家的出生年份怎么办？**
A: 可以先填 `null`，不影响导入（虽然建议填）

**Q: 来源必须是日语网站吗？**
A: 不必须，英文网站也可以

**Q: Instagram 粉丝不到 10K 但很优秀的作家能收录吗？**
A: 可以！只是我们优先收录高人气的

**Q: 简介写不够 100 字怎么办？**
A: 结合 Instagram 帖子、官网信息，介绍作品风格、产地、特色

---

## 📊 预期成果

- **第一次**（3-5 位）：2-3 小时
- **熟练后**（5 位）：1 小时
- **批量处理**（20 位）：一个下午

**一个月轻松新增 50+ 位作家！** 🎉

---

开始吧！从搜索 **`#うつわ`** 开始你的第一批发现！
