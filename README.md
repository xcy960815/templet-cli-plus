### templet-cli-plus

> 一个实用的 cli，内置像 rollup 打包 js、ts、vue2、vue3 各种模版，同时也提供 vscode-webview-ts 模版，还有其他指令，如：创建模版、更新模版、查看模版列表、帮助、

### 安装

```shell
 npm install templet-cli-plus -g
```

#### 查看版本

```shell
    temp -v
```

#### 查看模版列表

```shell
temp list
```

#### 初始化指令

```shell
temp init
```

#### 创建指定模版指令

```shell
temp create <templateName> <projectName>

    templateName --> 模板名称(不知道模板名称可以执行 temp list 查看)

    projectName --> 项目名称(自己的项目名称,如 test)
```

#### 代理 github clone 指令

```shell
temp clone <githubUrl>

    githubUrl --> github 仓库地址(给不支持科学上网的同学用的)

```

#### 全局替换远程仓库指令

```shell
temp replace <originUrl>

    originUrl --> 远程仓库地址(originUrl是你的远程github用户地址，不是具体某个仓库地址，如：https://github.com/username)

```

#### 更新指令

```shell
temp update

```

#### 帮助指令

```shell
temp help
```
