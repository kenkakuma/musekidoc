# 数据库迁移指南

## 当前状态

**本地WSL2数据库 (PostgreSQL on Docker)**
- 容器名: `postgres-pottery`
- 端口: 5433 (host) → 5432 (container)
- 数据库: `pottery_kb`
- 用户: `postgres / postgres`
- 数据量:
  - PotteryEntry: 35条
  - Artist: 60位
  - User: 1个管理员
  - Category: 0条

## 迁移步骤

### 步骤1: 在WSL2中导出数据库

```bash
cd /mnt/e/musekidoc

# 执行导出脚本
bash scripts/export-database.sh

# 或者手动导出
mkdir -p database-backup
docker exec postgres-pottery pg_dump -U postgres pottery_kb > database-backup/pottery_kb_backup.sql

# 压缩备份文件
cd database-backup
tar -czf pottery_kb_backup.tar.gz pottery_kb_backup.sql
cd ..
```

**输出文件**: `database-backup/pottery_kb_backup_YYYYMMDD_HHMMSS.tar.gz`

### 步骤2: 传输到VPS

**方式A: 使用SCP（推荐）**

```bash
# 从WSL2传输到VPS
scp database-backup/pottery_kb_backup_*.tar.gz user@your-vps-ip:/home/user/backups/

# 或者从Windows使用WinSCP/FileZilla
```

**方式B: 通过Git（如果备份文件不大）**

```bash
# 不推荐：SQL文件可能很大，不适合放入Git
# 仅作为备用方案
```

**方式C: 使用云存储中转**

```bash
# 上传到临时云存储（如果VPS和本地网络不通畅）
# 例如: AWS S3, Google Drive, 百度网盘等
```

### 步骤3: 在VPS上设置PostgreSQL

**如果VPS还没有PostgreSQL：**

```bash
# 在VPS上运行
docker run -d \
  --name postgres-pottery \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=<设置强密码> \
  -e POSTGRES_DB=pottery_kb \
  -p 5432:5432 \
  -v pottery_data:/var/lib/postgresql/data \
  postgres:16-alpine

# 等待容器启动
sleep 5

# 验证容器运行
docker ps | grep postgres-pottery
```

### 步骤4: 导入数据到VPS

```bash
# 在VPS上执行
cd /path/to/project

# 使用导入脚本
bash scripts/import-database.sh /home/user/backups/pottery_kb_backup_*.tar.gz

# 或者手动导入
tar -xzf /home/user/backups/pottery_kb_backup_*.tar.gz
docker exec -i postgres-pottery psql -U postgres pottery_kb < pottery_kb_backup.sql
```

### 步骤5: 验证数据完整性

```bash
# 在VPS上执行
docker exec postgres-pottery psql -U postgres -d pottery_kb -c "
SELECT
  'PotteryEntry' as table_name, COUNT(*) as count FROM \"PotteryEntry\"
UNION ALL
SELECT 'Artist', COUNT(*) FROM \"Artist\"
UNION ALL
SELECT 'User', COUNT(*) FROM \"User\";
"

# 应该看到:
# PotteryEntry | 35
# Artist       | 60
# User         | 1
```

### 步骤6: 配置VPS应用的数据库连接

在VPS上创建 `.env` 文件：

```bash
# VPS: /path/to/project/.env
DATABASE_URL="postgresql://postgres:<密码>@localhost:5432/pottery_kb"
ADMIN_PASSWORD="<新的管理员密码>"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

### 步骤7: 运行Prisma迁移（如果需要）

```bash
# 在VPS项目目录执行
pnpm install
pnpm prisma generate
pnpm prisma db push  # 确保schema同步
```

### 步骤8: 启动应用并测试

```bash
# 在VPS上
pnpm build
pnpm start

# 或使用PM2
pm2 start npm --name "pottery-kb" -- start
pm2 save
```

## 数据备份策略（VPS上）

### 自动定期备份

创建备份cron任务：

```bash
# 在VPS上编辑crontab
crontab -e

# 添加每天凌晨2点备份
0 2 * * * /path/to/project/scripts/backup-db-daily.sh
```

### 备份脚本

```bash
# scripts/backup-db-daily.sh
#!/bin/bash
BACKUP_DIR="/home/user/db-backups"
DATE=$(date +%Y%m%d)
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

# 创建备份
docker exec postgres-pottery pg_dump -U postgres pottery_kb | gzip > "$BACKUP_DIR/pottery_kb_${DATE}.sql.gz"

# 删除7天前的备份
find "$BACKUP_DIR" -name "pottery_kb_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "✅ 备份完成: pottery_kb_${DATE}.sql.gz"
```

## 故障排查

### 问题1: 导入时权限错误

```bash
# 解决方案: 确保数据库和用户已创建
docker exec -it postgres-pottery psql -U postgres -c "CREATE DATABASE pottery_kb;"
```

### 问题2: 表已存在错误

```bash
# 解决方案: 删除现有数据库并重新导入
docker exec -it postgres-pottery psql -U postgres -c "DROP DATABASE pottery_kb;"
docker exec -it postgres-pottery psql -U postgres -c "CREATE DATABASE pottery_kb;"
# 然后重新导入
```

### 问题3: VPS连接超时

```bash
# 检查防火墙
sudo ufw allow 5432/tcp

# 检查PostgreSQL配置
docker exec postgres-pottery cat /var/lib/postgresql/data/postgresql.conf | grep listen
```

## 数据完整性检查清单

- [ ] PotteryEntry表有35条记录
- [ ] Artist表有60条记录
- [ ] User表有1条记录（管理员）
- [ ] 所有published条目在前端可见
- [ ] 管理员可以登录
- [ ] 搜索功能正常
- [ ] 图片路径正确（如果有）
- [ ] 作家和陶器的关联关系完整

## 额外数据文件说明

项目中 `data/` 目录包含的JSON文件：
- **artists-*.json**: 约60位作家的原始数据（已导入数据库）
- **rokkoyo-entries.json**: 六古窑相关条目
- **techniques-entries.json**: 技法相关条目
- **artist-pottery-relationships.json**: 作家-陶器关系映射

这些文件是：
1. **数据源备份**（可以重新导入）
2. **开发参考**（Agent可以基于这些扩展内容）
3. **不需要迁移**（数据已在数据库中）

## 数据文件迁移建议

将 `data/` 目录也传到VPS：

```bash
# 从WSL2
scp -r data/ user@vps:/path/to/project/

# 这样VPS上的agent可以：
# 1. 查看原始数据结构
# 2. 批量导入新内容
# 3. 分析数据关系
```

## 安全建议

1. **修改默认密码**: VPS上不要使用 `postgres/postgres`
2. **限制访问**: 仅允许应用服务器访问数据库端口
3. **启用SSL**: 生产环境使用加密连接
4. **定期备份**: 保留至少7天的备份
5. **环境变量**: 敏感信息使用环境变量，不要提交到Git

## 总结

完成以上步骤后：
- ✅ VPS上有完整的数据库（35条目 + 60作家）
- ✅ 应用可以正常连接数据库
- ✅ 自动备份已配置
- ✅ Agent可以继续开发（数据库已迁移）
