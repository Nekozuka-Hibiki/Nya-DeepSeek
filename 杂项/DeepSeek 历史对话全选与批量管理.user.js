// ==UserScript==
// @name         DeepSeek 历史对话全选与批量管理
// @description  一键全选非置顶对话，完美融合原生多选工具栏
// @namespace    https://github.com/Nekozuka-Hibiki
// @version      26.11.13
// @author       Nekozuka-Hibiki
// @license      GPL-3.0
// @homepageURL  https://github.com/Nekozuka-Hibiki/Nya-DeepSeek
// @match        https://chat.deepseek.com/*
// @icon         https://upload.wikimedia.org/wikipedia/commons/9/95/DeepSeek-icon.svg
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let isToggling = false;
  let syncTimer = null;

  /* ================= 图标资源 ================= */
  const ICONS = {
    all: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.4" /><path d="M5 8L7 10L11 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>`,
    pin: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8.65991 0.963799L14.9886 7.29249L13.2306 7.64409L9.71469 11.16L9.20318 14.2291C9.12295 14.7105 8.53216 14.8998 8.18708 14.5547L1.39767 7.76533C1.05258 7.42024 1.24191 6.82946 1.72329 6.74923L4.79237 6.23771L8.30831 2.72177L8.65991 0.963799Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path><path d="M4.41056 12.8146C3.98733 12.3893 3.56409 11.964 3.14085 11.5388C3.0912 11.6014 3.04156 11.664 2.99192 11.7266C2.09834 12.854 1.20476 13.9814 0.311181 15.1087C0.261538 15.1713 0.211895 15.234 0.162251 15.2966C0.320966 15.4561 0.479681 15.6156 0.638396 15.775C0.701265 15.7257 0.764135 15.6764 0.827004 15.627C1.95865 14.7389 3.09031 13.8508 4.22196 12.9626C4.28483 12.9133 4.3477 12.864 4.41056 12.8146Z" fill="currentColor"></path></svg>`,
    del: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z" fill="currentColor"></path></svg>`
  };

  /* ================= 核心判定逻辑 ================= */
  function isSelectMode() {
    return !!document.querySelector('a[role="button"][aria-pressed]');
  }

  function isChecked(a) {
    return a.getAttribute('aria-pressed') === 'true';
  }

  function getSelectableItems() {
    const items = Array.from(document.querySelectorAll('a')).filter(a => a.querySelector('.c08e6e93'));
    return items.filter(a => !a.closest('[class*="_63701b7"]'));
  }

  /* ================= 状态同步 ================= */
  function syncBtnState() {
    const myPin = document.getElementById('ds-btn-pin');
    const myDel = document.getElementById('ds-btn-del');
    const myText = document.getElementById('ds-btn-all-text');
    if (!myPin || !myDel || !myText) return;

    const inSelectMode = isSelectMode();
    let hasSelected = false;

    if (inSelectMode) {
      const items = getSelectableItems();
      hasSelected = items.some(isChecked);

      if (!isToggling) {
        const allSelected = items.length > 0 && items.every(isChecked);
        const expected = allSelected ? '取消全选' : '全选';
        if (myText.textContent !== expected) myText.textContent = expected;
      }
    } else {
      if (myText.textContent !== '全选') myText.textContent = '全选';
    }

    myPin.disabled = !inSelectMode || !hasSelected;
    myDel.disabled = !inSelectMode || !hasSelected;
  }

  /* ================= 交互逻辑 ================= */
  async function toggleAll() {
    if (isToggling) return;
    isToggling = true;

    const items = getSelectableItems();
    const allSelected = items.length > 0 && items.every(isChecked);
    const target = !allSelected;

    const textEl = document.getElementById('ds-btn-all-text');
    if (textEl) textEl.textContent = target ? '取消全选' : '全选';

    for (const a of items) {
      if (isChecked(a) !== target) {
        a.click();
        await new Promise(r => setTimeout(r, 10));
      }
    }

    isToggling = false;
    syncBtnState();
  }

  async function enterSelectModeIfNeeded() {
    if (isSelectMode()) return true;
    const entry = document.querySelector('._8023265') || Array.from(document.querySelectorAll('[role="button"]')).find(b => !b.querySelector('.c08e6e93') && !b.href);
    if (entry) {
      entry.click();
      return new Promise(resolve => setTimeout(() => resolve(isSelectMode()), 150));
    }
    return false;
  }

  /* ================= UI 渲染 ================= */
  function injectToolbar() {
    if (document.getElementById('ds-native-toolbar')) return;
    const historyScroll = document.querySelector('._3586175.ds-scroll-area') || document.querySelector('._6d215eb.ds-scroll-area');
    if (!historyScroll) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'ds-native-toolbar';
    toolbar.className = '_7b40dad';
    toolbar.style.marginTop = '4px';
    toolbar.innerHTML = `
      <div class="dc1f7bee _4bcc731" style="padding: 4px 12px 12px 12px;">
        <div class="_35dde8c">
          <div class="_98e781c"><button type="button" class="_82a287d" id="ds-btn-all" style="white-space:nowrap"><div class="ds-icon">${ICONS.all}</div><span id="ds-btn-all-text">全选</span></button></div>
          <div class="a8334b0d"></div>
          <div class="_98e781c"><button type="button" class="_82a287d" id="ds-btn-pin" disabled style="white-space:nowrap"><div class="ds-icon">${ICONS.pin}</div>置顶</button></div>
          <div class="a8334b0d"></div>
          <div class="_98e781c"><button type="button" class="_82a287d _2daabdb" id="ds-btn-del" disabled style="white-space:nowrap"><div class="ds-icon">${ICONS.del}</div>删除</button></div>
        </div>
      </div>`;

    historyScroll.parentElement.insertBefore(toolbar, historyScroll);
    syncBtnState();

    document.getElementById('ds-btn-all').addEventListener('click', async (e) => {
      e.stopPropagation();
      await enterSelectModeIfNeeded();
      toggleAll();
    });

    document.getElementById('ds-btn-pin').addEventListener('click', (e) => {
      e.stopPropagation();
      const n = document.querySelector('._7b40dad.f14f3a6d ._98e781c:nth-child(1) button');
      if (n && !n.disabled) n.click();
    });

    document.getElementById('ds-btn-del').addEventListener('click', (e) => {
      e.stopPropagation();
      const n = document.querySelector('._7b40dad.f14f3a6d ._98e781c:nth-child(3) button');
      if (n && !n.disabled) n.click();
    });
  }

  /* ================= 优雅监听器 ================= */
  const observer = new MutationObserver((mutations) => {
    const isFromToolbar = mutations.some(m =>
      m.target.closest && m.target.closest('#ds-native-toolbar')
    );
    if (isFromToolbar) return;

    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncBtnState, 50);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['aria-pressed', 'disabled'],
    subtree: true
  });

  document.body.addEventListener('click', (e) => {
    if (e.target.closest('#ds-native-toolbar')) return;

    setTimeout(() => {
      if (document.querySelector('a[href^="/a/chat/s/"]') && !document.getElementById('ds-native-toolbar')) {
        injectToolbar();
      }
      syncBtnState();
    }, 50);
  }, true);

  /* ================= 启动与极速挂载 ================= */
  const fastObserver = new MutationObserver(() => {
    if (document.querySelector('a[href^="/a/chat/s/"]')) {
      injectToolbar();
      if (document.getElementById('ds-native-toolbar')) {
        fastObserver.disconnect();
      }
    }
  });

  fastObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

})();