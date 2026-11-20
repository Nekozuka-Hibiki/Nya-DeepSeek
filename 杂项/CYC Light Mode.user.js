// ==UserScript==
// @name         CYC Light Mode
// @description  全站云母浅色适配 分类页布局优化
// @namespace    https://github.com/Nekozuka-Hibiki
// @version      26.11.21
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
/* 0. 云母基础变量 */
:root {
  --cyc-mica-bg: rgba(255, 255, 255, 0.65);
  --cyc-mica-bg-hover: rgba(255, 255, 255, 0.85);
  --cyc-mica-border: rgba(255, 255, 255, 0.8);
  --cyc-mica-blur: blur(16px) saturate(180%);
}

/* 1. 主题变量 */
:root, html, body {
  color-scheme: light !important;

  --background: 240 25% 96% !important;
  --foreground: 240 10% 10% !important;
  --card: 240 25% 96% !important;
  --card-foreground: 240 10% 10% !important;
  --popover: 240 25% 96% !important;
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

  --cyc-bg: #F2F2F8;
  --cyc-border: hsl(240 10% 88%);
  --cyc-muted: hsl(240 10% 92%);
  --cyc-muted-fg: hsl(240 5.9% 46%);
  --cyc-fg: #111827;
  --cyc-pri: hsl(262 83% 48%);
  --cyc-pri-text: hsl(262 83% 40%);
  --cyc-pri-border: hsl(262 83% 80%);
  --cyc-pri-ring: hsl(262 83% 62%);
}

html, body {
  background-color: var(--cyc-bg) !important;
  color: #111111 !important;
}

/* 2. 紫色胶囊 */
:is(
  button.bg-brand-subtle,
  button[aria-pressed="true"][class*="rounded-full"],
  a[aria-current="true"]:not(nav a):not(header a)
) {
  background: rgba(243, 240, 255, 0.75) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  color: var(--cyc-pri-text) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  border-radius: 9999px !important;
  font-weight: 500 !important;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.05) !important;
}
:is(
  button.bg-brand-subtle,
  button[aria-pressed="true"][class*="rounded-full"],
  a[aria-current="true"]:not(nav a):not(header a)
):hover {
  background: rgba(237, 233, 254, 0.9) !important;
  color: var(--cyc-pri-text) !important;
}

/* 3. 正序/倒序 */
.flex.rounded-md.border.border-border.p-0\.5 {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.02) !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="true"] {
  background: var(--cyc-mica-bg) !important;
  color: var(--cyc-pri-text) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="true"]:hover {
  background: var(--cyc-mica-bg-hover) !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="false"] {
  background: transparent !important;
  color: var(--cyc-muted-fg) !important;
  border: none !important;
}
.flex.rounded-md.border.border-border.p-0\.5 > button[aria-pressed="false"]:hover {
  background: rgba(0,0,0,0.04) !important;
}

button[aria-pressed="true"][class*="bg-background/80"] {
  background: var(--cyc-mica-bg) !important;
  color: hsl(240 10% 15%) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.9) !important;
}

/* 4. 集数网格 */
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
  background: rgba(243, 240, 255, 0.8) !important;
  color: var(--cyc-pri-text) !important;
  border-color: var(--cyc-pri-border) !important;
  font-weight: 600 !important;
}

/* 5. 首页 Hero */
[class*="h-[58%]"][class*="bg-gradient-to-b"] {
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(242, 242, 248, 0.72),
    rgba(242, 242, 248, 0.95)
  ) !important;
}
section:has(.home-hero-title-highlight) .container.pointer-events-none :is(h1, h1 span, p, p span) {
  color: var(--cyc-fg) !important;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7) !important;
}
section:has(.home-hero-title-highlight) .container.pointer-events-none span[class*="bg-black/40"] {
  background: var(--cyc-mica-bg) !important;
  backdrop-filter: blur(8px) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
  color: var(--cyc-fg) !important;
}
section:has(.home-hero-title-highlight) :is(button[aria-label="上一张"], button[aria-label="下一张"]) {
  background: var(--cyc-mica-bg) !important;
  backdrop-filter: blur(8px) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
  color: #374151 !important;
}
section:has(.home-hero-title-highlight) :is(button[aria-label="上一张"], button[aria-label="下一张"]):hover {
  background: var(--cyc-mica-bg-hover) !important;
  color: var(--cyc-fg) !important;
}

