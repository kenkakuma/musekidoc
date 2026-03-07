# 多 Agent 协作工作流程

## 📋 任务分配策略

### Phase 1: 内容分析 (Explore Agent)
**任务**: 分析现有数据，识别缺失内容

**输入给 Agent**:
```
请分析 musekidoc 项目的陶艺知识库内容完整度：

1. 检查数据库 schema (prisma/schema.prisma)
2. 统计各分类的条目数量
3. 对比侧边栏导航 (components/notion-layout/NotionSidebar.tsx) 中列出的分类
4. 生成缺失内容清单，按优先级排序

输出格式：
- 现有条目统计
- 缺失/薄弱的分类列表
- 每个分类建议补充的条目数量
```

**预期输出**:
- 完整度分析报告
- 优先补充清单

---

### Phase 2: 内容搜索 (Deep-Research Agent)
**任务**: 深度搜索特定主题的内容

**输入给 Agent**:
```
请搜索并整理以下日本陶艺主题的详细信息：

**主题**: [六古窑/现代名窑/制作技法/器物用途] 中的 [具体子分类]

**搜索要求**:
1. 中文、日文、英文多语言搜索
2. 查找权威来源（博物馆、学术机构、专业网站）
3. 收集以下信息：
   - 名称 (中文/日文/英文)
   - 历史背景
   - 特征描述
   - 代表作品/作家
   - 相关图片来源

**输出格式**:
按照 data/pottery-entries-template.json 格式整理
每个条目包含完整字段和来源链接
```

**预期输出**:
- JSON 格式的条目数据
- 来源引用清单

---

### Phase 3: 数据处理 (Python Expert)
**任务**: 批量处理和导入数据

**输入给 Agent**:
```
请创建数据处理脚本：

1. 读取 data/*.json 文件
2. 验证数据格式和完整性
3. 批量调用 API 导入数据库
   - API: POST /api/admin/import-pottery-entries
   - 参数: { "entries": [...] }
4. 记录导入结果和错误

**技术栈**:
- Python 3.x
- requests 库
- 数据验证

**输出**:
- scripts/batch-import.py
- 导入日志文件
```

**预期输出**:
- 自动化导入脚本
- 执行报告

---

## 🔄 协作模式

### 模式 A: 串行执行（推荐用于初次尝试）
```
Explore → Deep-Research → Python Expert
   ↓           ↓              ↓
 分析      搜索内容        导入数据
```

**优点**:
- 步骤清晰，易于追踪
- 每个阶段可以验证结果

**使用方法**:
1. 先启动 Explore agent
2. 等待结果，根据清单启动 Deep-Research
3. 收到搜索结果后，启动 Python Expert 导入

---

### 模式 B: 并行执行（适合已知缺失内容）
```
Deep-Research (主题A) ┐
Deep-Research (主题B) ├→ Python Expert → 批量导入
Deep-Research (主题C) ┘
```

**优点**:
- 速度快，同时搜索多个主题
- 适合大批量补充内容

**使用方法**:
1. 同时启动多个 Deep-Research agents
2. 设置 run_in_background: true
3. 等待所有完成后，统一导入

---

## 📝 具体操作示例

### 示例 1: 补充"釉药技法"分类

**Step 1 - 启动研究 Agent**:
```
/task deep-research-agent "搜索日本陶艺釉药技法" --model sonnet
```

然后输入详细提示：
```
请搜索并整理日本陶艺的釉药技法，重点包括：

1. 基础釉药：
   - 灰釉（hai-yu）
   - 铁釉（tetsu-yu）
   - 铜釉（do-yu）
   - 钴釉（ko-yu）

2. 特殊技法：
   - 志野釉（Shino）
   - 织部釉（Oribe）
   - 黄瀬戸（Ki-seto）
   - 瑠璃釉（Ruri）

对每个技法，收集：
- 名称（中/日/英）
- 历史起源
- 制作工艺
- 视觉特征
- 代表窑场和作品
- 参考来源

输出为 JSON 格式，符合项目的 PotteryEntry schema。
```

