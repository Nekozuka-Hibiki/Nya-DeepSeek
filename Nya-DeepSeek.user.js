// ==UserScript==
// @name         喵搜~DeepSeek
// @namespace    https://github.com/Nekozuka-Hibiki/Nya-DeepSeek
// @version      26.9.5
// @description  https://chat.deepseek.com/?q=%s
// @icon         https://upload.wikimedia.org/wikipedia/commons/9/95/DeepSeek-icon.svg
// @author       Nekozuka-Hibiki
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js
// @updateURL    https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js
// ==/UserScript==

(() => {
    'use strict';

    const PROMPTS = {
        fast: `请用最简洁的方式直接给出以上问题的答案。\n要求：\n- 只输出核心结果，一两句话即可，禁止寒暄、解释、建议或任何附加内容。\n- 如果是数据，直接给出事实或数字。\n- 如有官网、下载地址或可靠来源等，提供有效网络链接。\n- 如果不确定或信息不足，直接回复不确定。`,
        search: `请直接作为搜索引擎回答以上问题。\n要求：\n- 优先提供最新、准确的事实和关键信息。\n- 全面深度搜索、包括外网及各种论坛。\n- 先给出简洁核心答案，再用项目符号列出细节。\n- 如涉及时事或数据，始终使用最新知识，并标注大致时间或来源类型。\n- 如有官网、下载地址或可靠来源等，优先提供有效网络链接，再补充其他内容。\n- 避免寒暄、主观评价，如果信息不足，直接说“当前信息有限”。\n- 严格基于可靠事实回答，绝不编造未确认的信息。\n- 如果存在争议，列出主流观点并注明来源类型。`,
        explain: `请作为一位极度耐心、把用户当成完全小白的专业解释者，用最通俗易懂的方式，从零开始深入浅出地解释以上问题。\n要求：\n- 假设用户什么都不懂，先从最基础的概念讲起，一步一步推进到核心原理，不跳跃任何前置知识。\n- 每出现一个新概念、专业术语或容易混淆的点，都立刻用生活中的类比、日常例子或形象比喻来解释。\n- 多用“就好比……”、“打个比方……”、“想象一下……”这样的表达。\n- 用编号步骤、项目符号或分层小标题清晰结构化回答，便于跟随。\n- 如果涉及复杂过程，用简单步骤拆解，每一步都说明“这一步在干什么，为什么要这么做”。\n- 绝不跳跃假设用户已经懂了某个前提。\n- 最后用最白话的大白话总结核心要点，让用户看完就觉得“哦，原来是这样！”。\n- 保持客观，不加个人观点或调侃。\n- 所有解释必须基于公认事实和逻辑，禁止添加未确认的内容或虚构例子。`,
        academic: `请以严谨学术风格回答以上问题。\n要求：\n- 所有事实必须准确，禁止编造。\n- 如涉及数据、研究或事件，请注明大致来源类型（如“根据公开报道”“2025年数据”）。\n- 如果存在争议或信息过时，明确指出不同观点或局限性。\n- 结构：问题重述 → 核心答案 → 证据支持 → 可能的限制。\n- 所有陈述必须有事实依据，禁止任何形式的推测或虚构。\n- 格式示例（仅示例非固定格式，需按照实际情况严谨输出）：\n  1. 问题重述：XXX问题的核心是探究XXX的关联与影响。\n  2. 核心答案：XXX。\n  3. 证据支持：根据2025年《XXX行业白皮书》，XXX数据验证了该结论；相关学术论文也指出XXX。\n  4. 可能的限制：该结论仅适用于XXX场景，受XXX因素影响可能存在偏差。`,
        decision: `请帮助对比并辅助决策以上问题中的选项。\n要求：\n- 用项目符号或表格清晰列出每个选项的主要优缺点。\n- 关键对比维度包括：价格、性能、适用场景、用户评价、长期影响等（根据问题合理选择）。\n- 最后给出明确推荐及客观理由。\n- 保持中立，基于事实，不强加个人偏好。\n- 所有优缺点和数据必须来自真实来源，禁止虚构评价或数据。\n- 如信息不足，明确说明哪个维度数据缺失。`,
        translate: `请作为专业翻译与写作助手处理以上任务。\n要求：\n- 如果是翻译：提供准确、自然、流畅的目标语言版本，默认中文↔英文互译。\n- 如果是润色或改写：贴合原文语境优化表达，未明确风格时，默认保持原文基调（正式文本更严谨，口语文本更流畅，使其更正式/简洁/生动，按任务所需）。\n- 先输出最终版本，再用项目符号简要说明关键修改理由（如有必要）。\n- 严格保留原意，不添加多余内容。`
    };

    if (location.hostname === 'chat.deepseek.com') {
        let originalUrl = '';
        try {
            const nav = performance.getEntriesByType('navigation');
            originalUrl = nav.length ? nav[0].name : location.href;
        } catch {
            originalUrl = location.href;
        }

        let data = null;
        try {
            const url = new URL(originalUrl);
            const q = url.searchParams.get('q');
            const mode = url.searchParams.get('mode') || 'search';
            if (q?.trim()) {
                data = {
                    question: decodeURIComponent(q.trim()),
                    prompt: (PROMPTS[mode] || PROMPTS.search).trim()
                };
            }
        } catch {}

        if (data) {
            const fullText = data.question + '\n\n' + data.prompt;
            const selectors = [
                'textarea[placeholder*="提问"]', 'textarea[placeholder*="输入"]', 'textarea[placeholder*="消息"]',
                'textarea', '[contenteditable="true"][role="textbox"]', '.chat-input',
                '.input-area textarea', '.input-box textarea', 'div[contenteditable="true"]'
            ].join(',');

            let observer = null;
            let filled = false;

            const fillAndSend = () => {
                if (filled) return;
                const input = document.querySelector(selectors);
                if (!input || input.offsetWidth === 0 || input.offsetHeight === 0) return;

                filled = true;
                if (observer) observer.disconnect();

                try {
                    if (input.isContentEditable) {
                        input.innerText = fullText;
                    } else {
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                        if (setter) setter.call(input, fullText);
                        else input.value = fullText;
                    }
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.focus();
                } catch {}

                setTimeout(() => {
                    const enter = new KeyboardEvent('keydown', {
                        key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                        bubbles: true, cancelable: true
                    });
                    input.dispatchEvent(enter);
                }, 0);

                setTimeout(() => {
                    try {
                        const url = new URL(location.href);
                        if (url.searchParams.has('q') || url.searchParams.has('mode')) {
                            url.searchParams.delete('q');
                            url.searchParams.delete('mode');
                            history.replaceState({}, document.title, url.href);
                        }
                    } catch {}
                }, 400);
            };

            fillAndSend();
            if (!filled) {
                observer = new MutationObserver(() => { if (!filled) fillAndSend(); });
                observer.observe(document.documentElement, { childList: true, subtree: true });
                setTimeout(() => {
                    if (observer && !filled) {
                        observer.disconnect();
                    }
                }, 8000);
            }
        }
    }

    if (typeof GM_registerMenuCommand !== 'undefined' && typeof GM_openInTab !== 'undefined') {
        const BASE = 'https://chat.deepseek.com/?q=';
        const MODES = [
            ['🔍 喵搜（默认）', 'search'],
            ['⚡ 一句喵', 'fast'],
            ['📚 笨喵解释', 'explain'],
            ['🎓 学喵分析', 'academic'],
            ['⚖️ 喵对比', 'decision'],
            ['🌐 喵翻译/润色', 'translate']
        ];
        MODES.forEach(([name, mode]) => {
            GM_registerMenuCommand(name, () => {
                const q = prompt(`${name}\n喵～你要问什么？`, '');
                if (q?.trim()) {
                    GM_openInTab(`${BASE}${encodeURIComponent(q.trim())}&mode=${mode}`, { active: true, insert: true });
                }
            });
        });
    }
})();