/* 6. 首页轮播推荐 */
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

/* 7. 品牌色卡片/评论置顶 */
:is(span.bg-brand-subtle, div.bg-brand-subtle) {
  background: rgba(243, 240, 255, 0.8) !important;
  color: var(--cyc-pri-text) !important;
}
article.bg-brand-subtle {
  background: var(--cyc-mica-bg) !important;
  backdrop-filter: var(--cyc-mica-blur) !important;
  border: 1px solid var(--cyc-mica-border) !important;
  border-radius: 12px !important;
  padding: 12px !important;
}
article.bg-brand-subtle .rounded-full {
  background: var(--cyc-pri) !important;
  color: #ffffff !important;
  border: none !important;
}

/* 8. 顶部导航栏 */
header.fixed {
  background: rgba(242, 242, 248, 0.65) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03) !important;
}
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
  background: rgba(0, 0, 0, 0.06) !important;
}
header.fixed input[type="search"] {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  color: var(--cyc-fg) !important;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.02) !important;
}
header.fixed input[type="search"]::placeholder {
  color: rgba(0, 0, 0, 0.4) !important;
}
header.fixed button[aria-haspopup="menu"] {
  background: var(--cyc-mica-bg) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid var(--cyc-mica-border) !important;
}

/* 9-10. 细节杂项 */
.text-score { color: hsl(24 90% 42%) !important; }
[class*="text-[hsl(25_70%_58%)]"] { color: #b45309 !important; }
[class*="shadow-[0_18px_60px"] { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important; }
[class*="text-white/95"] { color: rgba(17, 24, 39, 0.75) !important; }
[class*="text-[hsl(0_0%_70%)]"] { color: #6b7280 !important; }
[class*="text-[hsl(36_100%_58%)]"] { color: #d97706 !important; }
[class*="bg-[hsl(350"] { background: hsl(350 50% 95%) !important; }
[class*="border-[hsl(350"] { border-color: hsl(350 55% 84%) !important; }
[class*="bg-[hsl(150"] { background: hsl(150 30% 94%) !important; }
[class*="border-[hsl(150"] { border-color: hsl(150 36% 80%) !important; }
[class*="shadow-[0_8px_24px_rgba(0,0,0,0.28)]"] { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important; }
[class*="shadow-[0_4px_16px_rgba(0,0,0,0.55)]"] { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important; }

/* 11. 滚动条 */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--cyc-bg); }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

/* 12. 布局：铺满 + 7 列 */
header > .container, main > .container, footer > .container {
  max-width: 100% !important;
  padding-left: 3vw !important;
  padding-right: 3vw !important;
}
main .grid.grid-cols-3 {
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: 2.25rem !important;
}

/* 13-14. 杂项修复 */
a[href="https://mdl.cycity.pro/"] { display: none !important; }
.flex.gap-2.overflow-x-auto { padding-top: 1px !important; padding-bottom: 1px !important; }
button.h-8.shrink-0.rounded-full.border {
  border-color: transparent !important;
  box-shadow: inset 0 0 0 1px var(--cyc-border) !important;
}
button.h-8.shrink-0.rounded-full.border[aria-pressed="true"] {
  box-shadow: inset 0 0 0 1px var(--cyc-pri-border) !important;
}
button.h-8.shrink-0.rounded-full.border:hover:not([aria-pressed="true"]) {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2) !important;
}
  `;

  const HIDE_STYLE_ID = 'cyc-hide-style';
  const hideCss = String.raw`
.cyc-card-wrap { position: relative; }

