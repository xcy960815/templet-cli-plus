# Commitlint 测试指南

## 测试不规范的 Commit 信息

本指南说明如何测试 commitlint 是否能正确拦截不规范的 commit 信息。

## 前提条件

⚠️ **注意**：`@commitlint/cli@20.x` 需要 Node.js 16.9.0+ 版本。如果当前使用的是 Node 14，需要升级 Node 版本或降级 commitlint 版本。

## 测试方法

### 方法1：使用 git commit（推荐）

这是最接近真实场景的测试方式。commitlint 会在 `git commit` 时通过 husky 的 `commit-msg` hook 自动运行。

#### 测试步骤

1. **创建一个测试文件并添加到暂存区**：

   ```bash
   echo "test content" > test-file.txt
   git add test-file.txt
   ```

2. **尝试使用不规范的 commit 信息提交**：

   **❌ 不规范的示例（应该被拦截）**：

   ```bash
   # 缺少 type 前缀
   git commit -m "test commit"

   # type 大写（应该是小写）
   git commit -m "FEAT: add new feature"

   # 缺少 subject
   git commit -m "feat:"

   # subject 以句号结尾
   git commit -m "feat: add feature."

   # 使用不支持的 type
   git commit -m "update: something"
   ```

   **✅ 规范的示例（应该通过）**：

   ```bash
   # 标准格式
   git commit -m "feat: add new feature"

   # 带 scope
   git commit -m "fix(cli): resolve bug"

   # 带 body
   git commit -m "docs: update readme" -m "更新了使用说明"
   ```

3. **预期结果**：
   - 不规范的 commit 信息会被拦截，提交失败，并显示错误信息
   - 规范的 commit 信息会通过验证，提交成功

### 方法2：直接使用 commitlint 命令

如果 Node 版本兼容，可以直接测试 commitlint：

```bash
# 测试不规范的 commit 信息（应该失败）
echo "test commit" | npx commitlint

# 测试规范的 commit 信息（应该通过）
echo "feat: add new feature" | npx commitlint
```

### 方法3：使用 npm script

使用 package.json 中定义的脚本：

```bash
# 测试 commitlint（需要提供 commit message）
npm run commitlint
```

## Commitlint 规则说明

根据 `commitlint.config.js` 配置，commit 信息必须遵循以下规则：

### 格式要求

```
<type>(<scope>): <subject>
```

### Type 类型（必须小写）

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 增加测试
- `build`: 构建过程或辅助工具的变动
- `ci`: CI 配置相关
- `chore`: 其他改动
- `types`: 类型定义文件修改
- `revert`: 回滚

### 规则限制

1. ✅ `type` 必须存在且不能为空
2. ✅ `type` 必须小写
3. ✅ `type` 必须是上述列表中的一个
4. ✅ `subject` 必须存在且不能为空
5. ✅ `subject` 不能以句号结尾
6. ✅ 整个 header 长度不能超过 100 个字符
7. ✅ `scope`（如果存在）必须小写

## 测试用例示例

### 应该被拦截的 commit 信息

```bash
# ❌ 缺少 type
git commit -m "just a test"

# ❌ type 大写
git commit -m "FEAT: add feature"

# ❌ 缺少 subject
git commit -m "feat:"

# ❌ subject 以句号结尾
git commit -m "feat: add feature."

# ❌ 不支持的 type
git commit -m "update: something"

# ❌ scope 大写
git commit -m "feat(CLI): add feature"

# ❌ header 超过 100 字符
git commit -m "feat: this is a very long commit message that exceeds the maximum length limit of one hundred characters"
```

### 应该通过的 commit 信息

```bash
# ✅ 标准格式
git commit -m "feat: add new feature"

# ✅ 带 scope
git commit -m "fix(cli): resolve bug"

# ✅ 带 body（body 不受限制）
git commit -m "docs: update readme" -m "详细更新了使用说明和示例"

# ✅ 不同类型的规范提交
git commit -m "test: add unit tests"
git commit -m "chore: update dependencies"
git commit -m "refactor: improve code structure"
```

## 故障排除

### 问题1：commitlint 命令报错 `Object.hasOwn is not a function`

**原因**：Node.js 版本过低（需要 16.9.0+）

**解决方案**：

1. 升级 Node.js 到 16.9.0 或更高版本
2. 或降级 commitlint 到兼容 Node 14 的版本（如 `@commitlint/cli@17.x`）

### 问题2：git commit 时没有触发 commitlint

**检查项**：

1. 确认 `.husky/commit-msg` 文件存在且可执行
2. 确认 `husky install` 已运行（`npm install` 会自动运行）
3. 确认 `.husky/commit-msg` 文件内容正确

### 问题3：commitlint 没有拦截不规范的 commit

**检查项**：

1. 确认 `commitlint.config.js` 文件存在
2. 确认配置规则正确
3. 检查 husky hook 是否正确配置

## 验证配置

运行以下命令验证 commitlint 配置是否正确：

```bash
# 检查 commitlint 配置
npx commitlint --help

# 验证配置文件语法
node -e "console.log(require('./commitlint.config.js'))"
```
