# 单元测试运行指南

## 基本命令

### 1. 运行所有测试

```bash
npm test
```

### 2. 运行单个测试文件

```bash
# 方式1：使用文件路径
npm test -- __tests__/commands/help.test.ts

# 方式2：使用文件名模式
npm test -- help.test.ts

# 方式3：使用相对路径
npm test -- ./__tests__/commands/update.test.ts
```

### 3. 运行单个测试用例（通过测试名称匹配）

```bash
# 运行包含 "应该检查 CLI 版本" 的测试
npm test -- -t "应该检查 CLI 版本"

# 运行包含 "update" 的测试
npm test -- -t "update"

# 注意：-t 参数会匹配所有测试文件中符合名称的测试用例
```

### 4. 运行特定测试文件中的特定测试用例

```bash
# 先指定文件，再指定测试名称
npm test -- __tests__/commands/update.test.ts -t "应该检查 CLI 版本"
```

### 5. Watch 模式（监听文件变化，自动重新运行测试）

```bash
# 运行所有测试的 watch 模式
npm run test:watch

# 运行单个文件的 watch 模式
npm run test:watch -- __tests__/commands/help.test.ts

# 运行匹配测试名称的 watch 模式
npm run test:watch -- -t "应该检查 CLI 版本"
```

### 6. 运行测试并显示覆盖率

```bash
npm run test:coverage
```

## 常用 Jest 参数

### 只运行失败的测试

```bash
npm test -- --onlyFailures
```

### 运行最近修改的测试

```bash
npm test -- --onlyChanged
```

### 详细输出模式

```bash
npm test -- --verbose
```

### 在第一个失败时停止

```bash
npm test -- --bail
```

### 清除缓存

```bash
npm test -- --clearCache
```

## 示例场景

### 场景1：只测试 update 命令

```bash
npm test -- __tests__/commands/update.test.ts
```

### 场景2：只测试 "应该检查 CLI 版本" 这个用例

```bash
npm test -- -t "应该检查 CLI 版本"
```

### 场景3：开发时持续测试 update 命令

```bash
npm run test:watch -- __tests__/commands/update.test.ts
```

### 场景4：测试所有包含 "错误" 的测试用例

```bash
npm test -- -t "错误"
```

## 提示

1. **使用 `--` 分隔参数**：`npm test --` 后面的参数会传递给 Jest
2. **测试名称匹配**：`-t` 参数支持正则表达式，例如 `-t "update|init"`
3. **文件路径匹配**：可以直接使用文件名，Jest 会自动查找匹配的文件
4. **Watch 模式交互**：
   - 按 `a` 运行所有测试
   - 按 `f` 只运行失败的测试
   - 按 `p` 按文件名过滤
   - 按 `t` 按测试名称过滤
   - 按 `q` 退出 watch 模式
