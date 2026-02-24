# 如何在新会话中执行阶段 1 实施计划

本文档指导您在新的 Claude Code 会话中批量执行 Phase 1 开发计划。

---

## 📋 准备工作

### 1. 确认环境

在开始前，请确认：

- ✅ PostgreSQL 已安装并运行
  ```bash
  # Windows: 检查 PostgreSQL 服务是否运行
  # 或使用 Docker:
  docker run --name postgres-pottery -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
  ```

- ✅ Node.js 20+ 已安装
  ```bash
  node --version  # 应显示 v20.x.x
  ```

- ✅ pnpm 已安装
  ```bash
  pnpm --version  # 如未安装：npm install -g pnpm
  ```

---

## 🚀 在新会话中执行

### 步骤 1: 打开新的 Claude Code 会话

在终端中，当前目录为 `E:\musekidoc`，运行：

```bash
# 确保在项目根目录
cd E:\musekidoc

# 打开新的 Claude Code 会话（如果使用 CLI）
claude code
```

或者：
- 在 VS Code 中打开新的 Claude Code 面板
- 或在网页版 Claude Code 中打开新标签页

---

### 步骤 2: 复制并发送以下提示词

在新会话中，**完整复制并发送**以下提示词：

```
我要执行一个 Next.js 项目的开发计划。

项目位置：E:\musekidoc
计划文档：docs/plans/phase-1-implementation-plan.md
每日日志：docs/DAILY-LOG.md
内容指南：docs/AI-CONTENT-GUIDE.md

请使用 executing-plans skill 批量执行 Phase 1 的所有任务。

要求：
1. 严格按照 phase-1-implementation-plan.md 中的步骤执行
2. 每完成一个主要任务（Task 0-4）后，在 DAILY-LOG.md 中更新进度
3. 在以下检查点暂停，等待我审核：
   - Task 1 完成后（数据库 Schema）
   - Task 3 完成后（前台首页）
   - Task 7 完成后（管理后台编辑器）
   - Task 8 完成后（批量导入功能）
4. 遇到错误时立即停止，记录到 DAILY-LOG.md 的"遇到的问题"区域
5. 每个任务完成后执行 git commit

开始执行 Task 0: 项目初始化
```

---

### 步骤 3: Claude 会自动执行

Claude 将：

1. **读取计划文档** - 理解所有任务和步骤
2. **逐步执行** - 按照 phase-1-implementation-plan.md 的顺序
3. **更新日志** - 每完成一个任务更新 DAILY-LOG.md
4. **提交代码** - 每个任务结束时 git commit
5. **在检查点暂停** - 等待您审核后再继续

---

### 步骤 4: 在检查点审核

当 Claude 到达检查点时，会停下来告诉您：

```
✅ Task 1 (数据库 Schema 设计) 已完成

请审核：
- prisma/schema.prisma
- lib/db/types.ts
- prisma/seed.ts

验证方法：
pnpm prisma studio  # 查看数据库，应有 14 条 PotteryEntry

满意后回复 "继续" 执行下一个任务
```

**您需要做的**：
1. 打开相关文件检查代码
2. 运行验证命令测试功能
3. 如果满意，回复 **"继续"** 或 **"通过，继续下一个任务"**
4. 如果有问题，回复 **"等等，[具体问题]"**

---

## 📊 执行进度追踪

在执行过程中，您可以随时查看：

### 1. 实时进度
打开 `docs/DAILY-LOG.md` 查看：
- 当前正在执行的任务
- 已完成的任务列表
- 遇到的问题

### 2. Git 提交历史
```bash
git log --oneline
```
每个任务完成后都会有一个 commit，例如：
```
abc1234 feat(task-004): implement pottery detail page with image gallery
def5678 feat(task-003): implement public homepage with search and pagination
...
```

### 3. 数据库状态
```bash
pnpm prisma studio
```
查看已导入的数据

---

## ⚠️ 常见问题处理

### 问题 1: 数据库连接失败

**症状**: `Error: Can't reach database server`

**解决**:
```bash
# 检查 PostgreSQL 是否运行
# Windows: 服务管理器中启动 PostgreSQL

# 或使用 Docker
docker start postgres-pottery

# 检查 .env 文件中的 DATABASE_URL 是否正确
```

### 问题 2: 端口被占用

**症状**: `Error: Port 3000 is already in use`

