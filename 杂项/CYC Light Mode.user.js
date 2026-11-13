// ==UserScript==
// @name         CYC Light Mode
// @description  轻量级全站浅色适配 + 铺满全屏 + 固定 7 列大图 + 隐藏下载 APP 按钮 + 修复滚动边框 Bug
// @namespace    https://github.com/Nekozuka-Hibiki
// @version      26.11.13
// @author       Nekozuka-Hibiki
// @license      GPL-3.0
// @homepageURL  https://github.com/Nekozuka-Hibiki/QwQNT-transisio-scriptio-packs
// @icon         https://www.cycani.org/favicon.ico
// @match        https://www.cycani.org/*
// @match        https://cycani.org/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ID = 'cyc-light-mode-style';

  const css = String.raw`
/* =========================================================
   1. 主题变量
   ========================================================= */
:root, html, body {
  color-scheme: light !important;

  /* 覆盖原站 CSS 变量（否则仍是深色值） */
  --background: 240 10% 96% !important;
  --foreground: 240 10% 10% !important;
  --card: 240 10% 96% !important;
  --card-foreground: 240 10% 10% !important;
  --popover: 240 10% 96% !important;
  --popover-foreground: 240 10% 10% !important;
  --primary: 262 83% 48% !important;
  --primary-foreground: 0 0% 100% !important;
  --secondary: 240 10% 92% !important;
  --secondary-foreground: 240 5.9% 10% !important;
  --muted: 240 10% 92% !important;
  --muted-foreground: 240 3.8% 46.1% !important;
  --accent: 240 10% 92% !important;
  --accent-foreground: 240 5.9% 10% !important;
  --border: 240 10% 88% !important;
  --input: 240 10% 88% !important;
  --ring: 262 83% 48% !important;

  /* 快捷变量：切换主题色只需改这组 */
  --cyc-bg: hsl(240 10% 96%);
  --cyc-border: hsl(240 10% 88%);
  --cyc-muted: hsl(240 10% 92%);
  --cyc-muted-fg: hsl(240 5.9% 46%);
  --cyc-fg: #111827;
  --cyc-pri: hsl(262 83% 48%);
  --cyc-pri-bg: hsl(262 83% 92%);
  --cyc-pri-bg-hover: hsl(262 83% 88%);
  --cyc-pri-text: hsl(262 83% 40%);
  --cyc-pri-border: hsl(262 83% 80%);
  --cyc-pri-border-strong: hsl(262 83% 78%);
  --cyc-pri-ring: hsl(262 83% 62%);
  --cyc-pri-soft: hsl(262 83% 97%);
}

html, body {
  background-color: var(--cyc-bg) !important;
  color: #111111 !important;
}

/* =========================================================
   2. 紫色胶囊（分类筛选 / 选集）
   ========================================================= */
:is(
  button.bg-brand-subtle,
  button[aria-pressed="true"][class*="rounded-full"],
  a[aria-current="true"]:not(nav a):not(header a)
) {
  background: var(--cyc-pri-bg) !important;
  color: var(--cyc-pri-text) !important;
  border-color: var(--cyc-pri-border) !important;
  border-radius: 9999px !important;
  font-weight: 500 !important;
}
:is(
  button.bg-brand-subtle,
  button[aria-pressed="true"][class*="rounded-full"],
  a[aria-current="true"]:not(nav a):not(header a)
):hover {
  background: var(--cyc-pri-bg-hover) !important;
  color: var(--cyc-pri-text) !important;
  border-color: var(--cyc-pri-border) !important;
}

/* =========================================================
   3. 正序 / 倒序
   ========================================================= */
.flex.rounded-md.border.border-border.p-0\.5 {
  border-color: var(--cyc-border) !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="true"] {
  background: var(--cyc-pri-bg) !important;
  color: var(--cyc-pri-text) !important;
  border: none !important;
  border-radius: 4px !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="true"]:hover {
  background: var(--cyc-pri-bg-hover) !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="false"] {
  background: transparent !important;
  color: var(--cyc-muted-fg) !important;
  border: none !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="false"]:hover {
  background: var(--cyc-muted) !important;
}

/* 首页周表 / 排行榜 tab：保留灰色选中态，不套紫色 */
button[aria-pressed="true"][class*="bg-background/80"] {
  background: var(--cyc-border) !important;
  color: hsl(240 10% 15%) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
}

/* =========================================================
   4. 集数网格
   ========================================================= */
a[title^="第"] {
  background: transparent !important;
  color: hsl(240 5.9% 30%) !important;
  border: 1px solid var(--cyc-border) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}
a[title^="第"]:hover {
  background: var(--cyc-muted) !important;
  border-color: var(--cyc-muted-fg) !important;
}
a[title^="第"][aria-current="page"] {
  background: var(--cyc-pri-bg) !important;
  color: var(--cyc-pri-text) !important;
  border-color: var(--cyc-pri-border) !important;
  font-weight: 600 !important;
}
a[title^="第"][aria-current="page"]:hover {
  background: var(--cyc-pri-bg-hover) !important;
}

/* =========================================================
   5. 首页 Hero
   ========================================================= */
[class*="h-[58%]"][class*="bg-gradient-to-b"] {
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.72),
    rgba(255, 255, 255, 0.95)
  ) !important;
}
section:has(.home-hero-title-highlight) .container.pointer-events-none :is(h1, h1 span, p, p span) {
  color: var(--cyc-fg) !important;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7) !important;
}
section:has(.home-hero-title-highlight) .container.pointer-events-none span[class*="bg-black/40"] {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  color: var(--cyc-fg) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
}
section:has(.home-hero-title-highlight) :is(button[aria-label="上一张"], button[aria-label="下一张"]) {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  color: #374151 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}
section:has(.home-hero-title-highlight) :is(button[aria-label="上一张"], button[aria-label="下一张"]):hover {
  background: #ffffff !important;
  color: var(--cyc-fg) !important;
}

/* =========================================================
   6. 首页轮播推荐
   ========================================================= */
[class*="outline-white"] {
  outline-color: var(--cyc-pri-ring) !important;
  box-shadow: 0 0 0 1px var(--cyc-pri-ring), 0 0 16px rgba(124, 58, 237, 0.18) !important;
}
:is(.home-hero-title-highlight, .text-card-foreground span[class*="line-clamp-2"]) {
  text-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}
.home-hero-title-highlight {
  color: var(--cyc-pri) !important;
  font-weight: 600 !important;
}
.text-card-foreground span[class*="line-clamp-2"]:not(.home-hero-title-highlight) {
  color: #0f172a !important;
}

/* =========================================================
   7. 品牌色卡片 / 评论置顶
   ========================================================= */
:is(span.bg-brand-subtle, div.bg-brand-subtle) {
  background: var(--cyc-pri-bg) !important;
  color: var(--cyc-pri-text) !important;
}
article.bg-brand-subtle {
  background: var(--cyc-pri-soft) !important;
  border: 1px solid var(--cyc-pri-border-strong) !important;
  border-radius: 8px !important;
  padding: 12px !important;
}
article.bg-brand-subtle .rounded-full {
  background: var(--cyc-pri) !important;
  color: #ffffff !important;
  border: none !important;
}

/* =========================================================
   8. 顶部导航栏
   ========================================================= */
header.fixed :is([class*="text-white"], [class*="text-white"] svg) {
  color: var(--cyc-fg) !important;
}
header.fixed [class*="text-white"] {
  text-shadow: none !important;
}
header.fixed [class*="drop-shadow"] {
  filter: none !important;
}
header.fixed .site-wordmark {
  color: var(--cyc-pri) !important;
  -webkit-text-fill-color: currentColor !important;
  background: none !important;
}
header.fixed [class*="hover:bg-white"]:hover {
  background: rgba(0, 0, 0, 0.08) !important;
}
header.fixed input[type="search"] {
  background: rgba(255, 255, 255, 0.6) !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
  color: var(--cyc-fg) !important;
}
header.fixed input[type="search"]::placeholder {
  color: rgba(0, 0, 0, 0.45) !important;
}
header.fixed [class*="border-white/"] {
  border-color: rgba(0, 0, 0, 0.15) !important;
}
header.fixed button[aria-haspopup="menu"] {
  background: rgba(255, 255, 255, 0.65) !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
}

/* =========================================================
   9. 详情页 / 播放页 / 排行榜细节
   ========================================================= */
.text-score {
  color: hsl(24 90% 42%) !important;
}
[class*="text-[hsl(25_70%_58%)]"] {
  color: #b45309 !important;
}
[class*="shadow-[0_18px_60px"] {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

/* =========================================================
   10. 杂项补丁
   ========================================================= */
[class*="text-white/95"] {
  color: rgba(17, 24, 39, 0.75) !important;
}
[class*="text-[hsl(0_0%_70%)]"] {
  color: #6b7280 !important;
}
[class*="text-[hsl(36_100%_58%)]"] {
  color: #d97706 !important;
}
[class*="bg-[hsl(350"] { background: hsl(350 50% 95%) !important; }
[class*="border-[hsl(350"] { border-color: hsl(350 55% 84%) !important; }
[class*="bg-[hsl(150"] { background: hsl(150 30% 94%) !important; }
[class*="border-[hsl(150"] { border-color: hsl(150 36% 80%) !important; }
[class*="shadow-[0_8px_24px_rgba(0,0,0,0.28)]"] { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important; }
[class*="shadow-[0_4px_16px_rgba(0,0,0,0.55)]"] { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important; }

/* =========================================================
   11. 滚动条
   ========================================================= */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--cyc-bg); }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

/* =========================================================
   12. 针对 2K 屏幕：铺满 & 固定 7 列
   ========================================================= */
header > .container,
main > .container,
footer > .container {
  max-width: 100% !important;
  padding-left: 3vw !important;
  padding-right: 3vw !important;
}

main .grid.grid-cols-3 {
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: 2.25rem !important;
}

/* =========================================================
   13. 精准隐藏右下角的"下载 APP"浮动按钮
   ========================================================= */
a[href="https://mdl.cycity.pro/"] {
  display: none !important;
}

/* =========================================================
   14. 修复周表按钮上边框滚动后消失的 Bug
   ========================================================= */
/* 父容器上下加 1px 缓冲，防止 overflow-x-auto 裁切 */
.flex.gap-2.overflow-x-auto {
  padding-top: 1px !important;
  padding-bottom: 1px !important;
}

/* 边框改用内阴影（box-shadow），彻底免疫滚动重绘丢失 */
button.h-8.shrink-0.rounded-full.border {
  border-color: transparent !important;
  box-shadow: inset 0 0 0 1px var(--cyc-border) !important;
}

/* 选中态（如周六）的内阴影 */
button.h-8.shrink-0.rounded-full.border[aria-pressed="true"] {
  box-shadow: inset 0 0 0 1px var(--cyc-pri-border) !important;
}

/* 悬停态的边框颜色 */
button.h-8.shrink-0.rounded-full.border:hover:not([aria-pressed="true"]) {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2) !important;
}
  `;

  // 注入样式（幂等）
  function ensureStyle() {
    if (!document.documentElement || document.getElementById(STYLE_ID)) return;
    const el = Object.assign(document.createElement('style'), {
      id: STYLE_ID,
      textContent: css,
    });
    (document.head || document.documentElement).appendChild(el);
  }

  // 同步 meta 标签，避免浏览器地址栏仍显示深色主题色
  function syncMeta() {
    const set = (sel, attr, val) => {
      const el = document.querySelector(sel);
      if (el && el.getAttribute(attr) !== val) el.setAttribute(attr, val);
    };
    set('meta[name="theme-color"]', 'content', '#f4f4f7');
    set('meta[name="color-scheme"]', 'content', 'light');
  }

  // 主入口
  function apply() {
    ensureStyle();
    syncMeta();
    document.documentElement.classList.remove('dark');
  }

  // document-start 立即执行
  apply();

  // DOM 就绪后再补一次（确保 meta 已存在）
  document.addEventListener('DOMContentLoaded', apply, { once: true });
  window.addEventListener('load', apply, { once: true });

  // 只在 <style> 被 React 重渲染移除时重新注入
  function observeHead() {
    if (!document.head) return;
    new MutationObserver(() => {
      if (!document.getElementById(STYLE_ID)) ensureStyle();
    }).observe(document.head, { childList: true });
  }

  if (document.head) observeHead();
  else document.addEventListener('DOMContentLoaded', observeHead, { once: true });
})();
