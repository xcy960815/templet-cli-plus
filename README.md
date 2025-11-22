# templet-cli-plus

> 一个融合了多种实用指令的脚手架工具，整合了项目模板管理、GitHub 代理克隆、端口管理等常用功能，让开发更高效。

[![npm version](https://img.shields.io/npm/v/templet-cli-plus.svg)](https://www.npmjs.com/package/templet-cli-plus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

## ✨ 特性

- 🚀 **快速创建项目** - 通过模板快速初始化项目，支持交互式配置
- 📦 **模板管理** - 查看和管理可用的项目模板列表
- 🌐 **GitHub 代理克隆** - 支持通过代理克隆 GitHub 仓库，解决网络问题
- 🔄 **远程仓库替换** - 批量替换项目中的远程仓库地址
- 🔪 **端口管理** - 快速终止占用指定端口的进程
- 🔄 **自动更新** - 检查并更新 CLI 工具到最新版本
- 📝 **交互式配置** - 友好的命令行交互界面

## 📋 系统要求

- Node.js >= 14.0.0
- pnpm >= 8.0.0

## 📦 安装

### 安装 pnpm（如果还没有安装）

```bash
npm install -g pnpm
```

### 安装 templet-cli-plus

```bash
pnpm install templet-cli-plus -g
```

## 🚀 快速开始

### 查看版本

```bash
    temp -v
# 或
temp --version
```

### 查看帮助

```bash
temp help
```

## 📖 使用指南

### 1. 查看模板列表

查看所有可用的项目模板：

```bash
temp list
```

### 2. 初始化项目（交互式）

通过交互式界面选择模板并配置项目信息：

```bash
temp init
```

执行后会引导你：

- 选择项目模板
- 输入项目名称
- 设置项目版本
- 填写项目描述
- 设置作者信息

### 3. 快速创建项目

直接通过命令行参数创建项目：

```bash
temp create <templateName> <projectName>
```

**参数说明：**

- `templateName` - 模板名称（可通过 `temp list` 查看可用模板）
- `projectName` - 项目名称

**示例：**

```bash
temp create react-template my-app
```

### 4. GitHub 代理克隆

通过代理克隆 GitHub 仓库，解决网络访问问题：

```bash
temp clone <githubUrl>
```

**参数说明：**

- `githubUrl` - GitHub 仓库地址

**示例：**

```bash
temp clone https://github.com/username/repository.git
```

### 5. 替换远程仓库地址

批量替换当前目录下所有 Git 仓库的远程地址：

```bash
temp replace <originUrl>
```

**参数说明：**

- `originUrl` - 新的远程仓库地址（GitHub 用户地址，不是具体仓库地址）

**示例：**

```bash
temp replace https://github.com/your-username
```

### 6. 终止端口进程

快速终止占用指定端口的进程：

```bash
temp kill <port>
```

**参数说明：**

- `port` - 端口号

**示例：**

```bash
temp kill 8080
```

### 7. 更新 CLI 工具

检查并更新 `templet-cli-plus` 到最新版本：

```bash
temp update
```

## 📝 命令列表

| 命令                            | 说明                 | 示例                                          |
| ------------------------------- | -------------------- | --------------------------------------------- |
| `temp -v` / `temp --version`    | 查看版本号           | `temp -v`                                     |
| `temp help`                     | 查看帮助信息         | `temp help`                                   |
| `temp list`                     | 查看模板列表         | `temp list`                                   |
| `temp init`                     | 交互式初始化项目     | `temp init`                                   |
| `temp create <template> <name>` | 快速创建项目         | `temp create react-template my-app`           |
| `temp clone <url>`              | 代理克隆 GitHub 仓库 | `temp clone https://github.com/user/repo.git` |
| `temp replace <url>`            | 替换远程仓库地址     | `temp replace https://github.com/username`    |
| `temp kill <port>`              | 终止端口进程         | `temp kill 8080`                              |
| `temp update`                   | 更新 CLI 工具        | `temp update`                                 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加新功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 👤 作者

**xcy960815**

- GitHub: [@xcy960815](https://github.com/xcy960815)
- Email: 18763006837@163.com

## 🔗 相关链接

- [GitHub 仓库](https://github.com/xcy960815/templet-cli-plus)
- [问题反馈](https://github.com/xcy960815/templet-cli-plus/issues)
- [npm 包](https://www.npmjs.com/package/templet-cli-plus)

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！
