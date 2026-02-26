# 迁移数据库到云服务（Supabase）

## 为什么选择云数据库？

- ✅ 无需管理Docker容器
- ✅ 自动备份和恢复
- ✅ 高可用性（99.9% uptime）
- ✅ 免费额度充足（你的数据<2MB，免费版500MB）
- ✅ 全球CDN加速
- ✅ 自带管理界面

## 步骤1: 创建Supabase项目

1. 访问 https://supabase.com 并注册
2. 创建新项目：
   - Project name: `pottery-kb`
   - Database Password: **保存好这个密码！**
   - Region: 选择离你最近的（如Singapore、Tokyo）
3. 等待项目创建（约2分钟）

## 步骤2: 获取数据库连接信息

在Supabase项目中：
1. 点击左侧 `Settings` → `Database`
2. 找到 `Connection string` → `URI`
3. 复制连接字符串，格式类似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```

## 步骤3: 导出本地数据库

在WSL2中执行：

```bash
cd /mnt/e/musekidoc

# 导出完整数据库
mkdir -p database-backup
docker exec postgres-pottery pg_dump -U postgres pottery_kb > database-backup/pottery_kb_export.sql

# 查看文件大小
ls -lh database-backup/pottery_kb_export.sql
```

## 步骤4: 导入到Supabase

### 方式A: 使用Supabase Web界面（简单）

1. 在Supabase项目中，点击 `SQL Editor`
2. 打开 `database-backup/pottery_kb_export.sql` 文件
3. 复制全部内容
4. 粘贴到SQL Editor并执行

**注意**: 如果文件太大，使用方式B

### 方式B: 使用psql命令行（推荐）

```bash
# 在WSL2中执行（需要安装psql客户端）
sudo apt-get install -y postgresql-client

# 导入数据到Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres" < database-backup/pottery_kb_export.sql
```

### 方式C: 使用分步导入（如果B失败）

```bash
# 1. 先运行Prisma迁移创建表结构
# 修改 .env.supabase（新建文件）
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"

# 在Windows项目目录
pnpm prisma db push --schema prisma/schema.prisma

# 2. 只导入数据（不含表结构）
docker exec postgres-pottery pg_dump -U postgres --data-only pottery_kb > database-backup/data_only.sql

# 3. 导入纯数据
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres" < database-backup/data_only.sql
```

## 步骤5: 验证数据

### 在Supabase界面验证

1. Supabase → `Table Editor`
2. 查看表：
   - `PotteryEntry` → 应该有35行
   - `Artist` → 应该有60行
   - `User` → 应该有1行

### 使用psql验证

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres" -c "
SELECT
  'PotteryEntry' as table_name, COUNT(*) as count FROM \"PotteryEntry\"
UNION ALL
SELECT 'Artist', COUNT(*) FROM \"Artist\"
UNION ALL
SELECT 'User', COUNT(*) FROM \"User\";
"
```

## 步骤6: 更新应用配置

### 本地开发（.env.local）

```env
# 连接到Supabase云数据库
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"

ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### VPS生产环境（.env）

```env
# 连接到Supabase云数据库
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"

ADMIN_PASSWORD="强密码"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 步骤7: 测试连接

```bash
# 在项目目录
pnpm prisma generate
pnpm prisma db push

# 测试应用
pnpm dev
```

访问 http://localhost:3000 确认数据显示正常。

## 步骤8: 清理本地数据库（可选）

```bash
# 确认云数据库工作正常后，可以停止本地Docker容器
docker stop postgres-pottery

# 如果不再需要，可以删除
docker rm postgres-pottery
docker volume rm pottery_data
```

## 其他云数据库选项

### Neon (https://neon.tech)

```bash
# 1. 创建Neon项目
# 2. 获取连接字符串
# 3. 导入数据
psql "postgresql://user:password@ep-xxxx.region.aws.neon.tech/main" < database-backup/pottery_kb_export.sql
```

### Railway (https://railway.app)

```bash
# 1. 创建PostgreSQL插件
# 2. 获取DATABASE_URL
# 3. 导入数据
psql "$DATABASE_URL" < database-backup/pottery_kb_export.sql
```

### Vercel Postgres（如果使用Vercel部署）

```bash
# 1. Vercel项目 → Storage → Create Database → Postgres
# 2. 获取连接字符串
# 3. 使用Vercel CLI导入
vercel env pull .env.local
pnpm prisma db push
```

## 成本对比

| 服务 | 免费额度 | 数据量限制 | 适合你的项目 |
|------|---------|-----------|-------------|
| Supabase | 500MB数据库 | 无限请求 | ✅ 完全够用 |
| Neon | 0.5GB存储 | 自动休眠 | ✅ 够用 |
| Railway | $5/月额度 | 用完即止 | ✅ 够用 |
| 阿里云RDS | ❌ 无免费版 | 按量付费 | ⚠️ 成本高 |

**推荐**: 你的数据量很小（<2MB），**Supabase免费版完全够用**！

## 优势总结

迁移到云数据库后：
- ✅ 不用担心VPS上Docker管理
- ✅ 自动备份（Supabase每天备份）
- ✅ 全球访问速度快
- ✅ 免费额度充足
- ✅ Agent在VPS上只需配置DATABASE_URL即可
- ✅ 你在本地也能直接访问同一数据库

## 故障排查

### 问题1: 导入时字符编码错误

```bash
# 指定UTF-8编码
psql "postgresql://..." -f database-backup/pottery_kb_export.sql --set=client_encoding=UTF8
```

### 问题2: 权限错误

```sql
-- 在Supabase SQL Editor中执行
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
```

### 问题3: 表已存在

```sql
-- 删除所有表（谨慎！）
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## 下一步

迁移完成后：
1. ✅ 停止本地Docker PostgreSQL
2. ✅ 更新VPS上的.env文件
3. ✅ 重启VPS应用
4. ✅ 告诉Agent使用新的DATABASE_URL

数据库在云上，代码在VPS，完美分离！