/* 卡片右上角屏蔽按钮 */
.cyc-card-hide-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--cyc-mica-border, rgba(255,255,255,0.8));
  border-radius: 50%;
  background: var(--cyc-mica-bg, rgba(255,255,255,0.65));
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  color: #4b5563;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
}
.cyc-card-wrap:hover .cyc-card-hide-btn { opacity: 1; }
.cyc-card-hide-btn:hover {
  background: rgba(239, 68, 68, 0.9) !important;
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.4) !important;
}

/* 二次确认弹窗 */
.cyc-confirm-popover {
  position: fixed;
  z-index: 100000;
  background: var(--cyc-mica-bg, rgba(255,255,255,0.75));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--cyc-mica-border, rgba(255,255,255,0.9));
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.8);
  padding: 16px;
  display: none;
  flex-direction: column;
  gap: 14px;
  width: max-content;
  max-width: 220px;
  animation: cyc-pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes cyc-pop-in {
  from { opacity: 0; transform: scale(0.95) translateY(-5px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.cyc-confirm-text {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  line-height: 1.5;
  word-break: break-all;
}
.cyc-confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.cyc-confirm-actions button {
  padding: 5px 14px;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  font-weight: 600;
  transition: all 0.15s;
  font-family: inherit;
}
.cyc-confirm-btn-cancel {
  background: rgba(255,255,255,0.5);
  color: #4b5563;
  border-color: rgba(0,0,0,0.05);
}
.cyc-confirm-btn-cancel:hover {
  background: rgba(255,255,255,0.9);
  border-color: rgba(0,0,0,0.1);
}
.cyc-confirm-btn-ok {
  background: #dc2626;
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}
.cyc-confirm-btn-ok:hover {
  background: #b91c1c;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

/* 悬浮按钮（竖排胶囊，默认隐藏，分类页加 .is-visible 显示） */
.cyc-hidden-panel-btn {
  position: fixed !important;
  left: 14px !important;
  top: 20% !important;
  z-index: 99999 !important;
  padding: 16px 10px !important;
  background: var(--cyc-mica-bg, rgba(255,255,255,0.65)) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  border: 1px solid var(--cyc-mica-border, rgba(255,255,255,0.9)) !important;
  border-radius: 999px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.9) !important;
  color: #1f2937 !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  font-family: inherit !important;
  cursor: pointer !important;
  writing-mode: vertical-rl !important;
  letter-spacing: 2px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: none;
  align-items: center !important;
  justify-content: center !important;
}
.cyc-hidden-panel-btn.is-visible { display: flex !important; }
.cyc-hidden-panel-btn:hover {
  background: var(--cyc-mica-bg-hover, rgba(255,255,255,0.9)) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
}

/* 已屏蔽面板 */
.cyc-hidden-panel {
  position: fixed !important;
  left: 64px !important;
  top: 20% !important;
  z-index: 99999 !important;
  width: 280px !important;
  max-height: 60vh !important;
  overflow-y: auto !important;
  background: var(--cyc-mica-bg-hover, rgba(255,255,255,0.85)) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid var(--cyc-mica-border, rgba(255,255,255,0.9)) !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.9) !important;
  padding: 16px !important;
  color: #111 !important;
  font-size: 13px !important;
  font-family: inherit !important;
  display: none;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.cyc-hidden-panel.open {
  display: block !important;
  opacity: 1 !important;
  transform: translateX(0);
}
.cyc-hidden-panel h4 {
  margin: 0 0 12px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #111 !important;
  border-bottom: 1px solid rgba(0,0,0,0.06) !important;
  padding-bottom: 10px !important;
}
.cyc-hidden-item {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 0 !important;
  border-bottom: 1px solid rgba(0,0,0,0.04) !important;
}
.cyc-hidden-item:last-of-type { border-bottom: none !important; }
.cyc-hidden-item span {
  flex: 1 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  color: #1f2937 !important;
  font-weight: 500 !important;
}
.cyc-hidden-item button {
  flex: 0 0 auto !important;
  padding: 4px 10px !important;
  font-size: 12px !important;
  border: 1px solid rgba(0,0,0,0.08) !important;
  background: rgba(255,255,255,0.6) !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  color: #374151 !important;
  font-family: inherit !important;
  transition: all 0.2s !important;
}
.cyc-hidden-item button:hover {
  background: #fff !important;
  border-color: rgba(0,0,0,0.15) !important;
  color: #111 !important;
}
.cyc-hidden-empty {
  color: #6b7280 !important;
  text-align: center !important;
  padding: 16px 0 !important;
}
  `;

  function ensureStyle() {
    if (!document.documentElement || document.getElementById(STYLE_ID)) return;
    const el = Object.assign(document.createElement('style'), {
      id: STYLE_ID,
      textContent: css,
    });
    (document.head || document.documentElement).appendChild(el);
  }

  function ensureHideStyle() {
    if (!document.documentElement || document.getElementById(HIDE_STYLE_ID)) return;
    const el = Object.assign(document.createElement('style'), {
      id: HIDE_STYLE_ID,
      textContent: hideCss,
    });
    (document.head || document.documentElement).appendChild(el);
  }

  function syncMeta() {
    const set = (sel, attr, val) => {
      const el = document.querySelector(sel);
      if (el && el.getAttribute(attr) !== val) el.setAttribute(attr, val);
    };
    set('meta[name="theme-color"]', 'content', '#F2F2F8');
    set('meta[name="color-scheme"]', 'content', 'light');
  }

  // ===== 屏蔽数据（localStorage 缓存 + Set 索引，全程只读一次） =====
  const HIDDEN_KEY = 'cyc-hidden-cards-v1';
  let hiddenList = null;
  let hiddenKeys = null;

  function loadHidden() {
    if (hiddenList) return hiddenList;
    try {
      const arr = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]');
      hiddenList = Array.isArray(arr) ? arr : [];
    } catch (e) {
      hiddenList = [];
    }
    hiddenKeys = new Set(hiddenList.map(x => x.key));
    return hiddenList;
  }
  function saveHidden() {
    try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(hiddenList)); } catch (e) { /* 忽略 */ }
  }
  function findHidden(key) {
    loadHidden();
    return hiddenKeys.has(key);
  }
  function addHidden(entry) {
    loadHidden();
    if (hiddenKeys.has(entry.key)) return;
    hiddenList.push(entry);
    hiddenKeys.add(entry.key);
    saveHidden();
  }
  function removeHidden(key) {
    loadHidden();
    if (!hiddenKeys.has(key)) return;
    hiddenList = hiddenList.filter(x => x.key !== key);
    hiddenKeys.delete(key);
    saveHidden();
  }

  function getCardInfo(card) {
    let a = null;
    if (card.tagName === 'A' && card.getAttribute('href')) a = card;
    else a = card.querySelector('a[href]');
    if (!a) return null;
    const href = a.getAttribute('href');
    if (!href) return null;
    let key;
    try { key = new URL(href, location.origin).pathname; } catch (e) { key = href; }
    if (!key || key === '/' || key === location.pathname) return null;

    const img = card.querySelector('img');
    let title = img?.getAttribute('alt') || '';
    if (!title) {
      const t = card.querySelector('h3, h2, [class*="title"], [class*="line-clamp"]');
      if (t) title = t.textContent.trim();
    }
    if (!title) title = card.textContent.trim().replace(/\s+/g, ' ').slice(0, 40);
    return { key, title };
  }

  // ===== 确认弹窗（单例复用） =====
  let confirmPopover = null;
  let confirmTextEl = null;
  let pendingConfirm = null;

  function initConfirmPopover() {
    if (confirmPopover || !document.body) return;
    confirmPopover = document.createElement('div');
    confirmPopover.className = 'cyc-confirm-popover';
    confirmPopover.innerHTML = `
      <div class="cyc-confirm-text"></div>
      <div class="cyc-confirm-actions">
        <button class="cyc-confirm-btn-cancel">取消</button>
        <button class="cyc-confirm-btn-ok">确定</button>
      </div>
    `;
    confirmTextEl = confirmPopover.querySelector('.cyc-confirm-text');
    document.body.appendChild(confirmPopover);

    const close = () => {
      confirmPopover.style.display = 'none';
      pendingConfirm = null;
    };
    confirmPopover.querySelector('.cyc-confirm-btn-cancel').addEventListener('click', close);
    confirmPopover.querySelector('.cyc-confirm-btn-ok').addEventListener('click', () => {
      const fn = pendingConfirm;
      close();
      if (fn) fn();
    });

    document.addEventListener('pointerdown', (e) => {
      if (confirmPopover.style.display === 'flex' &&
          !confirmPopover.contains(e.target) &&
          !(e.target.closest && e.target.closest('.cyc-card-hide-btn'))) {
        close();
      }
    }, { capture: true });
  }

  function showConfirm(targetBtn, title, onConfirm) {
    initConfirmPopover();
    if (!confirmPopover) return;
    // 用文本节点拼接（非 innerHTML），避免把页面标题当 HTML 解析；视觉与原 innerHTML 一致
    confirmTextEl.textContent = '';
    confirmTextEl.appendChild(document.createTextNode('确定要屏蔽'));
    confirmTextEl.appendChild(document.createElement('br'));
    confirmTextEl.appendChild(document.createTextNode('\u300a' + title + '\u300b吗？'));
    pendingConfirm = onConfirm;

    const rect = targetBtn.getBoundingClientRect();

    confirmPopover.style.visibility = 'hidden';
    confirmPopover.style.display = 'flex';
    const popRect = confirmPopover.getBoundingClientRect();

    // 优先显示在按钮上方，空间不足翻到下方
    const GAP = 8;
    let top = rect.top - popRect.height - GAP;
    let left = rect.right - popRect.width;

    if (top < 16) top = rect.bottom + GAP;
    if (left < 16) left = 16;
    if (left + popRect.width > window.innerWidth - 16) {
      left = window.innerWidth - popRect.width - 16;
    }

    confirmPopover.style.top = top + 'px';
    confirmPopover.style.left = left + 'px';
    confirmPopover.style.visibility = 'visible';
  }

  function applyHiddenState(card, info) {
    if (findHidden(info.key)) {
      if (card.style.display !== 'none') card.style.display = 'none';
      return;
    }
    if (card.style.display) card.style.display = '';
    if (card.dataset.cycWrapped) return;

    card.dataset.cycWrapped = '1';
    card.classList.add('cyc-card-wrap');

    const btn = document.createElement('button');
    btn.className = 'cyc-card-hide-btn';
    btn.type = 'button';
    btn.title = '屏蔽此番剧';
    btn.textContent = '\u00d7';

    // 拦住卡片链接跳转，只需两个事件
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      showConfirm(btn, info.title || '此番剧', () => {
        addHidden(info);
        card.style.display = 'none';
        updatePanel();
      });
    });
    card.appendChild(btn);
  }

  // 仅分类页（非搜索）启用屏蔽
  function isCategoryPage() {
    const path = window.location.pathname.toLowerCase();
    if (path !== '/category' && path !== '/category/') return false;

    const params = new URLSearchParams(window.location.search);
    if (params.has('q') || params.has('keyword') || params.has('query')) return false;

    return true;
  }

  function processCards() {
    const isCat = isCategoryPage();

    // 悬浮按钮仅分类页显示：用 class 切换，避免内联 display 被 CSS !important 盖过
    if (panelBtnEl) {
      panelBtnEl.classList.toggle('is-visible', isCat);
      if (!isCat && panelEl) panelEl.classList.remove('open');
    }

    // 非分类页清理注入痕迹
    if (!isCat) {
      document.querySelectorAll('.cyc-card-wrap').forEach(card => {
        card.style.display = '';
        card.classList.remove('cyc-card-wrap');
        delete card.dataset.cycWrapped;
        const btn = card.querySelector('.cyc-card-hide-btn');
        if (btn) btn.remove();
      });
      return;
    }

    const grids = document.querySelectorAll('main .grid.grid-cols-3');
    grids.forEach(grid => {
      const cards = grid.children;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card.nodeType !== 1) continue;
        const info = getCardInfo(card);
        if (!info) continue;
        applyHiddenState(card, info);
      }
    });
  }

  // ===== 已屏蔽面板 =====
  let panelEl = null;
  let panelListEl = null;
  let panelBtnEl = null;

  function ensurePanel() {
    if (panelEl || !document.body) return;
    panelBtnEl = document.createElement('button');
    panelBtnEl.className = 'cyc-hidden-panel-btn';
    panelBtnEl.type = 'button';

    panelBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      panelEl.classList.toggle('open');
    });

    panelEl = document.createElement('div');
    panelEl.className = 'cyc-hidden-panel';

    const title = document.createElement('h4');
    title.textContent = '已屏蔽的番剧';
    panelListEl = document.createElement('div');

    panelEl.appendChild(title);
    panelEl.appendChild(panelListEl);

    document.body.appendChild(panelBtnEl);
    document.body.appendChild(panelEl);

    document.addEventListener('click', (e) => {
      if (panelEl.classList.contains('open') && !panelEl.contains(e.target) && !panelBtnEl.contains(e.target)) {
        panelEl.classList.remove('open');
      }
    });
  }

  function updatePanel() {
    if (!panelListEl || !panelBtnEl) return;
    const list = loadHidden();
    panelBtnEl.textContent = '已屏蔽 (' + list.length + ')';
    panelListEl.textContent = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cyc-hidden-empty';
      empty.textContent = '暂无屏蔽';
      panelListEl.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cyc-hidden-item';

      const name = document.createElement('span');
      name.textContent = item.title || item.key;
      name.title = item.title || item.key;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '恢复';
      btn.addEventListener('click', () => {
        removeHidden(item.key);
        updatePanel();
        processCards();
      });

      row.appendChild(name);
      row.appendChild(btn);
      frag.appendChild(row);
    });
    panelListEl.appendChild(frag);
  }

  // MutationObserver 自触发锁：脚本自身写 DOM 会唤醒 observer，
  // 用 mutating 标记跳过这批自激记录。processCards 同步改完后，
  // 用双 rAF 跨过完整一帧再解锁，确保 observer 回调（microtask，先于下一帧）
  // 必定落在 mutating=true 窗口内被跳过，消除单 queueMicrotask 的竞态。
  let scheduled = false;
  let mutating = false;
  function scheduleProcess() {
    if (scheduled || mutating) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      mutating = true;
      try {
        processCards();
      } finally {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { mutating = false; });
        });
      }
    });
  }

  function initHideFeature() {
    ensureHideStyle();
    ensurePanel();
    updatePanel();
    processCards();

    if (document.body) {
      const mo = new MutationObserver(scheduleProcess);
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  function whenBodyReady(cb) {
    if (document.body) return cb();
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  }

  function apply() {
    ensureStyle();
    syncMeta();
    document.documentElement.classList.remove('dark');
  }

  apply();

  document.addEventListener('DOMContentLoaded', apply, { once: true });
  window.addEventListener('load', apply, { once: true });

  whenBodyReady(initHideFeature);

  // SPA 路由：popstate 只覆盖前进/后退，点链接跳转走 pushState/replaceState，
  // 一并 hook 才能即时重算分类页判断，不必等 DOM 变更被 observer 兜底。
  window.addEventListener('popstate', scheduleProcess);
  const _pushState = history.pushState;
  const _replaceState = history.replaceState;
  history.pushState = function () {
    _pushState.apply(this, arguments);
    scheduleProcess();
  };
  history.replaceState = function () {
    _replaceState.apply(this, arguments);
    scheduleProcess();
  };

  function observeHead() {
    if (!document.head) return;
    new MutationObserver(() => {
      if (!document.getElementById(STYLE_ID)) ensureStyle();
      if (!document.getElementById(HIDE_STYLE_ID)) ensureHideStyle();
    }).observe(document.head, { childList: true });
  }

  if (document.head) observeHead();
  else document.addEventListener('DOMContentLoaded', observeHead, { once: true });
})();