**Step 2 - 处理结果**:
Agent 完成后会返回结构化数据，你可以：
1. 保存到 `data/glaze-techniques.json`
2. 人工审核和调整
3. 使用 API 导入

---

### 示例 2: 批量补充作家信息

**使用并行 agents**:
```typescript
// 创建多个并行任务
const tasks = [
  { theme: "人间国宝-陶艺", count: 10 },
  { theme: "现代陶艺家-关西地区", count: 15 },
  { theme: "民艺运动-代表作家", count: 8 }
]

// 为每个主题启动 agent
tasks.forEach(task => {
  启动 deep-research-agent，搜索 task.theme
})
```

---

## 🛠️ Agent 交互模板

### Template 1: 内容搜索任务
```markdown
## 任务目标
搜索并整理 [主题名称] 相关的完整信息

## 搜索范围
- 中文资源：百度百科、知乎、专业博客
- 日文资源：Wikipedia.jp、陶艺协会网站
- 英文资源：学术论文、博物馆数据库

## 信息要求
1. **基础信息**：名称、定义、历史
2. **技术细节**：工艺流程、材料特点
3. **视觉特征**：颜色、质感、纹理
4. **文化背景**：美学思想、代表人物
5. **现代应用**：当代传承、市场情况

## 输出格式
JSON 格式，字段包括：
- slug, nameZh, nameJa, nameEn
- category, region, type
- description (200-500字详细描述)
- positioning (50字核心定位)
- signatureFeatures (3-5个特征)
- keywords (5-10个关键词)
- notableArtists (相关作家)
- sources (来源链接)

## 质量标准
- 信息准确，有来源引用
- 描述详实，覆盖关键维度
- 数据结构完整，字段齐全
```

### Template 2: 数据分析任务
```markdown
## 任务目标
分析项目当前内容完整度，生成补充计划

## 分析维度
1. 按分类统计条目数量
2. 识别空白/薄弱分类
3. 评估内容质量（描述长度、字段完整度）
4. 对比行业标准（日本陶艺知识库应有的内容范围）

## 输出要求
生成优先级排序的补充清单：
- P0 (紧急): 完全空白的重要分类
- P1 (高): 条目少于3个的核心分类
- P2 (中): 内容薄弱的次要分类
- P3 (低): 可选的扩展内容

每个分类标注：
- 当前条目数
- 建议目标数
- 具体需要补充的子主题
```

---

## 📊 进度追踪

### 使用 Task Tools
```typescript
// 创建主任务
TaskCreate({
  subject: "补充陶艺知识库内容至200条目",
  description: "系统化补充各分类内容，目标从180条增至200条",
  activeForm: "补充知识库内容中"
})

// 创建子任务
TaskCreate({
  subject: "搜索釉药技法内容（10条）",
  description: "收集灰釉、铁釉等10个技法的详细信息",
  activeForm: "搜索釉药技法"
})

// 更新进度
TaskUpdate({
  taskId: "task-1",
  status: "in_progress"
})

// 完成任务
TaskUpdate({
  taskId: "task-1",
  status: "completed"
})
```

---

## 💡 最佳实践

### 1. 明确输入输出
- ✅ 清晰定义 agent 的任务目标
- ✅ 提供具体的输出格式要求
- ✅ 给出参考示例和模板

### 2. 分阶段验证
- 先让 agent 搜索 2-3 个条目作为样本
- 验证质量和格式后，再批量执行
- 避免一次性产生大量需要修正的内容

### 3. 保持上下文
- Agent 可以读取项目文件，提供相关文件路径
- 引用现有数据格式和命名规范
- 让 agent 参考已有的优质条目

### 4. 结果审核
- Agent 输出需要人工审核
- 特别注意日文名称的准确性
- 验证来源链接的有效性

---

## 🎯 快速开始

**立即行动**：
1. 使用 Explore agent 生成现状分析
2. 根据分析结果，优先补充 P0/P1 分类
3. 使用 deep-research-agent 并行搜索 3-5 个主题
4. 审核后批量导入数据库

**预期成果**：
- 1-2小时内完成现状分析
- 每个 agent 可在 30-60 分钟内完成一个主题搜索
- 一天内补充 20-30 条高质量条目
