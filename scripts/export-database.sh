#!/bin/bash
# 数据库导出脚本 - 在WSL2中运行

set -e

BACKUP_DIR="./database-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pottery_kb_backup_${TIMESTAMP}.sql"

echo "📦 开始导出数据库..."

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 方式1: 导出完整的SQL dump（包含结构和数据）
echo "正在导出完整数据库..."
docker exec postgres-pottery pg_dump -U postgres pottery_kb > "${BACKUP_DIR}/${BACKUP_FILE}"

# 方式2: 仅导出数据（不含表结构，适合已有schema的VPS）
echo "正在导出纯数据..."
docker exec postgres-pottery pg_dump -U postgres --data-only pottery_kb > "${BACKUP_DIR}/pottery_kb_data_only_${TIMESTAMP}.sql"

# 压缩备份文件
echo "正在压缩备份文件..."
cd "$BACKUP_DIR"
tar -czf "pottery_kb_backup_${TIMESTAMP}.tar.gz" *.sql
cd ..

echo "✅ 导出完成！"
echo "📁 备份文件位置: ${BACKUP_DIR}/pottery_kb_backup_${TIMESTAMP}.tar.gz"
echo ""
echo "📤 下一步: 将备份文件传输到VPS"
echo "   scp ${BACKUP_DIR}/pottery_kb_backup_${TIMESTAMP}.tar.gz user@your-vps:/path/to/backup/"
