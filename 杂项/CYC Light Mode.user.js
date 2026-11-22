// ==UserScript==
// @name         CYC Light Mode
// @description  全站云母浅色适配 分类页布局优化 坚果云自动同步
// @namespace    https://github.com/Nekozuka-Hibiki
// @version      26.11.22
// @author       Nekozuka-Hibiki
// @license      GPL-3.0
// @homepageURL  https://github.com/Nekozuka-Hibiki/Nya-DeepSeek
// @icon         https://www.cycani.org/favicon.ico
// @match        https://www.cycani.org/*
// @match        https://cycani.org/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @connect      dav.jianguoyun.com
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // ========== 常量定义 ==========
    const STORAGE_KEYS = Object.freeze({
        HIDDEN: 'cyc-hidden-cards-v1',
        HISTORY: 'cyc-hidden-history-v1',
        SYNC_CFG: 'cyc.sync.cfg',
        SYNC_PWD: 'cyc.sync.pwd',
        WRAP_KEY: 'cyc.wrapkey'
    });

    const CSS_IDS = Object.freeze({
        MAIN_STYLE: 'cyc-light-mode-style',
        HIDE_STYLE: 'cyc-hide-style'
    });

    const CLASSES = Object.freeze({
        CARD_WRAP: 'cyc-card-wrap',
        CARD_HIDE_BTN: 'cyc-card-hide-btn',
        CONFIRM_POPOVER: 'cyc-confirm-popover',
        PANEL_BTN: 'cyc-hidden-panel-btn',
        PANEL: 'cyc-hidden-panel',
        PANEL_OPEN: 'open',
        PANEL_HEAD: 'cyc-hidden-head',
        HIDDEN_ITEM: 'cyc-hidden-item',
        HIDDEN_EMPTY: 'cyc-hidden-empty',
        TOOLBAR: 'cyc-hidden-toolbar',
        HISTORY_ITEM: 'cyc-history-item',
        HISTORY_UNDONE: 'is-undone',
        SYNC_MASK: 'cyc-sync-mask',
        SYNC_MODAL: 'cyc-sync-modal'
    });

    const SYNC_STATUS = Object.freeze({
        OFF: 'off',
        BUSY: 'busy',
        OK: 'ok',
        DIRTY: 'dirty',
        FAIL: 'fail'
    });

    const DAV_ROOT = 'https://dav.jianguoyun.com/dav';
    const BACKUP_NAME = 'cyc-backup.json';
    const HISTORY_MAX = 200;
    const ENC_PREFIX = 'aes1:';

    // ========== 样式 ==========
    const css = String.raw`
/* 云母基础变量 */
:root {
  --cyc-mica-bg: rgba(255, 255, 255, 0.65);
  --cyc-mica-bg-hover: rgba(255, 255, 255, 0.85);
  --cyc-mica-border: rgba(255, 255, 255, 0.8);
  --cyc-mica-blur: blur(16px) saturate(180%);
}

/* 主题变量 */
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

/* 紫色胶囊 */
:is(button.bg-brand-subtle, button[aria-pressed="true"][class*="rounded-full"], a[aria-current="true"]:not(nav a):not(header a)) {
  background: rgba(243, 240, 255, 0.75) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  color: var(--cyc-pri-text) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  border-radius: 9999px !important;
  font-weight: 500 !important;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.05) !important;
}
:is(button.bg-brand-subtle, button[aria-pressed="true"][class*="rounded-full"], a[aria-current="true"]:not(nav a):not(header a)):hover {
  background: rgba(237, 233, 254, 0.9) !important;
  color: var(--cyc-pri-text) !important;
}

/* 正序/倒序 */
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

/* 集数网格 */
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

/* 首页 Hero */
[class*="h-[58%]"][class*="bg-gradient-to-b"] {
  background-image: linear-gradient(to bottom, transparent, rgba(242, 242, 248, 0.72), rgba(242, 242, 248, 0.95)) !important;
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

/* 首页轮播推荐 */
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

/* 品牌色卡片/评论置顶 */
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

/* 顶部导航栏 */
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
header.fixed [class*="text-white"] { text-shadow: none !important; }
header.fixed [class*="drop-shadow"] { filter: none !important; }
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

/* 细节杂项 */
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

/* 滚动条 */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--cyc-bg); }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

/* 布局：铺满 + 7 列 */
header > .container, main > .container, footer > .container {
  max-width: 100% !important;
  padding-left: 3vw !important;
  padding-right: 3vw !important;
}
main .grid.grid-cols-3 {
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: 2.25rem !important;
}

/* 杂项修复 */
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

    const hideCss = String.raw`
/* 云母弹窗通用变量 */
:root {
  --cyc-pop-bg: var(--cyc-mica-bg, rgba(255,255,255,0.75));
  --cyc-pop-bg-hover: var(--cyc-mica-bg-hover, rgba(255,255,255,0.85));
  --cyc-pop-border: var(--cyc-mica-border, rgba(255,255,255,0.9));
  --cyc-pop-blur: var(--cyc-mica-blur, blur(16px) saturate(180%));
}

.cyc-card-wrap { position: relative; }

/* 卡片屏蔽按钮 */
.cyc-card-hide-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--cyc-pop-border);
  border-radius: 50%;
  background: var(--cyc-pop-bg);
  backdrop-filter: var(--cyc-pop-blur);
  -webkit-backdrop-filter: var(--cyc-pop-blur);
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
  z-index: 1000000;
  background: var(--cyc-pop-bg);
  backdrop-filter: var(--cyc-pop-blur);
  -webkit-backdrop-filter: var(--cyc-pop-blur);
  border: 1px solid var(--cyc-pop-border);
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

/* 悬浮按钮 */
.cyc-hidden-panel-btn {
  position: fixed !important;
  left: 14px !important;
  top: 20% !important;
  z-index: 99999 !important;
  padding: 16px 10px !important;
  background: var(--cyc-pop-bg) !important;
  backdrop-filter: var(--cyc-pop-blur) !important;
  -webkit-backdrop-filter: var(--cyc-pop-blur) !important;
  border: 1px solid var(--cyc-pop-border) !important;
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
  background: var(--cyc-pop-bg-hover) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
}

/* 已屏蔽面板 */
.cyc-hidden-panel {
  position: fixed !important;
  left: 72px !important;
  top: 18% !important;
  z-index: 99999 !important;
  width: 340px !important;
  max-width: calc(100vw - 96px) !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
  background: var(--cyc-pop-bg-hover) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
  border: 1px solid var(--cyc-pop-border) !important;
  border-radius: 20px !important;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255,255,255,0.95) !important;
  padding: 20px 22px !important;
  color: #0f172a !important;
  font-size: 14px !important;
  font-family: inherit !important;
  display: none;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.cyc-hidden-panel::-webkit-scrollbar { width: 8px !important; }
