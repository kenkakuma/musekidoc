# 🚀 快速启动指南 - Japan Pottery Knowledge Base

**阶段 1 已完成** ✅ | **最后更新**: 2026-02-25

---

## 📋 启动前检查清单

- [ ] Node.js 20+ 已安装
- [ ] pnpm 已安装
- [ ] PostgreSQL 容器正在运行（或本地 PostgreSQL）
- [ ] 环境变量已配置（.env 文件）

---

## ⚡ 3 步快速启动

### 步骤 1: 启动数据库

**选项 A: Docker（推荐）**
```bash
# 启动 PostgreSQL 容器
docker start postgres-pottery

# 检查容器状态
docker ps | grep postgres-pottery
```

**选项 B: 首次创建容器**
```bash
docker run --name postgres-pottery \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  -d postgres:16
```

### 步骤 2: 启动开发服务器

```bash
# 进入项目目录
cd E:\musekidoc

# 安装依赖（首次运行）
pnpm install

# 启动开发服务器
pnpm dev
```

**输出应显示**:
```
▲ Next.js 14.2.21
- Local:        http://localhost:3000
✓ Ready in 4.4s
```

### 步骤 3: 打开浏览器测试

**前台**:
- 🏠 首页: http://localhost:3000
- 🔍 搜索: 在首页搜索框输入"备前"或"陶器"
- 📄 详情页: 点击任意陶器卡片

**管理后台**:
- 🔐 登录: http://localhost:3000/admin/login
  - 密码: `admin123`（来自 .env 文件）
- 📊 仪表盘: http://localhost:3000/admin
- ✏️ 新建条目: http://localhost:3000/admin/entries/new
- 📥 批量导入: http://localhost:3000/admin/import
- 📤 导出数据: 点击仪表盘的"导出数据 (JSON)"按钮

**数据库管理**:
```bash
# 打开 Prisma Studio（可视化数据库工具）
pnpm prisma studio

# 访问: http://localhost:5555
```

---

## 🧪 测试新功能（阶段 1 最后完成的）

### 1. 测试搜索功能

**前台搜索**:
1. 访问 http://localhost:3000
2. 在搜索框输入"备"
3. 应该看到实时搜索建议下拉列表
4. 使用键盘 ↑↓ 导航，Enter 选择

**API 测试**:
```bash
# 全文搜索
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"备前","limit":10}'

# 搜索建议
curl "http://localhost:3000/api/search/suggestions?q=备前&limit=5"
```

### 2. 测试导出功能

**通过浏览器**:
1. 登录管理后台: http://localhost:3000/admin/login
2. 点击"导出数据 (JSON)"按钮
3. 应该下载文件：`pottery-kb-export-2026-02-25.json`

**通过 API**:
```bash
# 导出所有数据
curl "http://localhost:3000/api/export/json?format=pretty&include=all" -o export.json

# 导出仅陶器条目
curl "http://localhost:3000/api/export/json?include=entries" -o entries.json

# 导出仅作家
curl "http://localhost:3000/api/export/json?include=artists" -o artists.json
```

### 3. 测试批量导入

创建测试文件 `test-import.json`:
```json
[
  {
    "slug": "test-pottery-1",
    "nameZh": "测试陶器1",
    "nameJa": "テスト陶器1",
    "category": "陶器",
    "region": "测试产地",
    "description": "这是一个测试陶器条目的描述，用于验证批量导入功能是否正常工作。描述需要至少100个字符才能通过验证。这是一个测试陶器条目的描述，用于验证批量导入功能是否正常工作。",
    "positioning": "测试定位说明",
    "signatureFeatures": ["特征1", "特征2"],
    "keywords": ["测试", "陶器", "导入"],
    "notableArtists": [],
    "representativeForms": [],
    "sources": [
      {
        "title": "测试来源",
        "url": "https://example.com"
      }
    ],
    "published": false
  }
]
```

