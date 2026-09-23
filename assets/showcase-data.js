window.COURSE_SHOWCASE = {
  updated: '2026-09-18',
  items: [
    {
      id: 'duohui', title: '哆绘 · AI 视觉工作台', tag: '把自己的需求做成工具',
      summary: '一句“帮我处理图片”，可以长成同事每天都能打开的工作台。',
      input: '文字需求、单图、多图或文件夹', output: '统一任务、素材预览与图片处理流程',
      verified: '实测文字输入、新建任务、单图/多图/文件夹本地预览、数字人模式和空白模型设置。',
      limit: '本次未调用模型；生成、编辑和导出未实跑。默认人物是页面装饰，待处理卡片是教学素材。',
      frames: [
        {src:'images/showcase/duohui-home.png',label:'真实工作台',caption:'真实初始界面。先看任务、预览与统一输入栏如何组织在一起。'},
        {src:'images/showcase/duohui-ready.png',label:'素材进入任务',caption:'本地选入两张新制教学卡片，状态是“待处理”，没有执行生图。'},
        {src:'images/showcase/duohui-input.png',label:'放大输入过程',caption:'投屏重点：文字要求 + 两张参考素材，输入过程已经实际验证。'},
        {src:'images/showcase/duohui-settings.png',label:'连接自己的模型',caption:'空白设置界面，无 API Key。保存配置不代表连接、模型能力或额度已经验证。'}
      ],
      steps: [
        {title:'从自己的重复工作出发',body:'“我经常要为同一款产品做主图、场景图，还要一次处理多张参考图。”先说清工作，而不是先列技术名词。'},
        {title:'把输入做成可见的流程',body:'新建任务 → 输入图片要求 → 选入两张教学素材。指给观众看：文字、缩略图和待处理状态在同一个地方。'},
        {title:'把一次操作做成可重复使用的工具',body:'再看文件夹入口和模型设置。核心变化是：以后打开网页就能继续工作，不必每次重新解释流程。'}
      ],
      liveUrl:'https://duohui.xl918727.workers.dev/',liveLabel:'打开哆绘 · 需联网',
      practiceUrl:'downloads/哆绘输入练习包.zip',practiceLabel:'下载哆绘输入练习包',
      prompt:'请把下面的图片工作流做成一个可在浏览器打开的工具。\n输入：文字需求、单图、多图和文件夹。\n页面：左侧任务列表，中间大预览，底部输入区；区分待处理、执行中、成功、失败。\n先用明确标注的教学素材做可交互原型，不连接真实模型、不把装饰图当生成结果。\n模型服务配置独立放置，密钥不能出现在页面文案、日志、截图或导出文件中。\n先验收：选1张/2张/文件夹时缩略图数量正确；切任务保留输入；错误有可读提示；没有结果时不能导出。\n真实生成与导出另行接入，并分别提供可复核的验证结果。\n请先给我能打开的HTML和具体操作教程，再解释实现。'
    },
    {
      id:'sales',title:'eBay 经营看板',tag:'多张业务表，放到同一个视角',
      summary:'销售、广告、退款和 SKU，不必在不同表里来回找。',
      input:'交易、广告、退款等报表',output:'按时间与站点查看经营指标',
      verified:'已登录，查看销售总览、时间/账号筛选入口以及各业务分析页签。',
      limit:'展示图保留真实页面布局，汇总、图表、店铺均已替换为教学样例；没有确认原系统数据已更新。',
      frames:[{src:'images/showcase/sales.png',label:'总览与站点结构',caption:'演示数据替换：US 2,460 + UK 520 = 2,980。不是实际销售额；同一份教学表也用于课堂练习。'}],
      steps:[
        {title:'先统一时间和范围',body:'指向时间与账号选择：不同周期、不同店铺不能直接放在一起比较。'},
        {title:'从总额下钻到组成',body:'先看总览，再看站点占比与明细。漂亮的数字要能回答“由哪些记录组成”。'},
        {title:'把一张总览连成多个业务视角',body:'沿上方页签看销售、广告、预估毛利、退货与 SKU 的分工，然后回课堂实验亲手完成一次合表。'}
      ],practiceUrl:'index.html#data',practiceLabel:'亲手做一次两表合并'
    },
    {
      id:'august',title:'eBay 8 月经营月报',tag:'从报表，走到经营复盘',
      summary:'月报不只是一段结论，还可以按销售、广告、库存逐层展开。',
      input:'当月销售、广告、库存与财务材料',output:'分主题组织的月度复盘页面',
      verified:'已登录，查看月报总览与销售、广告、库存、毛利、新品五类分析入口。',
      limit:'本帧经营金额、比例与结论均已遮蔽，仅展示页面结构；未逐项复测月报内所有展开交互。',
      frames:[{src:'images/showcase/august.png',label:'主题化月度复盘',caption:'真实月报页面，经营数值及业绩判断已移除。将五类分析放在一份可浏览的复盘里。'}],
      steps:[
        {title:'用五个问题组织月报',body:'卖得怎样？广告花得怎样？库存卡在哪里？利润怎样？新品进展怎样？每一块都对应一种决策。'},
        {title:'给结论留下追溯路径',body:'展示主题入口与指标层级，解释为什么需要继续查看站点、品类和原始记录。'},
        {title:'先讲口径，再讲建议',body:'截止日期、汇率、成本口径和缺失数据需要说明。没有这些信息，月报文字再流畅也难以验收。'}
      ],practiceUrl:'index.html#practice',practiceLabel:'用教学数据完成一份报告'
    },
    {
      id:'finance',title:'财报与 SKU 分析',tag:'把财务问题拆到商品层',
      summary:'既能看站点利润，也能继续找到需要检查的 SKU。',
      input:'按月、站点、SKU 整理的财务数据',output:'毛利对比、SKU 分层、财报速查',
      verified:'已查看财报界面，并实际切换到 SKU 波士顿矩阵区域。页面当前标题为 8 月财报。',
      limit:'全部财务数值已遮蔽；本次未复核毛利计算与各象限建议，不把分层标签当作经营指令。',
      frames:[{src:'images/showcase/finance.png',label:'从站点到 SKU',caption:'保留原有财务字段和页面布局，金额、比例、环比与进度均已遮蔽或中性化。'}],
      steps:[
        {title:'先看每个指标到底算什么',body:'“毛利率”必须带上费用范围；上月和本月使用相同口径，比较才有意义。'},
        {title:'把总指标拆到具体对象',body:'指向 SKU 矩阵和财报速查入口：从一个整体结果，走到可以检查的商品和站点。'},
        {title:'从分析到动作，还差一步核验',body:'分层结果帮助发现问题；调价、补货或精简 SKU 仍需核对成本、销量与业务约束。'}
      ],practiceUrl:'index.html#safety',practiceLabel:'看一次结果回读与核验'
    },
    {
      id:'plp',title:'PLP 广告工作台',tag:'从资料，到待审核的候选',
      summary:'关键词、搜索词和商品表现，可以进入同一套分析与审核流程。',
      input:'三类 PLP 报表，或新品资料',output:'关键词候选、证据来源与人工审核项',
      verified:'实测五个页面导航；用 DEMO 商品在阻断网络后生成候选词、证据与置信度，生成期间网络请求为 0。',
      limit:'本次未接广告账号。原新品导出会包含 pending 项，且个别建议 Bid 与说明上限不一致；候选不能直接当作执行方案。',
      frames:[
        {src:'images/showcase/plp-import.png',label:'真实导入入口',caption:'空白工作台：关键词、搜索词、Listing 三类报表分别进入对应分析。没有导入真实广告资料。'},
        {src:'images/showcase/plp-candidates.png',label:'教学候选与证据',caption:'真实工具使用 DEMO 商品生成的本地候选。查看词、来源和置信度；没有投放或修改广告。'}
      ],
      steps:[
        {title:'把任务拆成三个输入',body:'关键词报表看已投放词，搜索词报表看实际搜索，Listing 报表补充商品表现。先知道每张表回答什么。'},
        {title:'让 AI 给候选，也给依据',body:'展示 DEMO 商品生成的词表，指出匹配类型、来源与置信度。让观众看到“建议从哪里来”。'},
        {title:'审核的是每一条动作',body:'先审词义、相关性、预算和出价范围，再决定是否执行。本例导出仍含待审项，课堂停在候选与核验。'}
      ],practiceUrl:'index.html#safety',practiceLabel:'体验动作授权与回读'
    },
    {
      id:'pricing',title:'eBay 定价计算器',tag:'全场都能动手的闭环',
      summary:'改一个参数，马上看到售价，再反过来验证利润。',
      input:'教学成本、费率与目标利润率',output:'售价、费用拆解与反算利润',
      verified:'真实版已登录查看成本与费用字段；课堂模拟版已测试正算、反算、异常阻断和挑战参数重置。',
      limit:'课堂用独立简化模型，不含真实成本；真实版的采购、头程、尾程及费用基数需要另行核对。',
      frames:[{src:'images/showcase/pricing.png',label:'可操作课堂版本',caption:'点击“打开定价实验”亲手试：80 /（1 − 12% − 20%）≈ 117.65；提高成本后再反查。'}],
      steps:[
        {title:'请观众先猜结果',body:'成本不变，把目标利润率提高，售价会往哪个方向变？先让业务经验参与。'},
        {title:'当场改一个数字',body:'使用模拟数据滑块调整成本、费率、目标利润率，指着费用拆解说明结果为什么变化。'},
        {title:'用反算结束演示',body:'把售价重新输入右侧，核对利润。再试卖 50 元或输入不合法条件，看看工具怎样回应。'}
      ],practiceUrl:'index.html#pricing',practiceLabel:'打开定价实验 · 可直接操作'
    },
    {
      id:'forecast',title:'预测准确率看板',tag:'看见偏差，从哪里产生',
      summary:'一个平均准确率之外，还要知道哪些预测偏高、哪些偏低。',
      input:'预测明细、实际结果与权重口径',output:'月份对比、偏差诊断与 SKU 检索',
      verified:'本机实测月份、站点、SKU 搜索与排序；截图保留原布局，全部数据替换为虚构样例。',
      limit:'原页面明细百分比显示及“全部月份”诊断有待修问题；本展示只选单月顶部诊断，不用于讲解明细公式。',
      frames:[{src:'images/showcase/forecast.png',label:'单月偏差诊断',caption:'原页面布局，全新虚构数据。观察高估与低估的结构；数字不反映实际预测表现。'}],
      steps:[
        {title:'先选择一个月份',body:'一次看清一个时间范围，避免把不同月份的实际结果混在一起。'},
        {title:'区分“偏高”和“偏低”',body:'同样的准确率下降，背后的业务动作可能不同。把总指标拆成偏差方向。'},
        {title:'再找需要复核的对象',body:'月份、站点、产品线和 SKU 过滤用于缩小范围。结论应回到预测值与实际值核验。'}
      ],practiceUrl:'index.html#data',practiceLabel:'回到数据来源与异常实验'
    },
    {
      id:'returns',title:'紫鸟 CLI · 退货与买家反馈看板',tag:'后台不能导表，也能把证据带回来',
      summary:'eBay 店铺后台没有可用导表时，用紫鸟 CLI 进入指定店铺，逐笔读取退货、留言和买家图片，再整理成跨店看板。',
      input:'指定店铺、退货列表、订单明细、买家留言与图片',output:'跨店退货结构、SKU 热力图、逐笔证据与 VOC 看板',
      verified:'真实看板已实测国家/店铺筛选、图表联动、逐笔详情、买家图片、评价搜索与 VOC 来源过滤。',
      limit:'本案例按用户要求保留真实业务截图，不作脱敏。退货案例占比不是销售退货率；客户描述和主题归类也不等于已确认根因。',
      frames:[
        {src:'images/showcase/returns-live-heatmap.png?v=2',label:'真实跨店退货看板',caption:'从店铺、国家、原因和 SKU 交叉查看退货结构。后台没有现成导表，数据来自紫鸟 CLI 只读采集与逐笔核对。'},
        {src:'images/showcase/returns-live-feedback.png?v=2',label:'真实留言与图片证据',caption:'点进具体退货记录，保留原始买家留言、退货原因和图片证据，再回到看板分析。'},
        {src:'images/showcase/returns-live-buyer-image.png',label:'真实逐笔反馈案例',caption:'图片不是装饰素材，而是与具体退货记录关联的买家上传证据，可用于复核 VOC 主题。'}
      ],
      steps:[
        {title:'紫鸟 CLI 进入指定店铺',body:'店铺后台无法直接导出所需字段时，限定店铺与页面，只读打开退货列表和详情。'},
        {title:'逐笔采集可追溯证据',body:'读取退货日期、订单、SKU、原因、留言和买家图片；翻页并核对列表总数，缺失字段明确标记。'},
        {title:'把分散记录做成看板',body:'按店铺、Ship to 国家、原因与 SKU 汇总，同时保留逐笔详情、订单搜索和原始图片入口。'},
        {title:'回到原文再判断',body:'图表负责发现异常，留言和图片负责复核。看板不把客户描述自动包装成产品根因。'}
      ],practiceUrl:'index.html#workflow',practiceLabel:'查看 Agent 的执行与回查机制'
    }
  ]
};