.cyc-hidden-panel::-webkit-scrollbar-track { background: transparent !important; }
.cyc-hidden-panel::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.35) !important;
  border-radius: 4px !important;
}
.cyc-hidden-panel::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.55) !important; }
.cyc-hidden-panel.open {
  display: block !important;
  opacity: 1 !important;
  transform: translateX(0);
}
.cyc-hidden-panel h4 {
  margin: 0 0 14px !important;
  font-size: 16.5px !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px !important;
  color: #0f172a !important;
  border-bottom: 1px solid rgba(0,0,0,0.07) !important;
  padding-bottom: 12px !important;
}
.cyc-hidden-item {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 13px 0 !important;
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
.cyc-hidden-item:last-of-type { border-bottom: none !important; }
.cyc-hidden-item span {
  flex: 1 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-size: 14px !important;
  color: #1f2937 !important;
  font-weight: 500 !important;
}
.cyc-hidden-item button {
  flex: 0 0 auto !important;
  padding: 7px 15px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border: 1px solid rgba(0,0,0,0.09) !important;
  background: rgba(255,255,255,0.65) !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  color: #374151 !important;
  font-family: inherit !important;
  transition: all 0.18s ease !important;
}
.cyc-hidden-item button:hover {
  background: #fff !important;
  border-color: rgba(124,58,237,0.35) !important;
  color: #6d28d9 !important;
  box-shadow: 0 3px 12px rgba(124,58,237,0.1) !important;
}
.cyc-hidden-empty {
  color: #64748b !important;
  text-align: center !important;
  font-size: 14px !important;
  padding: 28px 0 !important;
}

/* 多选工具条 */
.cyc-hidden-toolbar {
  position: sticky;
  top: -20px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -22px 6px !important;
  padding: 13px 22px !important;
  background: rgba(250, 250, 252, 0.88);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.cyc-hidden-select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}
.cyc-hidden-toolbar input[type="checkbox"],
.cyc-hidden-item input[type="checkbox"] {
  width: 17px;
  height: 17px;
  margin: 0;
  flex: 0 0 auto !important;
  accent-color: #7c3aed;
  cursor: pointer;
}
.cyc-hidden-sel-count {
  flex: 1 !important;
  text-align: right !important;
  font-size: 13px !important;
  color: #64748b !important;
}
.cyc-hidden-del-btn {
  flex: 0 0 auto !important;
  padding: 7px 15px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border: 1px solid rgba(220, 38, 38, 0.35) !important;
  background: rgba(239, 68, 68, 0.08) !important;
  color: #b91c1c !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  font-family: inherit !important;
  transition: all 0.16s ease !important;
}
.cyc-hidden-del-btn:hover:not(:disabled) {
  background: #dc2626 !important;
  color: #fff !important;
  border-color: #dc2626 !important;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.22) !important;
}
.cyc-hidden-del-btn:disabled {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
}
.cyc-hidden-item span { cursor: pointer; }

/* 面板标题栏 */
.cyc-hidden-panel .cyc-hidden-head {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 0 0 14px !important;
  padding-bottom: 12px !important;
  border-bottom: 1px solid rgba(0,0,0,0.07) !important;
}
.cyc-hidden-panel .cyc-hidden-head h4 {
  flex: 1 1 auto !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 16.5px !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px !important;
  color: #0f172a !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
.cyc-history-toggle {
  flex: 0 0 auto !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border: 1px solid rgba(0,0,0,0.09) !important;
  border-radius: 10px !important;
  background: rgba(255,255,255,0.6) !important;
  color: #475569 !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
}
.cyc-history-toggle:hover {
  background: rgba(255,255,255,0.98) !important;
  color: #0f172a !important;
  border-color: rgba(124,58,237,0.35) !important;
  box-shadow: 0 3px 12px rgba(124,58,237,0.1) !important;
}
.cyc-history-toggle.active {
  background: rgba(243, 240, 255, 0.95) !important;
  color: var(--cyc-pri-text, #6d28d9) !important;
  border-color: var(--cyc-pri-border, rgba(124,58,237,0.4)) !important;
}
.cyc-history-toggle svg { display: block; }

/* 历史记录列表 */
.cyc-history-item {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 13px 0 !important;
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
.cyc-history-item:last-of-type { border-bottom: none !important; }
.cyc-history-item.is-undone { opacity: 0.55 !important; }
.cyc-history-item input[type="checkbox"] {
  width: 17px !important;
  height: 17px !important;
  margin: 0 !important;
  flex: 0 0 auto !important;
  accent-color: #7c3aed !important;
  cursor: pointer !important;
}
.cyc-history-main { flex: 1 1 auto !important; min-width: 0 !important; }
.cyc-history-line1 {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
}
.cyc-history-badge {
  flex: 0 0 auto !important;
  padding: 2px 7px !important;
  border-radius: 7px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  line-height: 1.6 !important;
}
.cyc-badge-hide { background: rgba(239,68,68,0.10) !important; color: #b91c1c !important; }
.cyc-badge-unhide { background: rgba(34,197,94,0.12) !important; color: #15803d !important; }
.cyc-history-name {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1f2937 !important;
  cursor: pointer !important;
}
.cyc-history-item.is-undone .cyc-history-name { text-decoration: line-through !important; }
.cyc-history-line2 {
  margin-top: 4px !important;
  font-size: 11.5px !important;
  color: #94a3b8 !important;
  white-space: nowrap !important;
}
.cyc-history-undo {
  flex: 0 0 auto !important;
  padding: 6px 13px !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  border: 1px solid rgba(0,0,0,0.09) !important;
  background: rgba(255,255,255,0.65) !important;
  color: #374151 !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  font-family: inherit !important;
  transition: all 0.18s ease !important;
}
.cyc-history-undo:hover:not(:disabled) {
  background: #fff !important;
  border-color: rgba(124,58,237,0.35) !important;
  color: #6d28d9 !important;
  box-shadow: 0 3px 12px rgba(124,58,237,0.1) !important;
}
.cyc-history-undo:disabled {
  opacity: 0.6 !important;
  cursor: default !important;
  box-shadow: none !important;
}

/* 同步状态灯 */
.cyc-sync-toggle::after {
  content: '' !important;
  position: absolute !important;
  top: 4px !important;
  right: 4px !important;
  width: 7px !important;
  height: 7px !important;
  border-radius: 50% !important;
  background: #cbd5e1 !important;
  box-shadow: 0 0 0 1.5px rgba(255,255,255,0.95) !important;
}
.cyc-sync-toggle.st-ok::after { background: #22c55e !important; }
.cyc-sync-toggle.st-dirty::after { background: #f59e0b !important; }
.cyc-sync-toggle.st-fail::after { background: #ef4444 !important; }
.cyc-sync-toggle.st-busy::after { background: #7c3aed !important; }

/* 同步设置浮层 */
.cyc-sync-mask {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(15, 23, 42, 0.38) !important;
  backdrop-filter: blur(4px) saturate(120%) !important;
  -webkit-backdrop-filter: blur(4px) saturate(120%) !important;
  z-index: 999998 !important;
  display: none !important;
}
.cyc-sync-mask.open { display: block !important; }
.cyc-sync-modal {
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 480px !important;
  max-width: calc(100vw - 40px) !important;
  max-height: calc(100vh - 64px) !important;
  overflow-y: auto !important;
  z-index: 999999 !important;
  display: none !important;
  flex-direction: column !important;
  gap: 15px !important;
  padding: 26px 28px !important;
  border-radius: 22px !important;
  background: rgba(252, 252, 254, 0.95) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
  border: 1px solid rgba(255,255,255,0.9) !important;
  box-shadow: 0 32px 90px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.95) !important;
  color: #111827 !important;
  font-size: 14px !important;
  font-family: inherit !important;
}
.cyc-sync-modal.open { display: flex !important; }
.cyc-sync-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px !important;
  color: #0f172a !important;
  padding-bottom: 14px !important;
  border-bottom: 1px solid rgba(0,0,0,0.07) !important;
}
.cyc-sync-modal label {
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
  font-weight: 600 !important;
  color: #334155 !important;
  font-size: 13px !important;
  letter-spacing: 0.2px !important;
}
.cyc-sync-modal input[type="email"],
.cyc-sync-modal input[type="password"],
.cyc-sync-modal input[type="text"],
.cyc-sync-modal select {
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 11px 13px !important;
  font-size: 14.5px !important;
  font-family: inherit !important;
  border: 1px solid rgba(0,0,0,0.12) !important;
  border-radius: 11px !important;
  background: rgba(255,255,255,0.85) !important;
  color: #111827 !important;
  outline: none !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
}
.cyc-sync-modal input:focus,
.cyc-sync-modal select:focus {
  border-color: rgba(124,58,237,0.5) !important;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
}
.cyc-sync-pwdrow { display: flex !important; gap: 9px !important; align-items: center !important; }
.cyc-sync-pwdrow input { flex: 1 1 auto !important; }
.cyc-sync-mini {
  padding: 9px 18px !important;
  font-size: 13.5px !important;
  font-weight: 600 !important;
  border: 1px solid rgba(0,0,0,0.11) !important;
  background: rgba(255,255,255,0.78) !important;
  border-radius: 11px !important;
  cursor: pointer !important;
  color: #334155 !important;
  font-family: inherit !important;
  transition: all 0.16s ease !important;
}
.cyc-sync-mini:hover:not(:disabled) {
  background: #fff !important;
  border-color: rgba(124,58,237,0.4) !important;
  color: #6d28d9 !important;
  box-shadow: 0 4px 14px rgba(124,58,237,0.1) !important;
}
.cyc-sync-mini:active:not(:disabled) { transform: translateY(1px) !important; }
.cyc-sync-mini:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
.cyc-sync-close {
  flex: 0 0 auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  font-size: 22px !important;
  line-height: 1 !important;
  border-radius: 11px !important;
  border: 1px solid rgba(0,0,0,0.1) !important;
  background: rgba(255,255,255,0.65) !important;
  color: #475569 !important;
}
.cyc-sync-close:hover {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
  color: #b91c1c !important;
  box-shadow: none !important;
}
.cyc-sync-auto {
  flex-direction: row !important;
  align-items: center !important;
  gap: 9px !important;
  font-size: 13.5px !important;
  padding-top: 2px !important;
}
.cyc-sync-auto input {
  width: 17px !important;
  height: 17px !important;
  margin: 0 !important;
  accent-color: #7c3aed !important;
  cursor: pointer !important;
}
.cyc-sync-hint { font-size: 12px !important; color: #64748b !important; line-height: 1.7 !important; }
.cyc-sync-actions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 9px !important;
  padding-top: 16px !important;
  margin-top: 2px !important;
  border-top: 1px solid rgba(0,0,0,0.07) !important;
}
.cyc-sync-status {
  font-size: 13px !important;
  line-height: 1.8 !important;
  padding: 13px 15px !important;
  border-radius: 13px !important;
  background: rgba(240,240,246,0.75) !important;
  color: #334155 !important;
  white-space: pre-wrap !important;
  word-break: break-all !important;
}
.cyc-sync-status.err { background: rgba(239,68,68,0.1) !important; color: #b91c1c !important; }
.cyc-sync-status.ok { background: rgba(34,197,94,0.1) !important; color: #15803d !important; }
  `;

    // ========== 工具函数 ==========
    function safeJsonParse(str, fallback) {
        try { return JSON.parse(str); } catch (e) { return fallback; }
    }

    function bytesToB64(bytes) {
        let s = '';
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        return btoa(s);
    }

    function b64ToBytes(str) {
        const bin = atob(str);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }

    function utf8ToB64(str) {
        return bytesToB64(new TextEncoder().encode(str));
    }

    function clearPushTimer() {
        if (pushTimer) {
            clearTimeout(pushTimer);
            pushTimer = null;
        }
    }

    // ========== 样式注入 ==========
    function ensureStyle() {
        if (!document.documentElement || document.getElementById(CSS_IDS.MAIN_STYLE)) return;
        const el = Object.assign(document.createElement('style'), {
            id: CSS_IDS.MAIN_STYLE,
            textContent: css
        });
        (document.head || document.documentElement).appendChild(el);
    }

    function ensureHideStyle() {
        if (!document.documentElement || document.getElementById(CSS_IDS.HIDE_STYLE)) return;
        const el = Object.assign(document.createElement('style'), {
            id: CSS_IDS.HIDE_STYLE,
            textContent: hideCss
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

    // ========== 数据层 ==========
    let hiddenList = null;
    let hiddenKeys = null;
    let historyList = null;
    let suppressDirty = false;

    function loadHidden() {
        if (hiddenList) return hiddenList;
        const arr = safeJsonParse(localStorage.getItem(STORAGE_KEYS.HIDDEN), []);
        hiddenList = Array.isArray(arr) ? arr : [];
        hiddenKeys = new Set(hiddenList.map(x => x.key));
        return hiddenList;
    }

    function saveHidden() {
        localStorage.setItem(STORAGE_KEYS.HIDDEN, JSON.stringify(hiddenList));
        markDirty();
    }

    function findHidden(key) {
        loadHidden();
        return hiddenKeys.has(key);
    }

    function addHidden(entry) {
        loadHidden();
        if (hiddenKeys.has(entry.key)) return;
        const rec = { key: entry.key, title: entry.title || '', t: entry.t || Date.now() };
        hiddenList.push(rec);
        hiddenKeys.add(rec.key);
        saveHidden();
    }

    function removeHidden(key) {
        loadHidden();
        if (!hiddenKeys.has(key)) return;
        hiddenList = hiddenList.filter(x => x.key !== key);
        hiddenKeys.delete(key);
        saveHidden();
    }

    function loadHistory() {
        if (historyList) return historyList;
        const arr = safeJsonParse(localStorage.getItem(STORAGE_KEYS.HISTORY), []);
        historyList = Array.isArray(arr) ? arr : [];
        return historyList;
    }

    function saveHistory() {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyList));
        markDirty();
    }

    function pushHistory(type, info, silent) {
        loadHistory();
        historyList.unshift({
            id: `${type}:${info.key}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`,
            type,
            key: info.key,
            title: info.title || info.key,
            t: Date.now(),
            undone: false,
            ut: 0
        });
        if (historyList.length > HISTORY_MAX) historyList.length = HISTORY_MAX;
        saveHistory();
        if (!silent) updateHistoryPanel();
    }

    function applyUndo(item) {
        if (!item || item.undone) return false;
        if (item.type === 'hide') {
            removeHidden(item.key);
        } else {
            addHidden({ key: item.key, title: item.title });
        }
        item.undone = true;
        item.ut = Date.now();
        return true;
    }

    function fmtHistoryTime(t) {
        const d = new Date(t);
        if (isNaN(d.getTime())) return '';
        const pad = n => (n < 10 ? '0' + n : '' + n);
        const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return `今天 ${hm}`;
        if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`;
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${hm}`;
    }

    // ========== 加密层 ==========
    function getSubtle() {
        try { return (window.crypto && window.crypto.subtle) || null; } catch (e) { return null; }
    }

    function getWrapKey() {
        let k = GM_getValue(STORAGE_KEYS.WRAP_KEY, '');
        if (!k) {
            const rnd = new Uint8Array(32);
            window.crypto.getRandomValues(rnd);
            k = bytesToB64(rnd);
            GM_setValue(STORAGE_KEYS.WRAP_KEY, k);
        }
        return k;
    }

    async function getAesKey() {
        const s = getSubtle();
        if (!s) return null;
        const digest = await s.digest('SHA-256', new TextEncoder().encode(getWrapKey()));
        return s.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    }

    async function encryptText(plain) {
        const s = getSubtle();
        const key = await getAesKey();
        const raw = new TextEncoder().encode(plain);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const ct = await s.encrypt({ name: 'AES-GCM', iv }, key, raw);
        const buf = new Uint8Array(iv.length + ct.byteLength);
        buf.set(iv, 0);
        buf.set(new Uint8Array(ct), iv.length);
        return ENC_PREFIX + bytesToB64(buf);
    }

    async function decryptText(stored) {
        if (!stored || !stored.startsWith(ENC_PREFIX)) return '';
        try {
            const s = getSubtle();
            const key = await getAesKey();
            const buf = b64ToBytes(stored.slice(ENC_PREFIX.length));
            const pt = await s.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12));
            return new TextDecoder().decode(pt);
        } catch (e) { return ''; }
    }

    async function pwdTail() {
        const p = await decryptText(GM_getValue(STORAGE_KEYS.SYNC_PWD, ''));
        return p ? p.slice(-4) : '----';
    }

    // ========== 同步配置 ==========
    let syncCfg = null;
    const syncState = { status: SYNC_STATUS.OFF, busy: false, error: '' };
    let connOk = false;
    let lastPullAt = 0;
    let pushTimer = null;

    function loadSyncCfg() {
        if (syncCfg) return syncCfg;
        const saved = GM_getValue(STORAGE_KEYS.SYNC_CFG, null);
        syncCfg = Object.assign({
            email: '',
            dir: '/CYC-LightMode',
            debounce: 15,
            auto: false,
            device: '',
            lastSyncAt: 0,
            pending: 0,
            verified: false
        }, (saved && typeof saved === 'object') ? saved : {});
        if (!syncCfg.device) {
            syncCfg.device = Math.random().toString(36).slice(2, 8);
            saveSyncCfg();
        }
        return syncCfg;
    }

    function saveSyncCfg() {
        if (!syncCfg) return;
        GM_setValue(STORAGE_KEYS.SYNC_CFG, syncCfg);
    }

    function isPending() { return !!loadSyncCfg().pending; }
    function hasCred() { return !!GM_getValue(STORAGE_KEYS.SYNC_PWD, ''); }
    function syncUsable() {
        const c = loadSyncCfg();
        return !!(c.email && hasCred());
    }

    function normDir(dir) {
        let p = String(dir || '/CYC-LightMode').trim().replace(/\\/g, '/');
        if (p.charAt(0) !== '/') p = '/' + p;
        p = p.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
        return p || '/';
    }

    function encPath(p) {
        return p.split('/').map(s => s ? encodeURIComponent(s) : '').join('/');
    }

    function dirUrl(dir) { return DAV_ROOT + encPath(normDir(dir)); }
    function fileUrl(dir) { return `${dirUrl(dir)}/${encodeURIComponent(BACKUP_NAME)}`; }

    function davHint(status) {
        const hints = {
            401: '401 凭据被拒：请用坚果云「应用密码」而非登录密码',
            403: '403 无权限：目录不存在或账号不可写',
            404: '404 路径不存在',
            405: '405 方法不支持：请确认目录路径',
            409: '409 上级目录不存在',
            412: '412 云端已被其他设备修改，已自动重取合并',
            423: '423 资源被锁定，稍后重试',
            429: '429 请求过于频繁，已被限流',
            0: '网络请求失败：检查网络或脚本管理器是否放行 dav.jianguoyun.com'
        };
        return hints[status] || `${status} 未预期的响应`;
    }

    // ========== WebDAV 请求 ==========
    async function davRequest(method, url, opts = {}) {
        if (typeof GM_xmlhttpRequest !== 'function') {
            return { status: 0, error: '当前脚本管理器未提供网络请求能力' };
        }
        const cfg = loadSyncCfg();
        const pwd = await decryptText(GM_getValue(STORAGE_KEYS.SYNC_PWD, ''));
        if (!pwd) return { status: 0, error: '尚未保存应用密码' };

        return new Promise((resolve) => {
            const headers = {
                'Authorization': 'Basic ' + utf8ToB64(`${cfg.email}:${pwd}`),
                'Accept': '*/*'
            };
            const req = {
                method,
                url,
                headers,
                timeout: 25000,
                onload: function (res) {
                    let etag = '';
                    const m = /etag:\s*"?([^"\r\n;]+)/i.exec(res.responseHeaders || '');
                    if (m) etag = m[1].trim();
                    resolve({ status: res.status, text: res.responseText || '', etag });
                },
                onerror: () => resolve({ status: 0, error: davHint(0) }),
                ontimeout: () => resolve({ status: 0, error: '请求超时（25 秒）' })
            };
            if (typeof opts.body === 'string') {
                headers['Content-Type'] = 'application/json; charset=utf-8';
                req.data = opts.body;
            }
            if (opts.etag) headers['If-Match'] = opts.etag;
            try {
                GM_xmlhttpRequest(req);
            } catch (e) {
                resolve({ status: 0, error: String(e.message || e) });
            }
        });
    }

    async function davWithRetry(method, url, opts) {
        const r = await davRequest(method, url, opts);
        if (r.status === 429 || r.status === 0 || r.status >= 500) {
            await new Promise(res => setTimeout(res, 3000));
            return await davRequest(method, url, opts);
        }
        return r;
    }

    async function ensureDir(dir) {
        const segs = normDir(dir).split('/').filter(Boolean);
        let acc = '';
        for (let i = 0; i < segs.length; i++) {
            acc += '/' + segs[i];
            const r = await davRequest('MKCOL', dirUrl(acc), {});
            if (![201, 405, 423, 200].includes(r.status)) return false;
        }
        return true;
    }

    // ========== 备份与合并 ==========
    function buildBackup() {
        return {
            version: 1,
            device: loadSyncCfg().device,
            updatedAt: Date.now(),
            hidden: loadHidden().map(x => ({ key: x.key, title: x.title || '', t: x.t || 0 })),
            history: loadHistory().map(x => ({
                id: x.id, type: x.type, key: x.key, title: x.title || '',
                t: x.t || 0, undone: !!x.undone, ut: x.ut || 0
            }))
        };
    }

    function parseBackup(text) {
        const o = safeJsonParse(text, null);
        if (!o || !Array.isArray(o.hidden) || !Array.isArray(o.history)) return null;
        return o;
    }

    function stateSignature() {
        try { return JSON.stringify({ h: loadHidden(), g: loadHistory() }); }
        catch (e) { return 'x'; }
    }

    function mergeHistories(a, b) {
        const map = new Map();
        const rank = x => x.undone ? (x.ut || x.t || 0) : (x.t || 0);
        const all = [].concat(a || [], b || []);
        for (const x of all) {
            if (!x || !x.key) continue;
            if (!x.id) x.id = `n:${x.key}:${x.t || 0}:${Math.random().toString(36).slice(2, 6)}`;
            const cur = map.get(x.id);
            if (!cur || rank(x) >= rank(cur)) map.set(x.id, x);
        }
        return Array.from(map.values()).sort((p, q) => (q.t || 0) - (p.t || 0));
    }

    function deriveHidden(history, extraLists) {
        const best = new Map();
        const put = (key, eff, t, title) => {
            if (!key) return;
            const cur = best.get(key);
            const tt = t || 0;
            // 规则：时间戳大的优先；相等时 hide 优先
            const take = !cur || tt > cur.t || (tt === cur.t && eff === 'hide' && cur.eff !== 'hide');
            if (take) best.set(key, { eff, t: tt, title: title || (cur ? cur.title : '') });
        };
        // 兜底旧数据
        for (const list of (extraLists || [])) {
            for (const h of (list || [])) {
                if (h && h.key) put(h.key, 'hide', h.t || 0, h.title);
            }
        }
        // 重放历史
        for (const h of (history || [])) {
            if (!h || !h.key) continue;
            const base = h.type === 'hide' ? 'hide' : 'unhide';
            const eff = h.undone ? (base === 'hide' ? 'unhide' : 'hide') : base;
            const t = (h.undone && h.ut) ? h.ut : (h.t || 0);
            put(h.key, eff, t, h.title);
        }
        const out = [];
        best.forEach((v, k) => { if (v.eff === 'hide') out.push({ key: k, title: v.title || k, t: v.t || 0 }); });
        out.sort((p, q) => (q.t || 0) - (p.t || 0));
        return out;
    }

    function mergeBackup(remote) {
        const history = mergeHistories(loadHistory(), remote ? remote.history : null);
        const hidden = deriveHidden(history, [loadHidden(), remote ? remote.hidden : null]);
        if (history.length > HISTORY_MAX) history.length = HISTORY_MAX;
        return { hidden, history };
    }

    function applyMerged(merged) {
        suppressDirty = true;
        try {
            hiddenList = merged.hidden;
            hiddenKeys = new Set(hiddenList.map(x => x.key));
            saveHidden();
            historyList = merged.history;
            saveHistory();
        } finally {
            suppressDirty = false;
        }
        updatePanel();
        updateHistoryPanel();
        processCards();
    }

    // ========== 同步流程（拆分） ==========
    async function syncPull(filePath) {
        let got = await davWithRetry('GET', filePath, {});
        if (got.status === 409 || got.status === 405) {
            await ensureDir(loadSyncCfg().dir);
            got = await davWithRetry('GET', filePath, {});
        }
        if (got.status === 0) throw new Error(got.error || davHint(0));
        if (got.status === 401 || got.status === 403) throw new Error(davHint(got.status));
        if (got.status !== 200 && got.status !== 404) throw new Error(davHint(got.status));

        let remote = null;
        if (got.status === 200) {
            remote = parseBackup(got.text);
            if (!remote) throw new Error('云端备份文件无法识别，已停止本次同步以免误覆盖');
        }
        return { response: got, remote };
    }

    async function syncPush(filePath, etag) {
        let put = await davWithRetry('PUT', filePath, {
            body: JSON.stringify(buildBackup()),
            etag: etag || ''
        });
        if (put.status === 412) {
            const again = await davWithRetry('GET', filePath, {});
            applyMerged(mergeBackup(again.status === 200 ? parseBackup(again.text) : null));
            put = await davWithRetry('PUT', filePath, {
                body: JSON.stringify(buildBackup()),
                etag: again.etag || ''
            });
        }
        if (put.status === 409) {
            await ensureDir(loadSyncCfg().dir);
            put = await davWithRetry('PUT', filePath, { body: JSON.stringify(buildBackup()) });
        }
        if (put.status === 0) throw new Error(put.error || davHint(0));
        if (put.status >= 400) throw new Error(davHint(put.status));
        return put;
    }

    function markDirty() {
        if (suppressDirty) {
            clearPushTimer();
            return;
        }
        const c = loadSyncCfg();
        c.pending = 1;
        saveSyncCfg();
        paintSyncUi();
        refreshMenus();
        if (!c.auto || !syncUsable()) return;
        const secs = Math.max(3, Math.min(120, Number(c.debounce) || 15));
        clearPushTimer();
        pushTimer = setTimeout(() => {
            pushTimer = null;
            doSync('push');
        }, secs * 1000);
    }

    function schedulePush(ms) {
        clearPushTimer();
        pushTimer = setTimeout(() => {
            pushTimer = null;
            doSync('push');
        }, ms);
    }

    function maybePull(reason) {
        const c = loadSyncCfg();
        if (!c.auto || !syncUsable() || syncState.busy) return;
        if (reason === 'resume' && lastPullAt && (Date.now() - lastPullAt) < 10 * 60 * 1000) return;
        doSync('pull');
    }

    async function doSync(mode) {
        const cfg = loadSyncCfg();
        if (!syncUsable()) {
            syncState.status = SYNC_STATUS.OFF;
            syncState.error = '未配置坚果云账号，同步未开启';
            paintSyncUi();
            return;
        }
        if (syncState.busy) { schedulePush(4000); return; }

        syncState.busy = true;
        syncState.status = SYNC_STATUS.BUSY;
        syncState.error = '';
        paintSyncUi();
        refreshMenus();

        let pushed = false;
        try {
            const file = fileUrl(cfg.dir);
            const { response: got, remote } = await syncPull(file);

            const before = stateSignature();
            applyMerged(mergeBackup(remote));
            lastPullAt = Date.now();
            connOk = true;
            cfg.verified = true;

            const changed = before !== stateSignature();
            const needPush = mode !== 'pull' || changed || !remote;

            if (needPush) {
                await syncPush(file, got.etag);
                pushed = true;
            }

            cfg.pending = 0;
            cfg.lastSyncAt = Date.now();
            saveSyncCfg();
            syncState.status = SYNC_STATUS.OK;
            syncState.error = '';
            if (syncStatusEl) {
                const info = pushed
                    ? `（已推送 ${loadHidden().length} 部 / ${loadHistory().length} 条）`
                    : '（与云端一致，未推送）';
                setStatus(`同步完成 · ${fmtHistoryTime(cfg.lastSyncAt)}${info}`, 'ok');
            }
        } catch (err) {
            syncState.status = SYNC_STATUS.FAIL;
            syncState.error = (err && err.message) || String(err);
            cfg.pending = 1;
            saveSyncCfg();
            if (syncStatusEl) setStatus(`同步失败：${syncState.error}`, 'err');
        } finally {
            syncState.busy = false;
            paintSyncUi();
            refreshMenus();
            if (syncCfg && syncCfg.pending && syncState.status === SYNC_STATUS.OK) schedulePush(5000);
        }
    }

    // ========== 导入导出 ==========
    function exportBackup() {
        if (!document.body) return;
        loadSyncCfg();
        const d = new Date();
        const pad = n => (n < 10 ? '0' + n : '' + n);
        const name = `CYC屏蔽备份-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' }));
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
    }

    function importBackupFile() {
        if (!document.body) return;
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = '.json,application/json';
        inp.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(inp);
        inp.addEventListener('change', () => {
            const f = inp.files && inp.files[0];
            if (!f) { inp.remove(); return; }
            const fr = new FileReader();
            fr.onload = () => {
                const remote = parseBackup(String(fr.result || ''));
                inp.remove();
                if (!remote) {
                    openSyncModal(true);
                    setStatus('导入失败：文件不是本脚本导出的 JSON，或已损坏', 'err');
                    return;
                }
                applyMerged(mergeBackup(remote));
                openSyncModal(true);
                const suffix = loadSyncCfg().auto
                    ? '，正在推送到云端…'
                    : '（自动同步未开启，仅写入本地）';
                setStatus(`已导入：本地现有 屏蔽 ${loadHidden().length} 部 / 历史 ${loadHistory().length} 条${suffix}`, 'ok');
                if (loadSyncCfg().auto) doSync('push');
                else { paintSyncUi(); refreshMenus(); }
            };
            fr.onerror = () => {
                inp.remove();
                openSyncModal(true);
                setStatus('导入失败：读取文件出错', 'err');
            };
            fr.readAsText(f);
        });
        inp.click();
    }

    // ========== 卡片处理 ==========
    function getCardInfo(card) {
        const cached = card.dataset.cycInfo;
        if (cached) {
            const info = safeJsonParse(cached, null);
            if (info) return info;
        }
        const a = card.tagName === 'A' && card.getAttribute('href')
            ? card
            : card.querySelector('a[href]');
        if (!a) return null;
        const href = a.getAttribute('href');
        if (!href) return null;

        let key;
        try { key = new URL(href, location.origin).pathname; }
        catch (e) { key = href; }
        if (!key || key === '/' || key === location.pathname) return null;

        const img = card.querySelector('img');
        let title = img?.getAttribute('alt') || '';
        if (!title) {
            const t = card.querySelector('h3, h2, [class*="title"], [class*="line-clamp"]');
            if (t) title = t.textContent.trim();
        }
        if (!title) title = card.textContent.trim().replace(/\s+/g, ' ').slice(0, 40);

        const info = { key, title };
        try { card.dataset.cycInfo = JSON.stringify(info); } catch (e) { /* 忽略 */ }
        return info;
    }

    function applyHiddenState(card, info) {
        if (findHidden(info.key)) {
            if (card.style.display !== 'none') card.style.display = 'none';
            return;
        }
        if (card.style.display) card.style.display = '';
        if (card.dataset.cycWrapped) return;

        card.dataset.cycWrapped = '1';
        card.classList.add(CLASSES.CARD_WRAP);

        const btn = document.createElement('button');
        btn.className = CLASSES.CARD_HIDE_BTN;
        btn.type = 'button';
        btn.title = '屏蔽此番剧';
        btn.textContent = '\u00d7';

        btn.addEventListener('pointerdown', e => {
            e.preventDefault();
            e.stopPropagation();
        });
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            showConfirm(btn, info.title || '此番剧', () => {
                addHidden(info);
                pushHistory('hide', info);
                card.style.display = 'none';
                updatePanel();
            });
        });
        card.appendChild(btn);
    }

    function isCategoryPage() {
        const path = window.location.pathname.toLowerCase();
        if (path !== '/category' && path !== '/category/') return false;
        const params = new URLSearchParams(window.location.search);
        return !(params.has('q') || params.has('keyword') || params.has('query'));
    }

    // ========== DOM 观测（分类页启停） ==========
    let observer = null;
    let observerActive = false;

    function startObserver() {
        if (observerActive || !document.body) return;
        if (!observer) observer = new MutationObserver(scheduleProcess);
        observer.observe(document.body, { childList: true, subtree: true });
        observerActive = true;
    }

    function stopObserver() {
        if (!observerActive) return;
        if (observer) observer.disconnect();
        observerActive = false;
    }

    function processCards() {
        const isCat = isCategoryPage();

        if (panelBtnEl) {
            panelBtnEl.classList.toggle('is-visible', isCat);
            if (!isCat && panelEl) panelEl.classList.remove(CLASSES.PANEL_OPEN);
        }

        if (!isCat) {
            stopObserver();
            document.querySelectorAll(`.${CLASSES.CARD_WRAP}`).forEach(card => {
                card.style.display = '';
                card.classList.remove(CLASSES.CARD_WRAP);
                delete card.dataset.cycWrapped;
                delete card.dataset.cycInfo;
                const btn = card.querySelector(`.${CLASSES.CARD_HIDE_BTN}`);
                if (btn) btn.remove();
            });
            return;
        }

        startObserver();
        const grids = document.querySelectorAll('main .grid.grid-cols-3');
        grids.forEach(grid => {
            for (const card of grid.children) {
                if (card.nodeType !== 1) continue;
                const info = getCardInfo(card);
                if (!info) continue;
                applyHiddenState(card, info);
            }
        });
    }

    // ========== 确认弹窗 ==========
    let confirmPopover = null;
    let confirmTextEl = null;
    let pendingConfirm = null;

    function initConfirmPopover() {
        if (confirmPopover || !document.body) return;
        confirmPopover = document.createElement('div');
        confirmPopover.className = CLASSES.CONFIRM_POPOVER;
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
                !(e.target.closest && e.target.closest(`.${CLASSES.CARD_HIDE_BTN}`))) {
                close();
            }
        }, { capture: true });
    }

    function showConfirm(targetBtn, title, onConfirm, mode) {
        initConfirmPopover();
        if (!confirmPopover) return;
        confirmTextEl.textContent = '';

        const lines = {
            unhide: ['确定要解除屏蔽', `${title} 吗？`],
            undo: ['确定要撤销', `${title} 吗？`],
            imp: ['确定要', `${title} 吗？`]
        };
        const [line1, line2] = lines[mode] || ['确定要屏蔽', `《${title}》吗？`];
        confirmTextEl.appendChild(document.createTextNode(line1));
        confirmTextEl.appendChild(document.createElement('br'));
        confirmTextEl.appendChild(document.createTextNode(line2));
        pendingConfirm = onConfirm;

        const rect = targetBtn.getBoundingClientRect();
        confirmPopover.style.visibility = 'hidden';
        confirmPopover.style.display = 'flex';
        const popRect = confirmPopover.getBoundingClientRect();

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

    // ========== 屏蔽面板 ==========
    let panelEl = null;
    let panelListEl = null;
    let panelBtnEl = null;
    let panelTitleEl = null;
    let panelToolbarEl = null;
    let histListEl = null;
    let histToolbarEl = null;
    let histToggleEl = null;
    let syncToggleEl = null;
    let viewMode = 'list';

    const selectedKeys = new Set();
    let panelSelectAllEl = null;
    let panelCountEl = null;
    let panelDelBtnEl = null;

    const historySelectedIds = new Set();
    let histSelectAllEl = null;
    let histCountEl = null;
    let histUndoBtnEl = null;

    let panelOutsideHandler = null;

    function bindPanelOutsideClose() {
        if (panelOutsideHandler) return;
        panelOutsideHandler = (e) => {
            if (!panelEl.classList.contains(CLASSES.PANEL_OPEN)) return;
            const t = e.target;
            const ownSelectors = `.${CLASSES.CONFIRM_POPOVER}, .${CLASSES.SYNC_MODAL}, .${CLASSES.SYNC_MASK}, .${CLASSES.PANEL}, .${CLASSES.PANEL_BTN}`;
            const isOwnUi = (t && t.closest && t.closest(ownSelectors))
                || panelEl.contains(t)
                || (panelBtnEl && panelBtnEl.contains(t));
            if (!isOwnUi) {
                panelEl.classList.remove(CLASSES.PANEL_OPEN);
                unbindPanelOutsideClose();
            }
        };
        document.addEventListener('click', panelOutsideHandler);
    }

    function unbindPanelOutsideClose() {
        if (!panelOutsideHandler) return;
        document.removeEventListener('click', panelOutsideHandler);
        panelOutsideHandler = null;
    }

    function setView(mode) {
        viewMode = mode === 'history' ? 'history' : 'list';
        const isHist = viewMode === 'history';
        if (panelTitleEl) panelTitleEl.textContent = isHist ? '操作历史' : '已屏蔽的番剧';
        if (panelToolbarEl) panelToolbarEl.style.display = isHist ? 'none' : '';
        if (panelListEl) panelListEl.style.display = isHist ? 'none' : '';
        if (histToolbarEl) histToolbarEl.style.display = isHist ? '' : 'none';
        if (histListEl) histListEl.style.display = isHist ? '' : 'none';
        if (histToggleEl) {
            histToggleEl.classList.toggle('active', isHist);
            histToggleEl.setAttribute('aria-pressed', isHist ? 'true' : 'false');
        }
        isHist ? updateHistoryPanel() : updatePanel();
    }

    function ensurePanel() {
        if (panelEl || !document.body) return;

        panelBtnEl = document.createElement('button');
        panelBtnEl.className = CLASSES.PANEL_BTN;
        panelBtnEl.type = 'button';
        panelBtnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panelEl.classList.toggle(CLASSES.PANEL_OPEN);
            if (isOpen) bindPanelOutsideClose();
            else unbindPanelOutsideClose();
        });

        panelEl = document.createElement('div');
        panelEl.className = CLASSES.PANEL;

        const head = document.createElement('div');
        head.className = CLASSES.PANEL_HEAD;

        panelTitleEl = document.createElement('h4');
        panelTitleEl.textContent = '已屏蔽的番剧';

        histToggleEl = document.createElement('button');
        histToggleEl.className = 'cyc-history-toggle';
        histToggleEl.type = 'button';
        histToggleEl.title = '操作历史';
        histToggleEl.setAttribute('aria-label', '操作历史');
        histToggleEl.setAttribute('aria-pressed', 'false');
        histToggleEl.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.64-6.36"/><polyline points="3 4 3 9 8 9"/><polyline points="12 7 12 12 15.5 14"/></svg>';
        histToggleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            setView(viewMode === 'history' ? 'list' : 'history');
        });

        syncToggleEl = document.createElement('button');
        syncToggleEl.className = 'cyc-history-toggle cyc-sync-toggle st-off';
        syncToggleEl.type = 'button';
        syncToggleEl.title = '坚果云同步';
        syncToggleEl.setAttribute('aria-label', '坚果云同步');
        syncToggleEl.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 10.3 3.5 3.5 0 0 0 7 19h10.5z"/></svg>';
        syncToggleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openSyncModal(true);
        });

        head.appendChild(panelTitleEl);
        head.appendChild(histToggleEl);
        head.appendChild(syncToggleEl);

        panelListEl = document.createElement('div');

        // 多选工具条
        const bar = document.createElement('div');
        bar.className = CLASSES.TOOLBAR;
        panelToolbarEl = bar;

        const selWrap = document.createElement('label');
        selWrap.className = 'cyc-hidden-select-all';
        panelSelectAllEl = document.createElement('input');
        panelSelectAllEl.type = 'checkbox';
        const selText = document.createElement('span');
        selText.textContent = '全选';
        selWrap.appendChild(panelSelectAllEl);
        selWrap.appendChild(selText);
        selWrap.addEventListener('click', e => e.stopPropagation());
        panelSelectAllEl.addEventListener('change', () => {
            const list = loadHidden();
            if (panelSelectAllEl.checked) list.forEach(x => selectedKeys.add(x.key));
            else selectedKeys.clear();
            panelListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                const key = cb.dataset.cycKey;
                if (key) cb.checked = selectedKeys.has(key);
            });
            syncSelectionUI(list);
        });

        panelCountEl = document.createElement('span');
        panelCountEl.className = 'cyc-hidden-sel-count';

        panelDelBtnEl = document.createElement('button');
        panelDelBtnEl.className = 'cyc-hidden-del-btn';
        panelDelBtnEl.type = 'button';
        panelDelBtnEl.textContent = '解除屏蔽';
        panelDelBtnEl.disabled = true;
        panelDelBtnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const n = selectedKeys.size;
            if (!n) return;
            showConfirm(panelDelBtnEl, `所选的 ${n} 部番剧`, () => {
                const snap = loadHidden().slice();
                Array.from(selectedKeys).forEach(k => {
                    const hit = snap.find(x => x.key === k);
                    removeHidden(k);
                    pushHistory('unhide', { key: k, title: hit ? hit.title : k }, true);
                });
                selectedKeys.clear();
                updateHistoryPanel();
                updatePanel();
                processCards();
            }, 'unhide');
        });

        bar.appendChild(selWrap);
        bar.appendChild(panelCountEl);
        bar.appendChild(panelDelBtnEl);

        // 历史工具条
        histToolbarEl = document.createElement('div');
        histToolbarEl.className = CLASSES.TOOLBAR;
        histToolbarEl.style.display = 'none';

        const hSelWrap = document.createElement('label');
        hSelWrap.className = 'cyc-hidden-select-all';
        histSelectAllEl = document.createElement('input');
        histSelectAllEl.type = 'checkbox';
        const hSelText = document.createElement('span');
        hSelText.textContent = '全选';
        hSelWrap.appendChild(histSelectAllEl);
        hSelWrap.appendChild(hSelText);
        hSelWrap.addEventListener('click', e => e.stopPropagation());
        histSelectAllEl.addEventListener('change', () => {
            const list = loadHistory();
            if (histSelectAllEl.checked) {
                list.forEach(x => { if (!x.undone) historySelectedIds.add(x.id); });
            } else {
                historySelectedIds.clear();
            }
            histListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                const id = cb.dataset.cycHistId;
                if (id) cb.checked = historySelectedIds.has(id);
            });
            syncHistorySelectionUI(list);
        });

        histCountEl = document.createElement('span');
        histCountEl.className = 'cyc-hidden-sel-count';

        histUndoBtnEl = document.createElement('button');
        histUndoBtnEl.className = 'cyc-hidden-del-btn';
        histUndoBtnEl.type = 'button';
        histUndoBtnEl.textContent = '撤销';
        histUndoBtnEl.disabled = true;
        histUndoBtnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const n = historySelectedIds.size;
            if (!n) return;
            showConfirm(histUndoBtnEl, `所选的 ${n} 条历史记录`, () => {
                loadHistory().forEach(item => {
                    if (historySelectedIds.has(item.id)) applyUndo(item);
                });
                historySelectedIds.clear();
                saveHistory();
                updateHistoryPanel();
                updatePanel();
                processCards();
            }, 'undo');
        });

        histToolbarEl.appendChild(hSelWrap);
        histToolbarEl.appendChild(histCountEl);
        histToolbarEl.appendChild(histUndoBtnEl);

        histListEl = document.createElement('div');
        histListEl.style.display = 'none';

        panelEl.appendChild(head);
        panelEl.appendChild(bar);
        panelEl.appendChild(panelListEl);
        panelEl.appendChild(histToolbarEl);
        panelEl.appendChild(histListEl);

        document.body.appendChild(panelBtnEl);
        document.body.appendChild(panelEl);
        setView('list');
    }

    function syncSelectionUI(list) {
        if (!panelSelectAllEl || !panelDelBtnEl) return;
        const total = list ? list.length : loadHidden().length;
        const n = selectedKeys.size;
        panelCountEl.textContent = n ? `已选 ${n} 部` : `共 ${total} 部`;
        panelDelBtnEl.disabled = n === 0;
        panelDelBtnEl.textContent = n ? `解除屏蔽 (${n})` : '解除屏蔽';
        panelSelectAllEl.checked = total > 0 && n === total;
        panelSelectAllEl.indeterminate = n > 0 && n < total;
    }

    function updatePanel() {
        if (!panelListEl || !panelBtnEl) return;
        const list = loadHidden();
        panelBtnEl.textContent = `已屏蔽 (${list.length})`;
        panelListEl.textContent = '';

        const valid = new Set(list.map(x => x.key));
        Array.from(selectedKeys).forEach(k => { if (!valid.has(k)) selectedKeys.delete(k); });

        if (list.length === 0) {
            const empty = document.createElement('div');
            empty.className = CLASSES.HIDDEN_EMPTY;
            empty.textContent = '暂无屏蔽';
            panelListEl.appendChild(empty);
            syncSelectionUI(list);
            return;
        }

        const frag = document.createDocumentFragment();
        list.forEach(item => {
            const row = document.createElement('div');
            row.className = CLASSES.HIDDEN_ITEM;

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = selectedKeys.has(item.key);
            cb.dataset.cycKey = item.key;
            cb.addEventListener('click', e => e.stopPropagation());
            cb.addEventListener('change', () => {
                cb.checked ? selectedKeys.add(item.key) : selectedKeys.delete(item.key);
                syncSelectionUI(list);
            });

            const name = document.createElement('span');
            name.textContent = item.title || item.key;
            name.title = item.title || item.key;
            name.addEventListener('click', () => {
                cb.checked = !cb.checked;
                cb.checked ? selectedKeys.add(item.key) : selectedKeys.delete(item.key);
                syncSelectionUI(list);
            });

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '恢复';
            btn.addEventListener('click', () => {
                const title = item.title || item.key;
                removeHidden(item.key);
                pushHistory('unhide', { key: item.key, title });
                updatePanel();
                processCards();
            });

            row.appendChild(cb);
            row.appendChild(name);
            row.appendChild(btn);
            frag.appendChild(row);
        });
        panelListEl.appendChild(frag);
        syncSelectionUI(list);
    }

    function syncHistorySelectionUI(list) {
        if (!histSelectAllEl || !histUndoBtnEl) return;
        const arr = list || loadHistory();
        const selectable = arr.filter(x => !x.undone).length;
        const n = historySelectedIds.size;
        histCountEl.textContent = n ? `已选 ${n} 条` : `共 ${arr.length} 条`;
        histUndoBtnEl.disabled = n === 0;
        histUndoBtnEl.textContent = n ? `撤销 (${n})` : '撤销';
        histSelectAllEl.disabled = selectable === 0;
        histSelectAllEl.checked = selectable > 0 && n === selectable;
        histSelectAllEl.indeterminate = n > 0 && n < selectable;
    }

    function undoHistoryItem(item) {
        if (!applyUndo(item)) return;
        saveHistory();
        updateHistoryPanel();
        updatePanel();
        processCards();
    }

    function updateHistoryPanel() {
        if (!histListEl) return;
        const list = loadHistory();
        histListEl.textContent = '';

        const valid = new Set(list.filter(x => !x.undone).map(x => x.id));
        Array.from(historySelectedIds).forEach(id => { if (!valid.has(id)) historySelectedIds.delete(id); });

        if (list.length === 0) {
            const empty = document.createElement('div');
            empty.className = CLASSES.HIDDEN_EMPTY;
            empty.textContent = '暂无历史';
            histListEl.appendChild(empty);
            syncHistorySelectionUI(list);
            return;
        }

        const frag = document.createDocumentFragment();
        list.forEach(item => {
            const row = document.createElement('div');
            row.className = `${CLASSES.HISTORY_ITEM}${item.undone ? ` ${CLASSES.HISTORY_UNDONE}` : ''}`;

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = historySelectedIds.has(item.id);
            cb.disabled = !!item.undone;
            cb.dataset.cycHistId = item.id;
            cb.addEventListener('click', e => e.stopPropagation());
            cb.addEventListener('change', () => {
                cb.checked ? historySelectedIds.add(item.id) : historySelectedIds.delete(item.id);
                syncHistorySelectionUI(list);
            });

            const main = document.createElement('div');
            main.className = 'cyc-history-main';

            const line1 = document.createElement('div');
            line1.className = 'cyc-history-line1';

            const badge = document.createElement('span');
            badge.className = `cyc-history-badge ${item.type === 'hide' ? 'cyc-badge-hide' : 'cyc-badge-unhide'}`;
            badge.textContent = item.type === 'hide' ? '屏蔽' : '解除';

            const name = document.createElement('span');
            name.className = 'cyc-history-name';
            name.textContent = item.title || item.key;
            name.title = `${item.title || item.key}\n${fmtHistoryTime(item.t)}`;
            name.addEventListener('click', () => {
                if (item.undone) return;
                cb.checked = !cb.checked;
                cb.checked ? historySelectedIds.add(item.id) : historySelectedIds.delete(item.id);
                syncHistorySelectionUI(list);
            });

            line1.appendChild(badge);
            line1.appendChild(name);

            const line2 = document.createElement('div');
            line2.className = 'cyc-history-line2';
            line2.textContent = fmtHistoryTime(item.t) + (item.undone ? ' · 已撤销' : '');

            main.appendChild(line1);
            main.appendChild(line2);

            const btn = document.createElement('button');
            btn.className = 'cyc-history-undo';
            btn.type = 'button';
            btn.textContent = item.undone ? '已撤销' : '撤销';
            btn.disabled = !!item.undone;
            if (!item.undone) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    undoHistoryItem(item);
                });
            }

            row.appendChild(cb);
            row.appendChild(main);
            row.appendChild(btn);
            frag.appendChild(row);
        });
        histListEl.appendChild(frag);
        syncHistorySelectionUI(list);
    }

    // ========== 同步界面 ==========
    let syncMaskEl = null;
    let syncModalEl = null;
    let syncEmailEl = null;
    let syncPwdEl = null;
    let syncDirEl = null;
    let syncDebounceEl = null;
    let syncAutoEl = null;
    let syncStatusEl = null;
    let syncPwdStateEl = null;
    let syncTestBtnEl = null;
    let syncNowBtnEl = null;
    let formDirty = false;
    let fieldTimer = null;
    let syncLastKind = '';

    function setStatus(text, kind) {
        if (!syncStatusEl) return;
        syncLastKind = kind || '';
        syncStatusEl.textContent = text || '';
        syncStatusEl.classList.remove('ok', 'err');
        if (kind) syncStatusEl.classList.add(kind);
    }

    function refreshStatusOverview() {
        if (!syncStatusEl || syncLastKind === 'err') return;
        setStatus(syncStatusText(), syncLastKind);
    }

    function saveFieldsNow() {
        if (!syncEmailEl) return;
        if (fieldTimer) { clearTimeout(fieldTimer); fieldTimer = null; }
        const c = loadSyncCfg();
        c.email = (syncEmailEl.value || '').trim();
        c.dir = normDir(syncDirEl.value || '/CYC-LightMode');
        c.debounce = Math.max(3, Math.min(120, Number(syncDebounceEl.value) || 15));
        saveSyncCfg();
        formDirty = false;
        paintSyncUi();
        refreshStatusOverview();
    }

    function saveFieldsSoon() {
        formDirty = true;
        if (fieldTimer) clearTimeout(fieldTimer);
        fieldTimer = setTimeout(() => { fieldTimer = null; saveFieldsNow(); }, 600);
    }

    function credVerified() {
        const c = loadSyncCfg();
        return !!(connOk || c.verified || (c.lastSyncAt > 0 && hasCred()));
    }

    function syncStatusText() {
        const c = loadSyncCfg();
        const bits = [];
        bits.push(c.auto ? '自动同步：已开启' : '自动同步：未开启');
        if (c.lastSyncAt) bits.push(`上次同步：${fmtHistoryTime(c.lastSyncAt)}`);
        if (isPending()) bits.push('状态：有变更待推送');
        bits.push(`本地：屏蔽 ${loadHidden().length} 部 / 历史 ${loadHistory().length} 条`);
        bits.push(`备份位置：${normDir(c.dir)}/${BACKUP_NAME}`);
        if (syncState.error) bits.push(`最近错误：${syncState.error}`);
        return bits.join('\n');
    }

    function paintSyncUi() {
        const c = loadSyncCfg();
        let cls = 'st-off';
        if (syncState.status === SYNC_STATUS.BUSY) cls = 'st-busy';
        else if (syncState.status === SYNC_STATUS.FAIL) cls = 'st-fail';
        else if (isPending()) cls = 'st-dirty';
        else if (c.auto && c.lastSyncAt) cls = 'st-ok';

        if (syncToggleEl) {
            syncToggleEl.classList.remove('st-ok', 'st-dirty', 'st-fail', 'st-busy', 'st-off');
            syncToggleEl.classList.add(cls);
            const dot = {
                'st-ok': '已同步',
                'st-dirty': '待推送',
                'st-fail': '同步失败',
                'st-busy': '同步中',
                'st-off': '未启用'
            }[cls];
            syncToggleEl.title = `坚果云同步：${dot}\n${syncStatusText()}`;
        }
        if (syncAutoEl) syncAutoEl.checked = !!c.auto;
        if (syncNowBtnEl) syncNowBtnEl.disabled = syncState.busy;
        if (syncTestBtnEl) syncTestBtnEl.disabled = syncState.busy;
    }

    function ensureSyncModal() {
        if (syncModalEl || !document.body) return;

        syncMaskEl = document.createElement('div');
        syncMaskEl.className = CLASSES.SYNC_MASK;

        syncModalEl = document.createElement('div');
        syncModalEl.className = CLASSES.SYNC_MODAL;
        syncModalEl.innerHTML =
            '<div class="cyc-sync-head"><span>坚果云同步</span><button type="button" class="cyc-sync-mini cyc-sync-close" title="关闭">\u00d7</button></div>' +
            '<label>账号邮箱<input type="email" class="cyc-sync-email" autocomplete="off" placeholder="坚果云账号邮箱"></label>' +
            '<label>应用密码（不是登录密码）<div class="cyc-sync-pwdrow">' +
            '<input type="password" class="cyc-sync-pwd" autocomplete="new-password" placeholder="留空表示不修改">' +
            '<button type="button" class="cyc-sync-mini cyc-sync-eye">显示</button>' +
            '</div></label>' +
            '<div class="cyc-sync-hint cyc-sync-pwdstate"></div>' +
            '<label>备份目录（坚果云内的相对路径）<input type="text" class="cyc-sync-dir" autocomplete="off" placeholder="/CYC-LightMode"></label>' +
            '<label>改动后延迟推送<select class="cyc-sync-debounce">' +
            '<option value="10">10 秒</option><option value="15">15 秒</option>' +
            '<option value="30">30 秒</option><option value="60">60 秒</option>' +
            '</select></label>' +
            '<label class="cyc-sync-auto"><input type="checkbox" class="cyc-sync-auto-cb">开启自动同步</label>' +
            '<div class="cyc-sync-actions">' +
            '<button type="button" class="cyc-sync-mini cyc-sync-test">测试连接</button>' +
            '<button type="button" class="cyc-sync-mini cyc-sync-now">立即同步</button>' +
            '<button type="button" class="cyc-sync-mini cyc-sync-export">导出备份</button>' +
            '<button type="button" class="cyc-sync-mini cyc-sync-import">导入备份</button>' +
            '<button type="button" class="cyc-sync-mini cyc-sync-logout">退出登录</button>' +
            '</div>' +
            '<div class="cyc-sync-status"></div>' +
            '<div class="cyc-sync-hint">凭据保存在脚本扩展存储中并经 AES 加密，不会写入网盘备份文件；应用密码请在坚果云「账户信息 - 安全选项 - 添加应用」处生成。</div>';

        syncEmailEl = syncModalEl.querySelector('.cyc-sync-email');
        syncPwdEl = syncModalEl.querySelector('.cyc-sync-pwd');
        syncDirEl = syncModalEl.querySelector('.cyc-sync-dir');
        syncDebounceEl = syncModalEl.querySelector('.cyc-sync-debounce');
        syncAutoEl = syncModalEl.querySelector('.cyc-sync-auto-cb');
        syncStatusEl = syncModalEl.querySelector('.cyc-sync-status');
        syncPwdStateEl = syncModalEl.querySelector('.cyc-sync-pwdstate');
        syncTestBtnEl = syncModalEl.querySelector('.cyc-sync-test');
        syncNowBtnEl = syncModalEl.querySelector('.cyc-sync-now');

        const closeAndSave = async () => {
            await collectForm();
            openSyncModal(false);
        };
        syncMaskEl.addEventListener('click', closeAndSave);
        syncModalEl.querySelector('.cyc-sync-close').addEventListener('click', closeAndSave);

        [syncEmailEl, syncDirEl].forEach(el => {
            el.addEventListener('input', saveFieldsSoon);
            el.addEventListener('change', saveFieldsNow);
            el.addEventListener('blur', saveFieldsNow);
        });
        syncDebounceEl.addEventListener('change', () => {
            saveFieldsNow();
            setStatus(`延迟推送已设为 ${loadSyncCfg().debounce} 秒`, 'ok');
        });

        syncModalEl.querySelector('.cyc-sync-eye').addEventListener('click', (e) => {
            e.preventDefault();
            const show = syncPwdEl.type === 'password';
            syncPwdEl.type = show ? 'text' : 'password';
            e.currentTarget.textContent = show ? '隐藏' : '显示';
        });

        syncAutoEl.addEventListener('change', async () => {
            await collectForm();
            setAuto(syncAutoEl.checked);
        });
        syncTestBtnEl.addEventListener('click', () => { runTest(); });
        syncNowBtnEl.addEventListener('click', async () => {
            await collectForm();
            doSync('full');
        });
        syncModalEl.querySelector('.cyc-sync-export').addEventListener('click', () => {
            saveFieldsNow();
            exportBackup();
        });
        syncModalEl.querySelector('.cyc-sync-import').addEventListener('click', () => {
            saveFieldsNow();
            importBackupFile();
        });
        syncModalEl.querySelector('.cyc-sync-logout').addEventListener('click', async (e) => {
            e.preventDefault();
            await collectForm();
            showConfirm(e.currentTarget, '清除本机保存的坚果云凭据（不影响屏蔽数据）', logoutSync, 'imp');
        });

        document.body.appendChild(syncMaskEl);
        document.body.appendChild(syncModalEl);
    }

    function refreshPwdHint() {
        if (!syncPwdStateEl) return;
        if (hasCred()) {
            pwdTail().then(t => {
                if (syncPwdStateEl) syncPwdStateEl.textContent = `已保存应用密码 · 尾号 ${t}（留空则不修改）`;
            });
        } else {
            syncPwdStateEl.textContent = '尚未保存应用密码';
        }
    }

    async function openSyncModal(open) {
        if (!document.body) return;
        ensureSyncModal();
        if (!syncModalEl) return;
        if (!open) {
            syncMaskEl.classList.remove(CLASSES.PANEL_OPEN);
            syncModalEl.classList.remove(CLASSES.PANEL_OPEN);
            return;
        }
        const c = loadSyncCfg();
        if (!formDirty) {
            syncEmailEl.value = c.email || '';
            syncDirEl.value = normDir(c.dir);
            syncDebounceEl.value = String(Math.max(3, Math.min(120, Number(c.debounce) || 15)));
        }
        syncPwdEl.value = '';
        refreshPwdHint();
        const kind = syncState.status === SYNC_STATUS.FAIL ? 'err'
            : syncState.status === SYNC_STATUS.OK ? 'ok' : '';
        setStatus(syncStatusText(), kind);
        paintSyncUi();
        syncMaskEl.classList.add(CLASSES.PANEL_OPEN);
        syncModalEl.classList.add(CLASSES.PANEL_OPEN);
    }

    async function collectForm() {
        const c = loadSyncCfg();
        saveFieldsNow();
        syncDirEl.value = c.dir;

        const typed = syncPwdEl ? (syncPwdEl.value || '') : '';
        if (typed.trim()) {
            GM_setValue(STORAGE_KEYS.SYNC_PWD, await encryptText(typed.trim()));
            syncPwdEl.value = '';
            if (syncPwdEl.type === 'text') syncPwdEl.type = 'password';
            connOk = false;
            c.verified = false;
            c.lastSyncAt = 0;
            saveSyncCfg();
        }
        refreshPwdHint();
        return !!(c.email && hasCred());
    }

    async function runTest() {
        ensureSyncModal();
        const ok = await collectForm();
        const c = loadSyncCfg();
        if (!ok) {
            connOk = false;
            if (syncStatusEl) setStatus('请先填写邮箱和应用密码', 'err');
            return false;
        }
        if (syncStatusEl) setStatus('正在连接坚果云…');
        syncState.busy = true;
        syncState.status = SYNC_STATUS.BUSY;
        paintSyncUi();

        let good = false;
        let msg = '';
        let kind = 'err';
        try {
            const r = await davWithRetry('GET', fileUrl(c.dir), {});
            const tail = await pwdTail();
            if (r.status === 200) {
                const b = parseBackup(r.text);
                good = true;
                kind = 'ok';
                const info = b ? `${b.hidden.length} 部屏蔽 / ${b.history.length} 条历史` : '（内容待解析）';
                msg = `连接正常（尾号 ${tail}）：已读到云端备份 ${info}`;
            } else if (r.status === 404) {
                good = true;
                kind = 'ok';
                msg = `连接正常（尾号 ${tail}）：账号可用，备份文件尚未创建，开启同步后自动写入 ${normDir(c.dir)}`;
            } else {
                good = false;
                msg = `连接失败：${r.error || davHint(r.status)}`;
            }
        } catch (e) {
            msg = `连接失败：${e.message || e}`;
        }

        syncState.busy = false;
        connOk = good;
        syncState.status = good ? (isPending() ? SYNC_STATUS.DIRTY : SYNC_STATUS.OK) : SYNC_STATUS.FAIL;
        syncState.error = good ? '' : msg.replace(/^连接失败：/, '');
        paintSyncUi();
        refreshMenus();
        if (syncStatusEl) setStatus(msg, kind);
        return good;
    }

    function setAuto(on) {
        const c = loadSyncCfg();
        if (on && !credVerified()) {
            if (syncStatusEl) setStatus('这份配置还没验证过，请先点「测试连接」', 'err');
            paintSyncUi();
            refreshMenus();
            return;
        }
        c.auto = !!on;
        saveSyncCfg();
        paintSyncUi();
        refreshMenus();
        if (c.auto) doSync('full');
        else if (syncStatusEl) setStatus('已关闭自动同步，本地数据不受影响', 'ok');
    }

    function logoutSync() {
        GM_deleteValue(STORAGE_KEYS.SYNC_PWD);
        GM_deleteValue(STORAGE_KEYS.WRAP_KEY);
        const c = loadSyncCfg();
        c.auto = false;
        c.verified = false;
        saveSyncCfg();
        connOk = false;
        formDirty = false;
        syncState.status = SYNC_STATUS.OFF;
        syncState.error = '';
        openSyncModal(true);
        setStatus('已清除本机凭据，屏蔽数据未受影响', 'ok');
        paintSyncUi();
        refreshMenus();
    }

    // ========== 菜单命令（精简版） ==========
    const menuHandles = {};

    function regMenu(key, label, fn) {
        try {
            if (typeof GM_registerMenuCommand !== 'function') return;
            if (menuHandles[key] !== undefined && typeof GM_unregisterMenuCommand === 'function') {
                try { GM_unregisterMenuCommand(menuHandles[key]); } catch (e) { /* 忽略 */ }
            }
            menuHandles[key] = GM_registerMenuCommand(label, fn);
        } catch (e) { /* 忽略 */ }
    }

    function refreshMenus() {
        const c = loadSyncCfg();
        let tail = '';
        if (syncState.busy) tail = ' · 同步中';
        else if (syncState.status === SYNC_STATUS.FAIL) tail = ' · 失败';
        else if (isPending()) tail = ' · 待推送';
        else if (c.lastSyncAt) tail = ' · 已同步';

        regMenu('toggle', `${c.auto ? '[已开启] ' : '[已关闭] '}坚果云自动同步${tail}`, () => setAuto(!c.auto));
        regMenu('open', '同步设置…', () => openSyncModal(true));
        regMenu('now', '立即同步一次', () => {
            if (!syncUsable()) { openSyncModal(true); return; }
            doSync('full');
        });
    }

    function setupLocalCrossTabSync() {
        if (typeof GM_addValueChangeListener !== 'function') return;
        [STORAGE_KEYS.SYNC_CFG, STORAGE_KEYS.SYNC_PWD].forEach(k => {
            GM_addValueChangeListener(k, (_name, _oldVal, _newVal, remote) => {
                if (!remote) return;
                syncCfg = null;
                loadSyncCfg();
                paintSyncUi();
                refreshMenus();
            });
        });
    }

    function initSync() {
        loadSyncCfg();
        refreshMenus();
        paintSyncUi();
        setupLocalCrossTabSync();
        setTimeout(() => maybePull('load'), 1200);
    }

    // ========== 渲染调度 ==========
    let scheduled = false;
    let mutating = false;
    let suppressed = false;

    function scheduleProcess() {
        if (mutating) { suppressed = true; return; }
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            mutating = true;
            try {
                processCards();
            } finally {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        mutating = false;
                        if (suppressed) { suppressed = false; scheduleProcess(); }
                    });
                });
            }
        });
    }

    // ========== 初始化 ==========
    function initHideFeature() {
        ensureHideStyle();
        ensurePanel();
        updatePanel();
        processCards();
        initSync();
    }

    function whenBodyReady(cb) {
        if (document.body) { setTimeout(cb, 0); return; }
        document.addEventListener('DOMContentLoaded', cb, { once: true });
    }

    function apply() {
        ensureStyle();
        syncMeta();
        document.documentElement.classList.remove('dark');
    }

    apply();
    window.addEventListener('load', apply, { once: true });
    whenBodyReady(initHideFeature);

    // 路由监听
    window.addEventListener('popstate', scheduleProcess);
    let lastHref = location.href;
    function watchRoute() {
        if (location.href !== lastHref) {
            lastHref = location.href;
            scheduleProcess();
        }
    }
    setInterval(watchRoute, 500);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) return;
        lastHref = location.href;
        scheduleProcess();
        maybePull('resume');
    });

    function observeHead() {
        if (!document.head) return;
        new MutationObserver(() => {
            if (!document.getElementById(CSS_IDS.MAIN_STYLE)) ensureStyle();
            if (!document.getElementById(CSS_IDS.HIDE_STYLE)) ensureHideStyle();
        }).observe(document.head, { childList: true });
    }

    if (document.head) observeHead();
    else document.addEventListener('DOMContentLoaded', observeHead, { once: true });
})();
