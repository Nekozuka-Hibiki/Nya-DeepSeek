// ==UserScript==
// @name         喵搜~DeepSeek
// @namespace    https://github.com/Nekozuka-Hibiki/Nya-DeepSeek
// @version      26.10.12
// @description  https://chat.deepseek.com/?q=%s
// @icon         https://upload.wikimedia.org/wikipedia/commons/9/95/DeepSeek-icon.svg
// @author       Nekozuka-Hibiki
// @match        *://*/*
// @noframes
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js
// @updateURL    https://raw.githubusercontent.com/Nekozuka-Hibiki/Nya-DeepSeek/main/Nya-DeepSeek.user.js
// ==/UserScript==

(() => {
    'use strict';

    const PROMPTS = {
        search: `请以搜索引擎式答案回答以上问题。\n1. 先直接给出核心答案，不要寒暄、不要复述问题。\n2. 如果你能联网，请优先联网核实，并尽量覆盖多来源，包括官网、官方文档、权威媒体、外网及社区论坛等；如果不能联网，请明确说明“以下基于已有知识，可能不是最新”。\n3. 只陈述可确认的事实、数据、时间；无法确认时直接说“无法确认”，不要编造。\n4. 来源处理：优先标明来源类型；只有能确认时才给具体链接，不能确认就不要编造链接、文献或来源。\n5. 如果能确认官网或官方文档，请把链接放在核心答案附近显眼位置（例如核心答案后第一行），但不要为了放链接而牺牲准确性或编造链接。\n6. 涉及可能过时的信息时，注明“截至知识截止”或“建议自行核实最新情况”。\n7. 如有争议，列出主流观点并注明来源类型。\n8. 结构：核心答案 → 官网/关键链接（若可确认）→ 关键信息 → 进一步核实建议（可选）。\n9. 不要主观评价，不要广告式推荐。`,

        explain: `请作为一位极度耐心、把用户当成完全小白的专业解释者，用最通俗易懂的方式解释以上问题。\n1. 假设用户什么都不懂，先从最基础的概念讲起，一步一步推进到核心原理；如果问题很复杂，优先把主线讲清楚，不强行展开所有细节。\n2. 每出现一个新概念、专业术语或容易混淆的点，尽量用生活中的类比、日常例子或形象比喻来解释，但类比要准确，不要为了类比而类比。\n3. 多用“就好比……”、“打个比方……”、“想象一下……”这样的表达。\n4. 用编号步骤、项目符号或分层小标题清晰结构化回答，方便跟随。\n5. 如果涉及复杂过程，用简单步骤拆解，每一步说明“这一步在干什么，为什么要这么做”。\n6. 不要假设用户已经懂了某个前提；如果确实需要前置知识，先用一两句话简单补上。\n7. 最后用最白话的大白话总结核心要点，让用户看完觉得“哦，原来是这样！”。\n8. 保持客观，不加个人观点或调侃；所有解释基于公认事实和逻辑，禁止添加未确认的内容或虚构例子。\n9. 如果某个部分无法用简单语言解释，或者信息不足，直接说明，不要硬编。`,

        decision: `请帮助对比并辅助决策以上问题中的选项。\n1. 用项目符号或表格清晰列出每个选项的主要优缺点。\n2. 根据问题合理选择关键对比维度，例如价格、性能、适用场景、用户评价、长期影响等；如果某个维度不适用，可以不列。\n3. 所有优缺点、数据、评价，尽量基于可确认的事实或来源类型；无法确认时直接说明“该信息无法确认”，不要编造。\n4. 保持中立，不强加个人偏好；推荐要基于事实和用户需求，而不是个人喜好。\n5. 最后给出明确推荐及客观理由；如果信息不足以形成明确推荐，就说明当前信息有限，并给出倾向性建议或需要补充的信息。\n6. 如果存在争议，列出不同观点及来源类型。\n7. 结构：选项对比 → 关键维度分析 → 推荐及理由 → 信息缺口/补充建议。\n8. 不要广告式推荐，不要主观评价。`,

        translate: `请作为专业翻译与写作助手处理以上任务。\n1. 先判断任务类型：翻译、润色还是改写。如果无法确定，按最可能的一种处理，并简要说明你的判断。\n2. 如果是翻译：提供准确、自然、流畅的目标语言版本；默认中文↔英文互译，如果用户指定其他语言则按指定语言。\n3. 如果是润色或改写：贴合原文语境优化表达；未指定风格时，只优化流畅度和清晰度，保持原文语气和风格；如果用户明确指定风格，则按指定风格，不擅自改成正式/简洁/生动。\n4. 严格保留原意，不添加原文没有的信息，不省略原文信息。\n5. 专有名词、代码、公式、品牌名等，除非约定俗成或用户要求，否则保留不译或保留原文。\n6. 如果原文有歧义，尽量保留歧义；如果必须选择，简要说明。\n7. 先输出最终版本；如有必要，再用项目符号简要说明关键修改理由；简单翻译可省略理由。\n8. 不要添加多余解释、寒暄或主观评价。`
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
                    question: q.trim(),
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
            ['📚 笨喵解释', 'explain'],
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
