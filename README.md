# Nya-DeepSeek – 喵搜 DeepSeek

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-brightgreen)](https://www.tampermonkey.net/)
[![Download](https://img.shields.io/badge/Download-安装-blue?style=flat&logo=github)](https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js)

> 一个油猴脚本，让你在任意网页快速调用 DeepSeek 提问，内置多种提问风格

## 功能

- 在任意网页通过油猴菜单快速向 DeepSeek 提问
- 自动打开 DeepSeek 并填充问题与预设提示词
- 支持四种模式：喵搜、笨喵解释、喵对比、喵翻译/润色
- 可作为浏览器搜索引擎使用（通过 URL 参数）

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或兼容的用户脚本管理器
2. 点击安装链接：[Nya-DeepSeek.user.js](https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js)

## 使用

安装后，可以通过以下方式使用

### 1. 通过地址栏

脚本支持通过 URL 参数直接调用

**方式一：设为浏览器搜索引擎**

以 Chrome 为例：

1. 打开 Chrome 设置 → 搜索引擎 → 管理搜索引擎和网站搜索
2. 点击“添加”，为每个模式分别添加：
   - 喵搜：快捷字词 `nya`，URL `https://chat.deepseek.com/?q=%s`
   - 笨喵解释：快捷字词 `nyae`，URL `https://chat.deepseek.com/?q=%s&mode=explain`
   - 喵对比：快捷字词 `nyad`，URL `https://chat.deepseek.com/?q=%s&mode=decision`
   - 喵翻译/润色：快捷字词 `nyat`，URL `https://chat.deepseek.com/?q=%s&mode=translate`
3. 保存后，在地址栏输入 `nya 你的问题` 并回车即可

**方式二：直接输入完整 URL**

如果未设置搜索引擎，也可以直接在地址栏输入以下格式：

- 基础搜索：`https://chat.deepseek.com/?q=你的问题`
- 指定模式：`https://chat.deepseek.com/?q=你的问题&mode=explain`

### 2. 通过菜单

在任意网页打开油猴扩展菜单，会看到以下命令：

- 🔍 喵搜（默认）
- 📚 笨喵解释
- ⚖️ 喵对比
- 🌐 喵翻译/润色

点击任意命令，输入问题，即可自动打开 DeepSeek 并发送

也可以在任意页面右键 → 油猴菜单 → 选择模式 → 输入问题 → 自动打开 DeepSeek 并发送

## 🖼️ 图标

脚本默认使用 DeepSeek 官方图标

## 📄 许可证

MIT © [Nekozuka-Hibiki](https://github.com/Nekozuka-Hibiki)

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com) – 强大的 AI 模型
- [Tampermonkey](https://www.tampermonkey.net) – 用户脚本管理器

**喵～ 让搜索更优雅 🐾**
