### templet-cli-plus

> 一个融合了多种指令的脚手架工具，都是我平时用到的，所以就把它们整合到一起了，方便自己使用，也方便大家使用。

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

#### kill 占用端口指令

```shell
temp kill <port>

    port --> 端口号(如：8080)

```

#### 更新指令

```shell
temp update

```

#### 帮助指令

```shell
temp help
```
