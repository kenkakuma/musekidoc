# Agent开发指引

## 数据库已迁移到云端

亲爱的VPS Agent，数据库已成功迁移到 **Supabase云数据库**。

### 当前状态

**数据库信息**：
- 平台：Supabase (PostgreSQL云服务)
- 连接方式：Session Pooler
- 数据量：
  - ✅ 35条陶器条目 (PotteryEntry)
  - ✅ 60位作家 (Artist)
  - ✅ 1个管理员账户 (User)
  - ✅ 所有索引和关系已建立

**项目代码**：
- 仓库：已推送到Git
- 分支：main
- 最新提交：包含所有开发功能

### 你需要做的事情

#### 1. 环境配置

项目根目录已有 `.env.production.example` 文件，请复制并配置：

```bash
cp .env.production.example .env
```

然后编辑 `.env` 文件，**只需修改以下两项**：

1. `DATABASE_URL` - 已经配置好，无需修改（除非密码错误）
2. `ADMIN_PASSWORD` - 请设置一个强密码
3. `NEXT_PUBLIC_APP_URL` - 替换为VPS的IP或域名

#### 2. 安装依赖和启动

```bash
# 安装依赖
pnpm install

# 生成Prisma客户端（连接Supabase数据库）
pnpm prisma generate

# 构建应用
pnpm build

# 启动应用
pnpm start
```

#### 3. 验证数据库连接

启动后，你应该能：
- 在首页看到35条陶器条目
- 访问作家列表看到60位作家
- 使用搜索功能
- 登录管理后台

#### 4. 数据库管理

**你无需管理Docker或PostgreSQL容器**，所有数据库操作都通过Supabase：

**查询数据**：
```bash
# 使用Prisma Studio（可视化界面）
pnpm prisma studio

# 或直接使用psql
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"PotteryEntry\";"
```

**访问Supabase控制台**：
- URL: https://supabase.com
- 项目：pottery-kb
- 可以查看/编辑数据、执行SQL、查看性能

### 数据文件说明

项目中的 `data/` 目录包含：
- `artists-*.json` - 60位作家的原始JSON数据
- `rokkoyo-entries.json` - 六古窑条目
- `techniques-entries.json` - 技法条目
- `artist-pottery-relationships.json` - 关系映射

**这些文件的作用**：
1. ✅ **数据已在数据库中** - 无需重新导入
2. 📋 **可作为参考** - 了解数据结构
3. 🔧 **可用于扩展** - 基于这些文件添加新内容
4. 🔄 **可用于恢复** - 如需重置数据库

### 开发任务指引

详细的开发计划请查看：
- `docs/stage-2-plan.md` - 阶段2开发计划
- `docs/work-summary-2026-02-25.md` - 昨日工作总结
- `docs/startup-guide-stage2-day1.md` - 今日启动指南

### 常用命令

```bash
# 启动开发服务器
pnpm dev

# 查看数据库结构
pnpm prisma studio

# 拉取最新schema（从Supabase同步）
pnpm prisma db pull

# 推送schema变更到Supabase
pnpm prisma db push

# 运行测试
pnpm test

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 故障排查

**如果遇到数据库连接错误**：
1. 检查 `.env` 中的 `DATABASE_URL` 是否正确
2. 测试网络连接：`ping aws-1-ap-south-1.pooler.supabase.com`
3. 重新生成Prisma客户端：`pnpm prisma generate`

**如果看不到数据**：
1. 检查数据库中是否有数据：`pnpm prisma studio`
2. 查看应用日志：检查是否有查询错误
3. 验证API端点：`curl http://localhost:3000/api/pottery`

### 下一步开发

参考 `docs/stage-2-plan.md`，主要任务包括：

1. **性能优化**
   - 实现分页和虚拟滚动
   - 添加缓存策略
   - 优化图片加载

2. **内容扩展**
   - 导入剩余JSON数据（如果需要）
   - 建立作家-陶器关系
   - 增加更多陶器条目

3. **功能增强**
   - 改进搜索算法
   - 添加高级筛选
   - 完善用户界面

### 重要提醒

- ✅ **数据库在云端** - 不需要Docker，不需要本地PostgreSQL
- ✅ **数据已完整迁移** - 35条目 + 60作家都在Supabase中
- ✅ **代码已同步** - Git仓库中是最新版本
- ✅ **环境变量已准备** - 只需配置 `.env` 文件
- ✅ **文档齐全** - 所有开发指南都在 `docs/` 目录

**如有任何问题，请查阅 `docs/VPS-SETUP.md` 获取详细配置指南。**

祝开发顺利！🚀
