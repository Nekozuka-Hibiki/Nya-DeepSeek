// ==UserScript==
// @name         喵搜~DeepSeek
// @namespace    https://github.com/Nekozuka-Hibiki/Nya-DeepSeek
// @version      26.11.09
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
        search: `请以搜索引擎式答案回答以上问题。
1. 先直接给出核心答案，不要寒暄、不要复述问题，不要输出与答案无关的免责声明；能简洁就简洁，除非问题本身需要展开。
2. 【消歧】如果问题有歧义（一词多义、指代不明、可能对应多个对象），先按最可能的意图回答，并用一句话说明你按哪种理解回答；必要时简要列出其他常见含义。
3. 【先判断对象类型，再决定来源策略】
   - 有官网/官方页面/官方仓库的对象（公司、品牌、产品、软件、服务、机构、项目、人物等）：必须优先定位官方入口，并作为核心答案后的第一行、最显眼位置输出。
   - 没有官网的对象（自然物、概念、现象、通用知识、历史事件、常识问题等）：不要强行寻找或编造官网，先给出清晰准确的解释，再提供权威参考来源；如确实不存在官网，可直接说明“该对象无官网/无单一官网”。
4. 【来源层级与多入口】来源按以下优先级排列：官方网站/官方文档/官方仓库 > 官方公告/官方账号 > 权威机构/权威媒体/学术来源 > 其他可靠来源。同一对象若有多个官方入口（官网、文档站、代码仓库、下载/商店页、公告页等），尽量都提供，主官方入口在前、其余紧随其后；非官方来源（新闻、百科、博客、论坛、评测、聚合站等）只能作为补充，不能替代官网或排在官网前面。外文权威来源与中文同等对待，不因语言降级。
5. 【时效优先】优先给出最新可确认的信息，尤其是版本号、价格、政策、人事、状态等易变内容；涉及可能过时的信息时，注明“截至知识截止”或“建议自行核实最新情况”。
6. 【事实纪律】只陈述可确认的事实、数据、时间；无法确认时直接说“无法确认”，不要编造，不要用推测填补。
7. 【链接纪律】只给确实存在的链接，不要推测或拼凑 URL 路径；不能确认就不要给链接、文献或来源。若无法确认官网，直接写“无法确认官网链接”或说明“该对象无官网”，不要用非官方链接顶替。
8. 【争议处理】如有争议，列出主流观点并注明来源类型，不擅自站队。
9. 【联网说明】如果当前已开启联网搜索，请优先联网核实并尽量覆盖多来源，但多来源不能稀释官方来源的优先位置；如果没有联网，请明确说明“以下基于已有知识，可能不是最新”。
10. 【结构】
    - 有官网的对象：核心答案 → 官方入口链接（第一行，若可确认）→ 关键信息 → 补充链接（权威来源，可选）→ 进一步核实建议（可选）。
    - 无官网的对象：核心答案/解释 → 关键信息 → 权威参考来源（可选）→ 进一步核实建议（可选）。
11. 不要主观评价，不要广告式推荐，不要输出与问题无关的内容。`,

        explain: `请作为一位极度耐心、把用户当成完全小白的专业解释者，用最通俗易懂的方式解释以上问题。
1. 【总览先行】先用一两句话给出通俗总览：这东西是什么、大概是干嘛用的、解决什么问题，让用户先有个整体印象，再往下展开。
2. 【长度随问题复杂度】如果问题本身很简单，直接简短回答即可，不必强行套用下面的结构化要求；如果问题复杂，优先把主线讲清楚，不强行展开所有细节。
3. 【从零讲起】假设用户什么都不懂，从最基础的概念讲起，一步一步推进到核心原理；不要假设用户已经懂了某个前提，如果确实需要前置知识，先用一两句话简单补上。
4. 【类比适度】每出现一个新概念、专业术语或容易混淆的点，可以用生活中的类比、日常例子或形象比喻来解释，但类比要准确、点到为止，一个概念一个类比即可，不要为了类比而类比。
5. 【结构清晰】用编号步骤、项目符号或分层小标题组织回答，方便跟随；如果涉及复杂过程，用简单步骤拆解，每一步说明“这一步在干什么，为什么要这么做”。
6. 【收尾总结】最后用最白话的大白话总结核心要点，让用户看完觉得“哦，原来是这样！”。
7. 【客观与边界】保持客观，不加个人观点或调侃；所有解释基于公认事实和逻辑，禁止添加未确认的内容或虚构例子。如果某个部分无法用简单语言解释、或信息不足，直接说明，不要硬编。`,

        decision: `请帮助对比并辅助决策以上问题中的选项。
1. 【判断选项情况】
   - 用户已给出明确选项（如 A vs B、多个候选）：直接对比这些选项。
   - 用户没有给出明确选项、只描述需求（如“推荐个笔记本”）：先根据需求列出 2–4 个合适候选，简要说明入选理由，再对比；不要只给一个推荐却不对比。
   - 用户只问单个对象好坏（如“A 值得买吗”）：按单对象评估处理，围绕适用场景、优缺点、替代方案给出判断，不要硬凑对比。
2. 【对比呈现】选项 ≥3 个或多维度对比时优先用表格；选项少或维度少时用项目符号。清晰列出每个选项的主要优缺点。
3. 【对比维度】根据问题合理选择关键对比维度，例如价格、性能、适用场景、用户评价、长期影响等；如果某个维度不适用，可以不列。
4. 【权重与场景】如果用户没有说明偏好，按通用场景综合权衡；如果用户给出预算、用途、人群等条件，按这些条件调整维度权重。条件差异较大时，可按不同场景分别给出推荐（如“预算有限选 X，追求性能选 Y”）。
5. 【事实与精度】所有优缺点、数据、评价，尽量基于可确认的事实或来源类型；价格、参数、版本等易变数据标注“约/截至/需核实”，不要给出虚假精确值；无法确认时直接说明“该信息无法确认”，不要编造。
6. 【中立与推荐】保持中立，不强加个人偏好；推荐要基于事实和用户需求，而不是个人喜好。最后给出明确推荐及客观理由；如果信息不足以形成明确推荐，就说明当前信息有限，并给出倾向性建议或需要补充的信息。
7. 【争议】如果存在争议，列出不同观点及来源类型。
8. 【结构】选项情况判断（如需要）→ 选项对比 → 关键维度/场景分析 → 推荐及理由 → 信息缺口/补充建议。
9. 不要广告式推荐，不要主观评价。`,

        translate: `请作为专业翻译与写作助手处理以上任务。
1. 【任务判断】先判断任务类型：翻译、润色还是改写。如果无法确定，按最可能的一种处理，并简要说明你的判断。
2. 【翻译方向】如果是翻译：根据输入语言自动判断互译方向（默认中文↔英文，输入中文则译英文、输入英文则译中文）；用户指定其他语言或方向时按指定执行；如果方向确实无法判断，按最可能的方向处理并简要说明。
3. 【格式保留】保留原文格式：Markdown 标记、代码块与行内代码、列表层级、换行、占位符（如 {0}、%s、\${var}）、链接与图片语法等均原样保留；技术内容中的代码、命令、变量名、路径、配置项不译。
4. 【术语一致】同一术语、专有名词、品牌名在全文中译法保持一致；首次出现可按需保留原文或加注原文，后续统一使用同一译法。
5. 【专有名词】专有名词、代码、公式、品牌名等，除非约定俗成或用户要求，否则保留不译或保留原文。
6. 【润色/改写】如果是润色或改写：贴合原文语境优化表达；未指定风格时，只优化流畅度和清晰度，保持原文语气和风格；如果用户明确指定风格，则按指定风格，不擅自改成正式/简洁/生动。
7. 【原意与优先级】严格保留原意，不添加原文没有的信息，不省略原文信息；准确优先于流畅，流畅优先于文采，“自然流畅”与“严格保留原意”冲突时以准确和原意为先。
8. 【歧义处理】如果原文有歧义，尽量保留歧义；如果必须选择，简要说明。
9. 【输出与理由】先输出最终版本；如有必要，再用项目符号简要说明关键修改理由。以下情况视为“有必要”：改动较大、涉及风格取舍、处理了歧义、术语译法有特殊选择；简单翻译可省略理由。
10. 【源码呈现】如果原文本身是结构化的 Markdown 文档（包含标题、代码块、表格等），请将最终翻译结果完整包裹在四重反引号代码块中输出（如 \`\`\`\`markdown 开头，\`\`\`\` 结尾），以便在网页端直接查看或复制源码，防止被网页直接渲染；如果只是简单的纯文本，直接输出结果即可。
11. 不要添加多余解释、寒暄或主观评价。`
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

                try {
                    if (input.isContentEditable) {
                        input.innerText = fullText;
                    } else if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
                        const proto = input instanceof HTMLTextAreaElement
                            ? window.HTMLTextAreaElement.prototype
                            : window.HTMLInputElement.prototype;
                        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
                        if (setter) setter.call(input, fullText);
                        else input.value = fullText;
                    } else {
                        throw new Error('unsupported input element');
                    }
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.focus();
                } catch {
                    // 填充失败：不置 filled、不断开 observer，让后续 DOM 变化继续尝试
                    return;
                }

                filled = true;
                if (observer) observer.disconnect();

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
        // 幂等守卫：脚本生命周期内只注册一次，避免重复注册导致菜单项堆叠/行为异常
        if (!window.__NyaDeepSeekMenuRegistered) {
            window.__NyaDeepSeekMenuRegistered = true;

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
    }
})();
