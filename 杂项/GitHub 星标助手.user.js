// ==UserScript==
// @name         GitHub 星标助手
// @description  侧边栏快捷星标入口 · 星标页默认最近活跃排序 · 排序按钮化 · 分页回顶 · 项目新标签后台打开
// @namespace    https://github.com/Nekozuka-Hibiki
// @version      3.8
// @author       Nekozuka-Hibiki
// @license      GPL-3.0
// @homepageURL  https://github.com/Nekozuka-Hibiki/Nya-DeepSeek
// @match        https://github.com/*
// @icon         https://github.githubassets.com/favicons/favicon.svg
// @grant        GM_openInTab
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // ════════ 1. 全局配置与状态 ════════

    let userLogin = null;
    let pendingScrollTop = false;

    const RESERVED = new Set([
        'settings', 'notifications', 'explore', 'trending', 'login', 'logout',
        'marketplace', 'sponsors', 'topics', 'collections', 'events', 'search',
        'new', 'dashboard', 'stars', 'watching', 'pulls', 'issues', 'about',
        'pricing', 'features', 'security', 'apps', 'discussions', 'orgs', 'users',
        'copilot', 'codespaces', 'ai', 'models', 'enterprise', 'organizations',
    ]);

    const STAR_SVG = `<svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-star"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path></svg>`;

    function ensureActiveSort(u) {
        const p = u.searchParams;
        if (p.get('tab') !== 'stars' || p.has('sort')) return false;
        p.set('sort', 'updated');
        p.set('direction', 'desc');
        return true;
    }

    // ════════ 2. URL 兜底 ════════
    (function () {
        const u = new URL(location.href);
        if (ensureActiveSort(u)) location.replace(u.toString());
    })();


    // ════════ 3. 事件拦截（捕获阶段） ════════
    document.addEventListener('click', (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

        const a = e.target.closest?.('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || (href[0] !== '/' && !href.startsWith(location.origin + '/'))) return;

        // 1. 星标链接 & 分页回顶
        if (href.includes('tab=stars')) {
            if (a.closest('.paginate-container')) pendingScrollTop = true;

            const u = new URL(href, location.origin);
            if (ensureActiveSort(u)) a.setAttribute('href', u.pathname + u.search + u.hash);
            return;
        }

        // 2. 项目链接新标签后台打开
        if (a.target === '_blank') return;

        let isRepo = false;
        if (a.closest('article[id^="feed-item-"]')) {
            isRepo = a.dataset.hovercardType === 'repository' || href.includes('/releases/tag/');
        } else if (a.closest('.col-12.border-bottom')) {
            // 极简正则：同时兼容相对路径 /a/b 和绝对路径 https://github.com/a/b
            const m = /^\/([^/]+)\/([^/]+?)\/?$/.exec(href) || /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/.exec(href);
            isRepo = !!m && !RESERVED.has(m[1].toLowerCase()) && !RESERVED.has(m[2].toLowerCase());
        }

        if (isRepo) {
            e.preventDefault();
            e.stopPropagation();
            GM_openInTab(a.href, { active: false, setParent: true, insert: true });
        }
    }, true);


    // ════════ 4. DOM 注入逻辑 ════════

    function injectSidebar() {
        const nav = document.querySelector('.dashboard-sidebar ul.ActionListWrap');
        if (!nav || nav.querySelector('[data-item-id="stars"]')) return;

        if (!userLogin) userLogin = document.querySelector('meta[name="user-login"]')?.content;

        const tpl = nav.querySelector('[data-item-id="feed"]') || nav.querySelector('[data-item-id="home"]');
        if (!userLogin || !tpl) return;

        const item = tpl.cloneNode(true);
        item.dataset.itemId = 'stars';
        item.removeAttribute('data-analytics-event');
        item.classList.remove('ActionListItem--withActions', 'ActionListItem--navActive');

        const link = item.querySelector('a');
        link.id = 'item-stars';
        link.href = `/${userLogin}?tab=stars&sort=updated&direction=desc`;
        link.removeAttribute('aria-current');

        const visual = item.querySelector('.ActionListItem-visual');
        if (visual) visual.innerHTML = STAR_SVG;

        const label = item.querySelector('.ActionListItem-label');
        if (label) label.textContent = '星标';

        item.querySelectorAll('button.ActionListItem-trailingAction, tool-tip').forEach(el => el.remove());
        tpl.after(item);
    }

    function replaceSortMenu() {
        const menuBtn = document.getElementById('stars-sort-menu-button');
        if (!menuBtn) return;

        const menuWrap = menuBtn.closest('action-menu');
        if (!menuWrap || menuWrap.parentElement.querySelector('[data-sort-injected]')) return;

        const items = menuWrap.querySelectorAll('ul[role="menu"] a');
        if (!items.length) return;

        const targetOrder = ['updated', 'created', 'stars'];
        const labelMap = { 'updated': '活跃', 'created': '最近', 'stars': '最多' };

        // 解析、映射并排序
        const itemData = Array.from(items, a => {
            const sort = new URL(a.href, location.origin).searchParams.get('sort');
            return { href: a.href, sort, text: labelMap[sort] || a.textContent.trim() };
        }).sort((a, b) => targetOrder.indexOf(a.sort) - targetOrder.indexOf(b.sort));

        const group = document.createElement('div');
        group.dataset.sortInjected = 'true';
        group.className = 'd-flex flex-shrink-0 mb-1 tmp-mb-1 mb-lg-0 tmp-mb-lg-0 ml-2 tmp-ml-2';
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', '排序方式');

        const fragment = document.createDocumentFragment();

        itemData.forEach((item, idx) => {
            const btn = document.createElement('a');
            btn.href = item.href;
            btn.className = 'Button--secondary Button--medium Button';

            if (idx === 0) btn.classList.add('rounded-right-0', 'border-right-0');
            else if (idx === itemData.length - 1) btn.classList.add('rounded-left-0');
            else btn.classList.add('rounded-0', 'border-right-0');

            btn.innerHTML = `<span class="Button-content"><span class="Button-label">${item.text}</span></span>`;
            fragment.appendChild(btn);
        });

        group.appendChild(fragment);
        menuWrap.style.display = 'none';
        menuWrap.parentElement.insertBefore(group, menuWrap);
    }

    function tryInject() {
        injectSidebar();
        replaceSortMenu();
    }


    // ════════ 5. 生命周期与调度 ════════

    let observer = null;
    let scheduled = false;

    function scheduleInject() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            tryInject();
        });
    }

    function startObserver() {
        if (observer || !document.body) return;
        observer = new MutationObserver(scheduleInject);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
    }

    // 监听 Turbo 全局路由
    document.addEventListener('turbo:load', () => {
        pendingScrollTop = false;
        tryInject();
        startObserver();
    });

    // 页面切换前/局部刷新前，断开监听，避免无谓的性能消耗
    document.addEventListener('turbo:before-render', stopObserver);

    // 页面切换完成
    document.addEventListener('turbo:render', () => {
        tryInject();
        startObserver();
    });

    // 局部刷新（如分页）完成
    document.addEventListener('turbo:frame-render', () => {
        tryInject();
        if (pendingScrollTop) {
            window.scrollTo(0, 0); // 瞬间回顶
            pendingScrollTop = false;
        }
    });

    // 初始加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            tryInject();
            startObserver();
        }, { once: true });
    } else {
        tryInject();
        startObserver();
    }
})();