#!/bin/bash
# 数据库导入脚本 - 在VPS上运行

set -e

if [ -z "$1" ]; then
    echo "❌ 错误: 请提供备份文件路径"
    echo "用法: ./import-database.sh /path/to/backup.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
TEMP_DIR="./temp-restore"

echo "📥 开始导入数据库..."
echo "备份文件: $BACKUP_FILE"

# 解压备份文件
echo "正在解压备份文件..."
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# 查找SQL文件
SQL_FILE=$(find "$TEMP_DIR" -name "pottery_kb_backup_*.sql" -type f | head -n 1)

if [ -z "$SQL_FILE" ]; then
    echo "❌ 错误: 未找到SQL备份文件"
    exit 1
fi

echo "找到SQL文件: $SQL_FILE"

# 检查PostgreSQL是否运行
if ! docker ps | grep -q postgres; then
    echo "❌ PostgreSQL容器未运行，请先启动数据库"
    exit 1
fi

# 获取容器名称（假设是postgres或pottery-postgres）
CONTAINER_NAME=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ 未找到PostgreSQL容器"
    exit 1
fi

echo "使用容器: $CONTAINER_NAME"

# 导入数据
echo "正在导入数据到数据库..."
docker exec -i "$CONTAINER_NAME" psql -U postgres pottery_kb < "$SQL_FILE"

# 清理临时文件
echo "清理临时文件..."
rm -rf "$TEMP_DIR"

echo "✅ 数据库导入完成！"
echo ""
echo "🔍 验证数据:"
docker exec "$CONTAINER_NAME" psql -U postgres -d pottery_kb -c "
SELECT
  'PotteryEntry' as table_name, COUNT(*) as count FROM \"PotteryEntry\"
UNION ALL
SELECT 'Artist', COUNT(*) FROM \"Artist\"
UNION ALL
SELECT 'User', COUNT(*) FROM \"User\";
"
