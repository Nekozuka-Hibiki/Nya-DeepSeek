# Nya-DeepSeek – 喵搜 DeepSeek

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-brightgreen)](https://www.tampermonkey.net/)
[![Download](https://img.shields.io/badge/Download-安装-blue?style=flat&logo=github)](https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js)

> 地址栏一键搜索 DeepSeek，自动附加预设提示词，零延迟发送，支持多模式切换

## ✨ 功能亮点

- 🚀 **地址栏快捷启动** – 配合浏览器设置搜索引擎，地址栏输入问题即可快速搜索 DeepSeek
- 🎯 **6 种预设模式** – 通过 `&mode=模式名` 切换：
  - `search` – 搜索引擎模式（默认）
  - `fast` – 极简回答（一句话）
  - `explain` – 通俗解释（零基础）
  - `academic` – 学术严谨
  - `decision` – 对比决策
  - `translate` – 翻译/润色
- 📋 **右键菜单** – 任意页面右键，选择模式，输入问题，自动打开 DeepSeek 并发送
- ⚡ **零延迟发送** – 填充内容后立即触发，响应极快
- 🧹 **自动清理 URL** – 发送后自动移除 `?q=` 和 `&mode=` 参数
- 🔄 **自动更新** – 通过 GitHub 托管，Tampermonkey 自动检查更新

## 📦 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 点击 **[![Download](https://img.shields.io/badge/Download-安装-blue?style=flat&logo=github)](https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js)** 安装脚本
3. 确认脚本已启用

## 🚀 使用方法

> **设置浏览器搜索引擎**

以 Chrome 为例：
1. 打开 Chrome 设置 → **搜索引擎** → **管理搜索引擎和网站搜索**
2. 点击 **添加**，填写：
   - **搜索引擎**：`DeepSeek`
   - **快捷字词**：`ds`（或任意你喜欢的，比如 `s`、`ai`）
   - **URL**：`https://chat.deepseek.com/?q=%s`
3. 保存后，在地址栏输入`你的问题`即可快速跳转并自动搜索
4. 若要指定模式，加上`&mode=xxx`：你的问题&mode=explain

### 方式二：地址栏直接输入完整 URL

如果未设置搜索引擎，也可以直接在地址栏输入以下格式：

- 基础搜索：`https://chat.deepseek.com/?q=你的问题`
- 指定模式：`https://chat.deepseek.com/?q=你的问题&mode=explain`

### 方式三：右键菜单

任意页面右键 → 油猴菜单 → 选择模式 → 输入问题 → 自动打开 DeepSeek 并发送

## ⚙️ 自定义提示词

你可以编辑脚本开头的 `PROMPTS` 对象，自由修改各模式的提示内容，或新增自己的模式

## 🖼️ 图标

脚本默认使用 DeepSeek 官方图标

## 📄 许可证

MIT © [Nekozuka-Hibiki](https://github.com/Nekozuka-Hibiki)

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com) – 强大的 AI 模型
- [Tampermonkey](https://www.tampermonkey.net) – 用户脚本管理器

**喵～ 让搜索更优雅 🐾**