**解决**:
```bash
# 找到占用端口的进程
netstat -ano | findstr :3000

# 结束进程（Windows）
taskkill /PID [进程号] /F

# 或更改端口
# 在 package.json 中：
"dev": "next dev -p 3001"
```

### 问题 3: Prisma 迁移失败

**症状**: `Migration failed`

**解决**:
```bash
# 重置数据库（会删除所有数据）
pnpm prisma migrate reset

# 重新运行迁移
pnpm prisma migrate dev

# 重新 seed
pnpm prisma db seed
```

### 问题 4: TypeScript 类型错误

**症状**: `Type error: Property 'xxx' does not exist`

**解决**:
```bash
# 重新生成 Prisma Client
pnpm prisma generate

# 重启 TypeScript 服务器（VS Code）
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

---

## 🎯 检查点说明

### 检查点 1: Task 1 完成（数据库）
**验证项目**:
- [ ] `pnpm prisma studio` 可打开，看到 4 个表
- [ ] PotteryEntry 表有 14 条数据
- [ ] User 表有 1 个管理员
- [ ] 所有字段类型正确

### 检查点 2: Task 3 完成（前台首页）
**验证项目**:
- [ ] `pnpm dev` 可运行
- [ ] 访问 `http://localhost:3000` 看到 14 个陶器卡片
- [ ] 搜索功能正常（输入"备前"能搜到结果）
- [ ] 分页功能正常（如果超过 20 条）

### 检查点 3: Task 7 完成（管理后台编辑器）
**验证项目**:
- [ ] 访问 `http://localhost:3000/admin` 需要密码
- [ ] 登录后能看到管理后台
- [ ] 能创建新条目
- [ ] 能编辑现有条目
- [ ] 图片上传功能正常

### 检查点 4: Task 8 完成（批量导入）
**验证项目**:
- [ ] 能下载 Excel 模板
- [ ] 能上传 JSON 文件导入数据
- [ ] 错误提示清晰
- [ ] 导入结果正确显示

---

## 📝 执行日志示例

执行过程中，DAILY-LOG.md 会自动更新，看起来像这样：

```markdown
## 📅 当前日期：2026-02-24

## 🎯 当前阶段：阶段 1 - MVP 基础功能开发

## 📊 整体进度

阶段 1 进度：[████░░░░░░] 40%（8/18 个任务完成）

---

## 🚧 进行中任务

- [ ] **TASK-008**: 管理后台 - 批量导入
  - **开始时间**: 2026-02-24 16:30
  - 正在实现 Excel 解析功能...

---

## ✅ 已完成任务（本日）

- [x] **TASK-000**: 项目初始化
  - **完成时间**: 2026-02-24 14:30
  - **实际耗时**: 0.5 小时

- [x] **TASK-001**: 数据库 Schema 设计
  - **完成时间**: 2026-02-24 15:30
  - **实际耗时**: 1 小时

...
```

---

## 🔄 中断和恢复

### 如果需要中断执行

在新会话中对 Claude 说：
```
暂停执行，我需要先处理其他事情
```

Claude 会：
1. 完成当前步骤
2. 更新 DAILY-LOG.md
3. 提交代码
4. 告诉您下一次从哪里继续

### 恢复执行

下次打开新会话时：
```
继续执行 E:\musekidoc 项目的开发计划

请先读取 docs/DAILY-LOG.md 了解当前进度，
然后从上次中断的地方继续执行 phase-1-implementation-plan.md
```

---

## ✅ 完成标志

当所有 18 个任务完成后，Claude 会告诉您：

```
🎉 Phase 1 (MVP 基础功能) 全部完成！

已完成：
✅ 18/18 任务
✅ 14 条数据已迁移
✅ 前台可浏览、搜索
✅ 管理后台可 CRUD
✅ 批量导入功能可用

验收测试：
1. 访问 http://localhost:3000 - 前台功能
2. 访问 http://localhost:3000/admin - 后台功能
3. 测试添加新条目（< 5 分钟完成）

下一步：
开始内容填充工作，参考 docs/AI-CONTENT-GUIDE.md
```

---

## 📞 需要帮助？

如果执行过程中遇到无法解决的问题：

1. 查看 DAILY-LOG.md 的"遇到的问题"区域
2. 检查 Git 提交历史，看最后成功的任务
3. 在当前会话中询问 Claude 具体错误
4. 如果需要人工介入，Claude 会明确告诉您

---

**准备好了吗？打开新会话，复制步骤 2 中的提示词，开始执行！**

**预计执行时间**: 2-4 小时（取决于机器性能和网络速度）