导入测试:
1. 访问 http://localhost:3000/admin/import
2. 将 JSON 内容粘贴到文本框
3. 点击"导入"
4. 检查导入结果

---

## 🐛 常见问题排查

### 问题 1: 数据库连接失败

**错误信息**: `Can't reach database server` 或 `ECONNREFUSED`

**解决方案**:
```bash
# 检查容器状态
docker ps -a | grep postgres-pottery

# 如果容器存在但未运行
docker start postgres-pottery

# 如果容器不存在
docker run --name postgres-pottery \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  -d postgres:16

# 检查 .env 文件中的连接字符串
cat .env | grep DATABASE_URL
# 应该是: postgresql://postgres:postgres@localhost:5433/pottery_kb
```

### 问题 2: 端口已被占用

**错误信息**: `Port 3000 is already in use`

**解决方案**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [进程号] /F

# 或者使用其他端口
pnpm dev -- -p 3001
```

### 问题 3: Prisma Client 未生成

**错误信息**: `@prisma/client did not initialize yet`

**解决方案**:
```bash
# 重新生成 Prisma Client
pnpm prisma generate

# 如果还不行，尝试清理并重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm prisma generate
```

### 问题 4: 数据库表不存在

**错误信息**: `Table 'PotteryEntry' does not exist`

**解决方案**:
```bash
# 运行数据库迁移
pnpm prisma migrate dev

# 导入种子数据
pnpm prisma db seed
```

### 问题 5: 搜索无结果

**可能原因**: 数据库中没有已发布的条目

**解决方案**:
1. 打开 Prisma Studio: `pnpm prisma studio`
2. 打开 `PotteryEntry` 表
3. 确保有记录，且 `published` 字段为 `true`

---

## 📊 验证安装成功

运行以下命令验证所有功能:

```bash
# 1. 检查数据库连接
pnpm prisma studio
# 应该打开 http://localhost:5555

# 2. 检查数据
# 在 Prisma Studio 中应该看到:
# - PotteryEntry: 3+ 条记录
# - User: 1 条记录（管理员）

# 3. 测试 API（需要先启动 pnpm dev）
curl http://localhost:3000/api/entries
# 应该返回 JSON 格式的陶器列表

# 4. 测试搜索
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"陶器"}'
# 应该返回搜索结果
```

---

## 📝 下一步

### 开始填充内容

参考 `docs/AI-CONTENT-GUIDE.md`，使用以下方式添加内容:

1. **手动添加**（适合单条目）
   - 访问 http://localhost:3000/admin/entries/new
   - 填写表单，上传图片
   - 保存并发布

2. **批量导入**（适合多条目）
   - 准备 JSON 文件
   - 访问 http://localhost:3000/admin/import
   - 粘贴 JSON 并导入

3. **通过 API**（适合自动化）
   ```bash
   curl -X POST http://localhost:3000/api/entries \
     -H "Authorization: Bearer admin123" \
     -H "Content-Type: application/json" \
     -d @entry.json
   ```

### 查看文档

- **API 文档**: `docs/api.md`
- **项目文档**: `README.md`
- **开发日志**: `docs/DAILY-LOG.md`
- **AI 内容指南**: `docs/AI-CONTENT-GUIDE.md`

---

## 🆘 需要帮助?

如果遇到问题:

1. 检查 `docs/DAILY-LOG.md` 的"遇到的问题"部分
2. 查看 `README.md` 的故障排除部分
3. 检查服务器日志（运行 `pnpm dev` 的终端输出）
4. 使用 Prisma Studio 检查数据库状态

---

**祝开发顺利！** 🎉

如果一切正常，你应该看到:
- ✅ 首页显示陶器列表
- ✅ 搜索功能正常工作
- ✅ 管理后台可以登录
- ✅ 可以创建和编辑条目
- ✅ 可以导出数据

**阶段 1 完成，准备填充内容！** 🚀
