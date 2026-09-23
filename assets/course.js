(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const chapters = [
    {id:'cover',title:'封面',time:'正式开始前',lead:'只展示标题与讲者。',points:['点击开始后进入正文。'],fallback:'封面不进行讲解。'},
    {id:'start',title:'先看 AI 变魔术',time:'00–08 分钟',lead:'先制造一次直观惊喜，不先讲概念。',points:['快速切换四种成果：报告、定价、网页、交付。','让观众先选最想看的结果。','马上进入能亲手点击的演示。'],fallback:'使用本页四个成果预览。'},
    {id:'workflow',title:'一句话跑完整流程',time:'31–41 分钟',lead:'AI不是只回答，而是完成取数、产物、核验和交付。',points:['回放一次完整链路。','对照真实历史截图。','明确完成必须有产物和回读。'],fallback:'不连接生产系统。'},

    {id:'safety',title:'让 Agent 立即学会',time:'18–26 分钟',lead:'把跑通的任务沉淀成 Skill，让另一台 Agent 读取方法、配置工具并投入业务。',points:['新 Agent 起初是一张白纸。','Skill 分享的是做事方法和验收标准。','明确去哪里学习、去哪里配置 Tools / MCP / CLI。'],fallback:'直接讲页面中的可复制学习指令。'},
    {id:'library',title:'把 Agent 接进钉钉',time:'55–60 分钟',lead:'让任务在群里完成触发、执行、交付、定向提醒和回读核验。',points:['展示群内指令与真实定向 @。','讲清会议纪要生成待办并通知负责人的闭环。','截图点击放大，完整接入教程使用独立入口。'],fallback:'用三个真实钉钉案例讲清接入价值。'},
    {id:'end',title:'结束页',time:'结束',lead:'收束分享。',points:['感谢。'],fallback:'无。'}
  ];
  let current = '', toastTimer, flowTimer, flowStep = 0, flowCase = 'arrival', exhibitIndex = 0;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function notify(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => {$('toast').hidden=true;},3800); }
  window.CourseToast = notify;
  function showChapter(id, updateHash = true) {
    const target = chapters.find(ch => ch.id === id) || chapters[0];
    if (!document.querySelector(`[data-chapter="${target.id}"]`)) return;
    current = target.id;
    document.querySelectorAll('section.chapter').forEach(el => { el.hidden = el.dataset.chapter !== current; });
    document.querySelectorAll('.chapter-nav [data-go]').forEach(button => { if(button.dataset.go===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current'); });
    const index = chapters.indexOf(target);
    const liveIds = ['start','workflow','safety','library'];
    const liveIndex = liveIds.indexOf(target.id);
    $('chapter-counter').textContent = target.id === 'cover' ? '封面' : target.id === 'end' ? '结束' : `${String(liveIndex+1).padStart(2,'0')} / ${String(liveIds.length).padStart(2,'0')}`;
    $('chapter-current').textContent=target.title;
    $('course-progress').style.width = liveIndex < 0 ? (target.id === 'end' ? '100%' : '0%') : `${(liveIndex+1)/liveIds.length*100}%`;
    $('chapter-prev').disabled=index===0; $('chapter-next').disabled=false;
    $('chapter-prev').textContent='← 上一章';
    $('chapter-next').textContent=index===chapters.length-1?'返回封面 →':'下一章 →';
    document.title=`${target.title} · AI 业务实验课`;
    if(updateHash && location.hash!==`#${current}`) history.replaceState(null,'',`#${current}`);
    if(current!=='workflow')stopFlow();
    document.querySelectorAll('video').forEach(video=>{if(video.closest('.chapter')?.hidden)video.pause();});
    document.dispatchEvent(new CustomEvent('chapterchange',{detail:{chapter:current}}));
    window.scrollTo({top:0,behavior:'instant'});
    const activeNav=document.querySelector('.chapter-nav [aria-current="page"]');
    if(activeNav){const nav=activeNav.parentElement;nav.scrollTo({left:Math.max(0,activeNav.offsetLeft-nav.offsetLeft-20),behavior:'instant'});}
  }
  document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>{showChapter(button.dataset.go);$('chapter-menu').open&&$('chapter-menu').close();}));
  $('chapter-prev').addEventListener('click',()=>{const i=chapters.findIndex(ch=>ch.id===current);if(i>0)showChapter(chapters[i-1].id);});
  $('chapter-next').addEventListener('click',()=>{const i=chapters.findIndex(ch=>ch.id===current);showChapter(chapters[i+1]?.id || 'cover');});
  window.addEventListener('hashchange',()=>showChapter(location.hash.slice(1),false));
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,button,a,summary,[contenteditable="true"],[role="tablist"]'))return;
    if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();$('chapter-next').click();}
    if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();$('chapter-prev').click();}
  });
  function setProjection(on){document.body.classList.toggle('projector',on);$('focus-toggle').setAttribute('aria-pressed',String(on));$('focus-toggle').textContent=on?'退出投屏':'投屏模式';}
  setProjection(matchMedia('(min-width:1050px)').matches);
  $('focus-toggle').addEventListener('click',()=>setProjection(!document.body.classList.contains('projector')));
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('浏览器未允许全屏，可使用浏览器菜单或投屏模式。');}});
  $('notes-open').addEventListener('click',()=>{const ch=chapters.find(ch=>ch.id===current);$('notes-title').textContent=ch.title;$('notes-content').innerHTML=`<p class="note-time">${ch.time}</p><p>${ch.lead}</p><ol>${ch.points.map(point=>`<li>${point}</li>`).join('')}</ol><div class="note-fallback"><b>演示口径与兜底</b><br>${ch.fallback}</div>`;$('notes-dialog').showModal();});
  $('audience-open')?.addEventListener('click',()=>$('audience-dialog').showModal());
  $('chapter-menu-open').addEventListener('click',()=>$('chapter-menu').showModal());
  $('capability-library-open')?.addEventListener('click',()=>$('capability-catalog-dialog').showModal());
  $('agent-prompt-copy')?.addEventListener('click',async()=>{const button=$('agent-prompt-copy'),text=$('agent-prompt-text').textContent.trim();try{await navigator.clipboard.writeText(text);button.textContent='已复制 ✓';notify('学习指令已复制');setTimeout(()=>button.textContent='复制指令',1800);}catch{const range=document.createRange();range.selectNodeContents($('agent-prompt-text'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='请按 ⌘C';}});
  document.querySelectorAll('[data-file-view]').forEach(button=>button.addEventListener('click',()=>{window.open(encodeURI(button.dataset.fileView),'_blank','noopener,noreferrer');}));
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
  const guitar=`<svg viewBox="0 0 110 230" aria-label="教学吉他插画" role="img"><path d="M47 63L50 8Q57 0 64 9L64 65" fill="#8b5c38"/><rect x="50" y="40" width="13" height="110" rx="2" fill="#5c4630"/><path d="M51 89C27 70 18 100 28 121C37 144 9 146 15 178C21 215 86 222 97 184C108 151 81 144 85 120C90 92 73 75 62 92Z" fill="#cf9a58" stroke="#aa733e" stroke-width="2"/><path d="M52 90V154M55 90V154M58 90V154M61 90V154" stroke="#e2cba5" stroke-width=".6"/><circle cx="56" cy="148" r="13" fill="#3e3125"/><circle cx="56" cy="148" r="17" fill="none" stroke="#9b673c"/><rect x="39" y="179" width="35" height="7" rx="3" fill="#503b29"/><path d="M52 8V183M56 8V183M60 8V183" stroke="#fff5d8" stroke-width=".6" opacity=".7"/></svg>`;
  const exhibits=[
    {chapter:'data',label:'可操作 Demo · 拖入指标组件，自定义图表样式',html:`<div class="dashboard-build"><div class="dashboard-source"><small>每天输入</small><span>交易报告.csv</span><span>SKU 列表.xlsx</span><b>Agent 对齐店铺、站点与 SKU</b></div><div class="dashboard-canvas"><div class="dash-bar dash-brick"><strong>eBay 销售经营看板</strong><i>实时更新</i></div><div class="dash-kpis"><span class="dash-brick"><small>销售额</small><b>$12.4K</b></span><span class="dash-brick"><small>销量</small><b>101</b></span><span class="dash-brick"><small>订单</small><b>99</b></span></div><div class="dash-visuals"><div class="dash-donut dash-brick"><i></i><b>站点占比</b></div><div class="dash-treemap dash-brick"><i></i><i></i><i></i><i></i><b>品类树状图</b></div></div><div class="dash-ads dash-brick"><span>广告成本</span><i></i><b>趋势与异常</b></div></div><div class="dashboard-reuse"><small>同一逻辑可复用</small><span>GTM · 新品动销</span><span>计划 · 渠道积压</span><span>补货 · 决策触发</span></div></div>`},
    {url:'https://duohui.xl918727.workers.dev',label:'真实自建工具 · 一句话生成、编辑与批量处理图片',html:`<div class="duohui-preview"><div class="duohui-side"><b>哆绘</b><span>单图编辑</span><span>批量任务</span><span>创意生成</span></div><div class="duohui-chat"><small>你只要说想怎么改</small><p>保留产品结构，把背景换成明亮录音室，输出原图尺寸。</p><div class="duohui-progress"><i></i><span>正在生成第 1 / 1 张</span></div><div class="duohui-result"><img src="images/duohui-preview.png" alt="哆绘 AI 图像工作台真实界面"><b>完成图 · 点击查看原图</b></div></div><div class="duohui-tools"><span>上传图片 / 文件夹</span><span>参考图顺序提交</span><span>刷新后任务恢复</span><strong>把专业修图流程，变成一句话。</strong></div></div>`},
    {chapter:'create',label:'Donner VIVA 3D · 拖动旋转 / 滚轮缩放',html:`<div class="exhibit-kicker">STRINGLESS SMART GUITAR</div><span class="mini-file-tag">DONNER VIVA / 3D MODEL</span><div class="mini-page mini-page-3d"><div class="guitar3d mini-guitar3d" data-guitar-3d aria-label="可拖动旋转的 Donner VIVA 3D 模型"></div><div class="mini-product-copy"><small>FREE LIVE · FREE LIVES</small><h4>5 分钟，<br>开始第一首歌。</h4><p>无弦触控、LED 引导、Band Mode 与 7 种真实音色。</p><button type="button" class="mini-try-3d" data-try-3d>加速旋转体验 ↗</button></div></div><div class="mini-legend"><span>零基础快速开弹</span><span>可拆卸琴颈 · 最长 6 小时续航</span></div>`},
    {chapter:'workflow',label:'机制示意 · 真实证据在案例章节',html:`<div class="exhibit-kicker">MESSAGE → WORK → DELIVERY</div><div class="mini-chat">查一下这个 SKU 的到货计划，带上来源。</div><div class="flow-dots"><i></i><i></i><i></i></div><div class="mini-delivery"><b>✓ 一份能核对的业务答复</b><ul><li>对象与站点清楚</li><li>日期、数量有出处</li><li>缺数据时明确说明</li></ul></div><div class="mini-formula">一条指令 ≠ 一句“已经完成”</div>`}
  ];
  const exhibitActions=['打开经营看板','打开哆绘','打开网页工具'],exhibitNames=['经营决策看板','哆绘 AI 图像工作台','交互网页工坊'];
  function renderExhibit(index=0){exhibitIndex=index;const e=exhibits[index];$('exhibit-content').innerHTML=e.html;$('exhibit-label').textContent=e.label;$('exhibit-name').textContent=exhibitNames[index];$('exhibit-counter').textContent=`0${index+1} / 03`;$('exhibit-enter').innerHTML=`${exhibitActions[index]} <span>↗</span>`;document.querySelectorAll('[data-exhibit]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.exhibit)===index)));window.Guitar3D?.scan();}
  document.querySelectorAll('[data-exhibit]').forEach(button=>button.addEventListener('click',()=>renderExhibit(Number(button.dataset.exhibit))));
  $('exhibit-content').addEventListener('click',event=>{const button=event.target.closest('[data-try-3d]');if(!button)return;const host=$('exhibit-content').querySelector('[data-guitar-3d]');const active=window.Guitar3D?.boost(host);button.textContent=active?'恢复缓慢旋转 ↗':'加速旋转体验 ↗';});
  const toolOverlay=$('tool-overlay'),toolFrame=$('tool-overlay-frame'),toolTitle=$('tool-overlay-title');
  function openTool(){const e=exhibits[exhibitIndex];if(e.url){window.open(e.url,'_blank','noopener,noreferrer');return;}toolTitle.textContent=exhibitNames[exhibitIndex];toolFrame.src=`index.html?tool=${e.chapter}`;toolOverlay.hidden=false;document.body.classList.add('tool-overlay-open');}
  function closeTool(){toolOverlay.hidden=true;toolFrame.src='about:blank';document.body.classList.remove('tool-overlay-open');}
  $('exhibit-enter').addEventListener('click',openTool);$('tool-overlay-close').addEventListener('click',closeTool);
  window.addEventListener('message',event=>{if(event.source===toolFrame.contentWindow&&event.data?.type==='close-tool-overlay')closeTool();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!toolOverlay.hidden){event.stopImmediatePropagation();closeTool();}},true);
  const cases={
    arrival:{image:'images/prearrival-hermes.png',caption:'EC7390到货时间 · Hermes 机器人答复',title:'从问题，到带来源的回答',request:'“EC7390 接下来到货时间”',disclaimer:'截图聚焦 Hermes 机器人答复区域；历史日期不是当前承诺，来源表与查询时间仍需单独核对。',proof:'截图证明 Hermes 曾以机器人身份给出业务答复。数据新鲜度与完整查询过程仍需额外证据；右侧是机制说明。',steps:[['先锁定对象与范围','识别SKU、站点和查询意图；如请求未说明平台，应澄清或逐平台列出，不能混算。',['EC7390','到货时间','只读查询']],['读取并检查来源','按平台与站点查询DDS导出及库存表，核对数据时间、覆盖期和业务主键。',['来源日期','平台/站点','不回退旧数据']],['回答来自哪几行','按规则整理日期、数量和状态，保留对应明细。缺记录时明确说未查到。',['日期','数量','来源行']],['把验证依据一起交付','展示来源日期与明细；如需执行动作，必须另行确认权限与范围。',['来源','回读','待核实标记']]]},
    sku:{image:'images/sku-hermes.png',caption:'Hermes 机器人文件交付',title:'从两条需求，到文件和核验',request:'“澳洲 eBay EB7032 和德国 Otto EB2074。维护默认店铺和产品标签。”',disclaimer:'截图聚焦 Hermes 机器人发送文件和完成摘要的区域；生产写入不在本课现场执行。',proof:'截图证明机器人文件交付与完成摘要可见；目标系统字段是否一致仍要用回读证据核验。',steps:[['解析明确的维护意图','同时识别平台、站点、SKU和维护字段；只含SKU的到货查询不能路由到写入。',['eBay / AU / EB7032','Otto / DE / EB2074']],['先查已有记录','查询已有标签、映射和默认店铺，列出待执行清单与跳过项。范围不明确则停止。',['去重','映射表','动作清单']],['生成文件与执行记录','按固定模板输出维护文件；真实写入需相应权限与确认。这里展示历史产物，不发群。',['标签维护.xlsx','操作日志','逐项状态']],['回读目标系统再交付','逐字段核对平台、店铺、SKU和启用状态；群里只发送最终文件和汇总。',['业务回读','最终文件','精炼摘要']]]},
    finance:{image:'images/finance-after-agent.png',caption:'财务协同 · 从逐店下载到群里一句话',title:'从逐店登录，到一次导出九店报告',request:'“@机器人：导出 9 个 eBay 店铺指定月份的交易报告。”',disclaimer:'',proof:'',steps:[['锁定月份与九店范围','从群消息中识别指定月份、9 个 eBay 店铺与交易报告类型；范围不完整时先追问。',['指定月份','9 个 eBay 店铺','交易报告']],['通过紫鸟 CLI 批量执行','在已授权的九个店铺范围内依次发起导出，等待各店报告生成完成。',['紫鸟 CLI','九店批量导出','本机保存']],['汇总九店交付结果','核对每个店铺的文件、月份和导出状态；任一店失败都明确列出，不用部分结果冒充全部完成。',['9 / 9 店铺','月份一致','失败留痕']],['回传群聊并完成核验','机器人把九店报告或压缩包发送回原群，并回读文件名、月份与发送身份。',['群内交付','文件回读','财务直接使用']]]}
  };
  function stopFlow(){clearInterval(flowTimer);flowTimer=null;$('flow-play').textContent='回放机制';}
  let imageZoom=1;
  function fitDialogImage(){imageZoom=1;$('dialog-image').style.width='';$('dialog-image').style.height='';$('dialog-image').style.maxWidth='';$('dialog-image').style.maxHeight='';$('image-zoom-level').textContent='适应';}
  function openImage(src,caption,alt){fitDialogImage();$('dialog-image').src=src;$('dialog-image').alt=alt||caption||'图片';$('image-caption').textContent=caption||'';$('image-dialog').showModal();}
  function setImageZoom(next){imageZoom=Math.min(3,Math.max(.5,next));$('dialog-image').style.maxWidth='none';$('dialog-image').style.maxHeight='none';$('dialog-image').style.width=`${imageZoom*100}%`;$('dialog-image').style.height='auto';$('image-zoom-level').textContent=`${Math.round(imageZoom*100)}%`;}
  function showWorkflowEvidence(index=0){const c=cases[flowCase];const images=c.images||[c.image];openImage(images[Math.min(index,images.length-1)],c.caption,c.caption);}
  function renderFlow(){const c=cases[flowCase],s=c.steps[flowStep],dual=c.images?.length>1;$('workflow-image').src=c.image;$('workflow-image').alt=c.caption+'历史截图';$('workflow-secondary-shot').hidden=!dual;$('workflow-primary-label').hidden=!dual;if(dual)$('workflow-image-secondary').src=c.images[1];$('workflow-evidence-images').classList.toggle('is-comparison',Boolean(dual));$('workflow-caption').textContent=c.caption;$('workflow-title').textContent=c.title;$('workflow-request').textContent=c.request;$('workflow-disclaimer').textContent=c.disclaimer;$('workflow-disclaimer').hidden=!c.disclaimer;$('flow-proof-note').textContent=c.proof;$('flow-proof-note').hidden=!c.proof;$('flow-stage-index').textContent=`0${flowStep+1}`;$('flow-stage-title').textContent=s[0];$('flow-stage-body').textContent=s[1];$('flow-stage-artifact').innerHTML=s[2].map(t=>`<span class="flow-token">${esc(t)}</span>`).join('');document.querySelectorAll('[data-flow-step]').forEach(b=>{if(Number(b.dataset.flowStep)===flowStep)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$('flow-next').textContent=flowStep===3?'回到第一步 ↺':'下一步 →';}
  document.querySelectorAll('.workflow-lab [data-case]').forEach(b=>b.addEventListener('click',()=>{stopFlow();flowCase=b.dataset.case;flowStep=0;document.querySelectorAll('.workflow-lab [data-case]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderFlow();}));
  document.querySelectorAll('[data-flow-step]').forEach(b=>b.addEventListener('click',()=>{stopFlow();flowStep=Number(b.dataset.flowStep);renderFlow();}));
  $('flow-next').addEventListener('click',()=>{stopFlow();flowStep=(flowStep+1)%4;renderFlow();});
  $('flow-play').addEventListener('click',()=>{if(flowTimer){stopFlow();return;}flowStep=0;renderFlow();$('flow-play').textContent='暂停回放';flowTimer=setInterval(()=>{flowStep+=1;renderFlow();if(flowStep===3)stopFlow();},3800);});
  $('workflow-zoom').addEventListener('click',()=>{stopFlow();showWorkflowEvidence(0);});
  $('workflow-primary-shot').addEventListener('click',()=>showWorkflowEvidence(0));
  $('workflow-secondary-shot').addEventListener('click',()=>showWorkflowEvidence(1));
  document.querySelectorAll('[data-library-zoom]').forEach(button=>button.addEventListener('click',()=>openImage(button.dataset.libraryZoom,button.dataset.caption,button.dataset.caption||'图片放大查看')));
  $('image-zoom-in').addEventListener('click',()=>setImageZoom(imageZoom+.25));
  $('image-zoom-out').addEventListener('click',()=>setImageZoom(imageZoom-.25));
  $('image-zoom-fit').addEventListener('click',fitDialogImage);
  $('image-dialog').addEventListener('wheel',event=>{event.preventDefault();setImageZoom(imageZoom+(event.deltaY<0?.25:-.25));},{passive:false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlow();});
  const safetyState=$('safety-state');
  if(safetyState){
    let safetyChoice='read';
  const safety={read:['✓','授权范围内，可继续读取','查询仅限已授权的店铺与字段。输出同时显示来源、业务日期和行数。','没有读取权限时，绿色任务同样要停止。',''],write:['↔','先展示动作清单，再确认范围','待改对象：教学 SKU DEMO-A、DEMO-B。变更字段：标签。确认范围后才能进入写入与回读。','本演示的确认只改变本地状态。','<button class="solid-button" data-approve="write">确认这两项模拟变更</button>'],price:['Ⅱ','价格变更，停在人工审批','先看对象、原值、目标值和影响范围。尚未获得明确批准，不执行价格变更。','待审批：DEMO-A / US；模拟价格80 → 85。','<button class="solid-button" data-approve="price">批准这一项模拟变更</button><button class="outline-button" data-approve="reject">拒绝</button>'],denied:['×','超出权限，不能继续','当前身份没有该店铺的读取权限。先走相应授权流程；确认按钮不能赋予系统权限。','拦截原因：店铺不在当前授权范围。','']};
  function renderSafety(){const s=safety[safetyChoice];$('safety-state').innerHTML=`<div class="safety-big-icon ${safetyChoice!=='read'?'warn':''}">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p><div class="safety-detail">${s[3]}</div>`;$('safety-actions').innerHTML=s[4];document.querySelectorAll('[data-safety]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.safety===safetyChoice)));}
  document.querySelectorAll('[data-safety]').forEach(b=>b.addEventListener('click',()=>{safetyChoice=b.dataset.safety;renderSafety();}));
  $('safety-actions').addEventListener('click',event=>{const button=event.target.closest('[data-approve]');if(!button)return;const rejected=button.dataset.approve==='reject';$('safety-state').innerHTML=`<div class="safety-big-icon">${rejected?'×':'✓'}</div><h3>${rejected?'已拒绝，任务结束':'已确认模拟范围，下一步是回读'}</h3><p>${rejected?'模拟价格变更未执行。真实业务应保留审批记录与拒绝原因。':'授权与批准是执行条件，结果是否正确仍要靠重新读取目标字段来核对。'}</p><div class="safety-detail">这只是本地教学状态，未执行任何真实变更。</div>`;$('safety-actions').innerHTML='';});
  $('readback-fail').addEventListener('click',()=>{$('readback-result').className='readback-result error';$('readback-result').innerHTML='<b>× 核验未通过</b><span>预期：默认店铺 A</span><span>实际：默认店铺 B</span><strong>停止报告成功，检查执行日志与目标对象。</strong>';});
  $('readback-pass').addEventListener('click',()=>{$('readback-result').className='readback-result success';$('readback-result').innerHTML='<b>✓ 模拟回读一致</b><span>预期：默认店铺 A</span><span>实际：默认店铺 A</span><strong>此项字段通过核对。</strong>';});
  }

  // ponytail: one same-origin overlay, rather than duplicate navigation/fullscreen logic in every subpage.
  const viewer=document.getElementById('resource-viewer'), frame=document.getElementById('resource-frame');
  let savedChapter='start';
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href]');
    if(!a||viewer.hidden||!frame.contentWindow)return;
    // Overlay links are handled by the child document. Outside, only local supplementary pages open here.
  });
  document.body.addEventListener('click',event=>{
    const a=event.target.closest('a[href]');
    if(!a||!viewer.hidden||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin||!['showcase.html','learn.html','dingtalk.html'].includes(url.pathname.split('/').pop()))return;
    event.preventDefault(); savedChapter=current;frame.src=url.href;viewer.hidden=false;document.body.classList.add('resource-open');
  });
  document.getElementById('resource-close').addEventListener('click',()=>{viewer.hidden=true;frame.src='about:blank';document.body.classList.remove('resource-open');showChapter(savedChapter);});
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.data?.type!=='return-to-course')return;
    document.getElementById('resource-close').click();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!viewer.hidden)document.getElementById('resource-close').click();});
  const standaloneTool=new URLSearchParams(location.search).get('tool');
  if(['data','pricing','create'].includes(standaloneTool)){
    document.body.classList.add('standalone-tool');
    const bar=document.createElement('div');bar.className='standalone-toolbar';bar.innerHTML='<strong>AI 业务实验工具</strong><button type="button" aria-label="关闭工具页">关闭工具页 ×</button>';bar.querySelector('button').addEventListener('click',()=>{if(window.parent!==window)window.parent.postMessage({type:'close-tool-overlay'},'*');else window.close();});document.body.prepend(bar);
  }
  renderExhibit(0);renderFlow();
  if(standaloneTool){chapters.splice(2,0,{id:standaloneTool,title:{data:'一张表变报告',pricing:'一句话变工具',create:'资料变产品网页'}[standaloneTool],time:'独立工具页',lead:'独立工具。',points:[],fallback:''});showChapter(standaloneTool,false);}else showChapter(location.hash.slice(1)||'cover',false);
})();
