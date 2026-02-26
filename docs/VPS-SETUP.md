# VPS 部署配置指南

## 数据库迁移完成 ✅

你的数据库已成功迁移到 **Supabase 云数据库**：
- 35条陶器条目
- 60位作家
- 1个管理员账户

## VPS 上的配置步骤

### 步骤1: 在VPS上拉取最新代码

```bash
# SSH登录到VPS
ssh user@your-vps-ip

# 克隆或更新项目
cd /path/to/your/projects
git clone https://github.com/your-username/musekidoc.git
# 或者如果已经克隆：
cd musekidoc
git pull origin main
```

### 步骤2: 创建.env配置文件

在VPS项目目录中创建 `.env` 文件：

```bash
# 在VPS上执行
cd /path/to/musekidoc
nano .env
```

**复制以下内容到 .env 文件**：

```env
# Supabase 云数据库连接
DATABASE_URL="postgresql://postgres.kzazfwtwhjlcqfpyqoln:Hoo3969407.@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# 管理员密码（请修改为更安全的密码）
ADMIN_PASSWORD="你的新管理员密码"

# 应用URL（替换为你的域名或VPS IP）
NEXT_PUBLIC_APP_URL="http://your-vps-ip:3000"
# 或如果有域名：
# NEXT_PUBLIC_APP_URL="https://your-domain.com"

# 图片上传配置
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

**保存文件**：
- 按 `Ctrl+O` 保存
- 按 `Enter` 确认
- 按 `Ctrl+X` 退出

### 步骤3: 安装依赖

```bash
# 确保已安装Node.js和pnpm
node --version  # 应该是 v18 或更高
pnpm --version  # 如果没有，运行: npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 步骤4: 生成Prisma客户端

```bash
# 生成数据库客户端
pnpm prisma generate

# 验证数据库连接（可选）
pnpm prisma db pull
```

### 步骤5: 构建和启动应用

```bash
# 构建生产版本
pnpm build

# 启动应用
pnpm start
```

或使用 **PM2** 进程管理（推荐）：

```bash
# 安装PM2（如果还没有）
npm install -g pm2

# 启动应用
pm2 start npm --name "pottery-kb" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs pottery-kb

# 查看状态
pm2 status
```

### 步骤6: 配置防火墙（如果需要）

```bash
# 允许3000端口（或你的应用端口）
sudo ufw allow 3000/tcp

# 如果使用Nginx反向代理
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 步骤7: 配置Nginx反向代理（可选，生产环境推荐）

```bash
# 安装Nginx
sudo apt-get install nginx

# 创建Nginx配置
sudo nano /etc/nginx/sites-available/pottery-kb
```

**Nginx配置内容**：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或VPS IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用配置**：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/pottery-kb /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 步骤8: 配置SSL证书（使用Let's Encrypt，可选但推荐）

```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

## 验证部署

### 1. 检查应用是否运行

```bash
# 查看进程
pm2 status

# 查看日志
pm2 logs pottery-kb --lines 50

# 或直接访问
curl http://localhost:3000
```

### 2. 测试数据库连接

访问应用并检查：
- 首页能否显示陶器条目（35条）
- 作家列表能否显示（60位）
- 搜索功能是否正常
- 管理后台能否登录

### 3. 测试API端点

```bash
# 测试获取陶器列表
curl http://localhost:3000/api/pottery

# 测试搜索
curl http://localhost:3000/api/search?q=备前

# 测试作家列表
curl http://localhost:3000/api/artists
```

## 数据库管理

### 使用Supabase管理界面

访问 https://supabase.com → 登录 → pottery-kb 项目

可以：
- 查看和编辑数据（Table Editor）
- 执行SQL查询（SQL Editor）
- 查看数据库性能（Dashboard）
- 管理备份（Database → Backups）

### 从VPS直接连接数据库（可选）

```bash
# 安装PostgreSQL客户端
sudo apt-get install postgresql-client

# 连接到Supabase
psql "postgresql://postgres.kzazfwtwhjlcqfpyqoln:Hoo3969407.@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# 查看表
\dt

# 查询数据
SELECT COUNT(*) FROM "PotteryEntry";
```

## 故障排查

### 问题1: 数据库连接失败

**检查**：
```bash
# 测试网络连接
ping aws-1-ap-south-1.pooler.supabase.com

# 检查.env文件是否正确
cat .env | grep DATABASE_URL

# 查看应用日志
pm2 logs pottery-kb
```

**解决方案**：
- 确认 DATABASE_URL 正确无误
- 检查VPS防火墙是否阻止出站连接
- 验证Supabase项目是否在运行状态

### 问题2: 应用无法启动

**检查**：
```bash
# 查看详细错误
pnpm build
pnpm start

# 检查端口占用
sudo lsof -i :3000
```

**解决方案**：
- 确保所有依赖已安装 `pnpm install`
- 运行 `pnpm prisma generate`
- 检查Node.js版本 `node --version` (需要v18+)

### 问题3: Prisma客户端错误

**解决方案**：
```bash
# 重新生成Prisma客户端
rm -rf node_modules/.prisma
pnpm prisma generate

# 重启应用
pm2 restart pottery-kb
```

## 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| DATABASE_URL | Supabase数据库连接字符串 | postgresql://... |
| ADMIN_PASSWORD | 管理后台密码 | 强密码123! |
| NEXT_PUBLIC_APP_URL | 应用访问URL | https://pottery.com |
| MAX_FILE_SIZE | 最大上传文件大小(字节) | 5242880 (5MB) |
| ALLOWED_IMAGE_TYPES | 允许的图片类型 | image/jpeg,image/png |

## 安全建议

1. **修改默认密码**：立即修改ADMIN_PASSWORD
2. **使用HTTPS**：生产环境必须配置SSL证书
3. **限制数据库访问**：在Supabase中配置IP白名单（如果需要）
4. **定期更新**：定期运行 `git pull && pnpm install && pnpm build`
5. **监控日志**：使用 `pm2 logs` 监控应用状态

## 自动部署（可选）

### 使用GitHub Actions

在项目中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /path/to/musekidoc
            git pull
            pnpm install
            pnpm build
            pm2 restart pottery-kb
```

## 性能优化

### 启用Next.js缓存

确保 `.env` 中：
```env
NODE_ENV=production
```

### 配置CDN（如果使用静态资源）

使用Cloudflare、Vercel等CDN加速静态资源。

### 数据库连接池

Supabase Session Pooler已经提供了连接池，无需额外配置。

## 监控和日志

### PM2监控

```bash
# 安装PM2 Plus（可选，提供Web界面）
pm2 plus

# 查看实时监控
pm2 monit
```

### Supabase监控

在Supabase Dashboard中查看：
- 数据库性能
- API请求统计
- 存储使用情况

## 总结

完成以上步骤后，你的VPS应用将：
- ✅ 连接到Supabase云数据库（35条目 + 60作家）
- ✅ 通过PM2稳定运行
- ✅ 支持自动重启和日志管理
- ✅ 可通过域名或IP访问

**所有数据都在云端，VPS只运行应用代码，完美分离！**
