(function () {
  'use strict';
  const pricingSection = document.querySelector('.pricing-lab');
  const createSection = document.querySelector('.create-lab');
  if (!pricingSection || !createSection) return;
  const byId = (id) => document.getElementById(id);
  const decimal = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });
  const amount = (value) => (value < 0 ? '−¥' : '¥') + decimal.format(Math.abs(value));
  const read = (id) => {
    const value = byId(id).value.trim();
    return value === '' ? NaN : Number(value);
  };
  const markInvalid = (id, invalid) => byId(id).setAttribute('aria-invalid', String(invalid));
  let currentForward = null;

  function updatePricing() {
    const cost = read('price-cost');
    const feePercent = read('price-fee');
    const marginPercent = read('price-margin');
    const costValid = Number.isFinite(cost) && cost >= 0.01 && cost <= 999999;
    const feeValid = Number.isFinite(feePercent) && feePercent >= 0 && feePercent < 100;
    const marginValid = Number.isFinite(marginPercent) && marginPercent >= 0 && marginPercent < 100;
    const combinedValid = feeValid && marginValid && feePercent + marginPercent < 100;
    markInvalid('price-cost', !costValid);
    markInvalid('price-fee', !feeValid || (marginValid && !combinedValid));
    markInvalid('price-margin', !marginValid || (feeValid && !combinedValid));
    let error = '';
    if (!costValid) error = '请输入 0.01 至 999999 的单位成本。';
    else if (!feeValid) error = '请输入 0 至小于 100 的平台费率。';
    else if (!marginValid) error = '请输入 0 至小于 100 的目标利润率。';
    else if (!combinedValid) error = '费率与目标利润率合计必须小于 100%。';
    const fee = feePercent / 100;
    const margin = marginPercent / 100;
    const forward = costValid && combinedValid ? cost / (1 - fee - margin) : NaN;
    if (!error && !Number.isFinite(forward)) error = '当前数值无法计算，请调整输入。';
    byId('price-error').textContent = error;
    currentForward = error ? null : forward;
    byId('price-use-forward').disabled = currentForward === null;
    if (currentForward !== null) {
      byId('price-forward-value').textContent = decimal.format(forward);
      byId('price-cost-display').textContent = amount(cost);
      byId('price-fee-display').textContent = amount(forward * fee);
      byId('price-profit-display').textContent = amount(forward * margin);
      byId('price-forward-caption').textContent = '每笔收入，由这三部分组成';
      byId('price-bar-cost').style.width = ((1 - fee - margin) * 100) + '%';
      byId('price-bar-fee').style.width = feePercent + '%';
      byId('price-bar-profit').style.width = marginPercent + '%';
      byId('price-stack').setAttribute('aria-label', '成本 ' + decimal.format((1 - fee - margin) * 100) + '%，平台费 ' + feePercent + '%，利润 ' + marginPercent + '%');
    } else {
      ['price-forward-value', 'price-cost-display', 'price-fee-display', 'price-profit-display'].forEach((id) => { byId(id).textContent = '—'; });
      ['price-bar-cost', 'price-bar-fee', 'price-bar-profit'].forEach((id) => { byId(id).style.width = '0%'; });
      byId('price-forward-caption').textContent = '修正左侧输入后，结果会在这里更新。';
      byId('price-stack').setAttribute('aria-label', '输入无效，暂不展示组成图');
    }
    const sale = read('price-sale');
    const saleValid = Number.isFinite(sale) && sale >= 0.01 && sale <= 9999999;
    markInvalid('price-sale', !saleValid);
    const reverseError = !saleValid ? '请输入 0.01 至 9999999 的售价。' : !costValid || !feeValid ? '请先修正左侧成本和平台费率。' : '';
    byId('price-reverse-error').textContent = reverseError;
    const verdict = byId('price-reverse-verdict');
    verdict.classList.remove('is-loss', 'is-below');
    if (reverseError) {
      byId('price-reverse-profit').textContent = '—';
      byId('price-reverse-margin').textContent = '—';
      verdict.textContent = '等待有效输入';
      return;
    }
    const profit = sale * (1 - fee) - cost;
    const actualMargin = profit / sale * 100;
    byId('price-reverse-profit').textContent = amount(profit);
    byId('price-reverse-margin').textContent = decimal.format(actualMargin) + '%';
    if (profit < 0) {
      verdict.textContent = '当前售价亏损，每卖一件亏 ' + decimal.format(-profit) + ' 元';
      verdict.classList.add('is-loss');
    } else if (!marginValid || !combinedValid) {
      verdict.textContent = '核算完成；请修正左侧目标后再作比较。';
    } else if (Math.abs(actualMargin - marginPercent) < 0.005) {
      verdict.textContent = '基本达到目标（含售价取整误差）';
    } else if (actualMargin < marginPercent) {
      verdict.textContent = '低于目标 ' + decimal.format(marginPercent - actualMargin) + ' 个百分点';
      verdict.classList.add('is-below');
    } else {
      verdict.textContent = '超过目标 ' + decimal.format(actualMargin - marginPercent) + ' 个百分点';
    }
  }

  function clearPreset() {
    pricingSection.querySelectorAll('[data-price-preset]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
  }
  ['cost', 'fee', 'margin'].forEach((name) => {
    const input = byId('price-' + name);
    const slider = byId('price-' + name + '-slider');
    input.addEventListener('input', () => {
      const value = read(input.id);
      if (Number.isFinite(value)) slider.value = String(Math.min(Number(slider.max), Math.max(Number(slider.min), value)));
      clearPreset();
      updatePricing();
    });
    slider.addEventListener('input', () => {
      input.value = slider.value;
      clearPreset();
      updatePricing();
    });
  });
  byId('price-sale').addEventListener('input', updatePricing);
  byId('price-form').addEventListener('submit', (event) => event.preventDefault());
  const presets = { standard: [80, 12, 20], premium: [160, 15, 25], promotion: [60, 12, 10] };
  pricingSection.querySelectorAll('[data-price-preset]').forEach((button) => button.addEventListener('click', () => {
    const preset = presets[button.dataset.pricePreset];
    ['cost', 'fee', 'margin'].forEach((name, index) => {
      byId('price-' + name).value = String(preset[index]);
      byId('price-' + name + '-slider').value = String(preset[index]);
    });
    clearPreset();
    button.setAttribute('aria-pressed', 'true');
    updatePricing();
  }));
  byId('price-challenge-button').addEventListener('click', () => {
    const challenge = { cost: 100, fee: 12, margin: 20 };
    Object.keys(challenge).forEach((name) => {
      byId('price-' + name).value = String(challenge[name]);
      byId('price-' + name + '-slider').value = String(challenge[name]);
    });
    byId('price-sale').value = (challenge.cost / (1 - challenge.fee / 100 - challenge.margin / 100)).toFixed(2);
    clearPreset();
    updatePricing();
  });
  byId('price-use-forward').addEventListener('click', () => {
    if (currentForward !== null && currentForward <= 9999999) {
      byId('price-sale').value = currentForward.toFixed(2);
      updatePricing();
    } else {
      byId('price-reverse-error').textContent = '正算售价超出此教学工具的反算范围，请调整参数。';
    }
  });
  byId('price-loss-example').addEventListener('click', () => {
    byId('price-sale').value = '50';
    updatePricing();
  });

  async function copyText(text, status, button) {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (_) { /* Local-file clipboard access may need the selectable fallback below. */ }
    if (!copied) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('aria-label', '可复制的完整练习指令');
      area.style.cssText = 'width:100%;min-height:160px;font:inherit;font-size:13px;line-height:1.8;margin:8px 0;padding:12px;box-sizing:border-box';
      button.parentElement.appendChild(area);
      area.select();
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      if (copied) area.remove();
      else { status.textContent = '请在下方文本框中全选复制'; return; }
    }
    status.textContent = '已复制，可粘贴到你的 Agent';
  }
  const pricingPrompt = '请帮我完成一个定价工具练习，全部使用模拟数据。\n业务口径：单位成本 80 元，平台费率为售价的 12%，目标利润率为利润 ÷ 售价，目标值 20%。暂不计税费、汇率、仓配和其他费用。\n第一步：先给出正算和反算公式、代入过程及答案，等待我核对。正算：售价 = 成本 ÷（1 − 费率 − 目标利润率）；反算：利润 = 售价 ×（1 − 费率）− 成本。\n第二步：生成可离线打开的单文件 HTML，包含可编辑参数、动态结果、金额组成图和独立的反算售价输入框，兼容手机。\n验收：默认售价约 117.65 元；成本改 100 元后约 147.06 元；成本 80、费率 12%、售价 50 时亏损 36 元。空成本、零或负成本、非有限值及费率+目标利润率≥100% 时明确报错，不展示 NaN 或 Infinity。反算允许正常展示亏损。说明售价保留两位小数产生的微小误差。\n页面明确标注“简化教学测算，不可直接用于实际报价”。不要接入或修改生产数据。';
  byId('price-copy-prompt').addEventListener('click', (event) => copyText(pricingPrompt, byId('price-copy-status'), event.currentTarget));
  updatePricing();

  const product = byId('create-product-page');
  const source = byId('create-source');
  source.maxLength = 2000;
  const titleInput = byId('create-title');
  const generateButton = byId('create-generate');
  let generationTimers = [];
  let generationInProgress = false;
  let outputName = 'STUDIO 01';
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const status = byId('create-status');

  function setProgress(activeStep, complete) {
    createSection.querySelectorAll('#create-progress li').forEach((step) => {
      const number = Number(step.dataset.step);
      step.classList.toggle('is-done', complete || number < activeStep);
      step.classList.toggle('is-active', !complete && number === activeStep);
    });
  }
  function cancelGeneration() {
    generationTimers.forEach((timer) => window.clearTimeout(timer));
    generationTimers = [];
    if (generationInProgress) {
      generationInProgress = false;
      generateButton.disabled = false;
      generateButton.innerHTML = '重新生成 <span>↗</span>';
      setProgress(0, false);
      status.textContent = '演示已暂停。返回后可点击重新生成。';
    }
  }
  function parseSource() {
    const values = {};
    source.value.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*(标题|简介|规格)\s*[：:]\s*(.+?)\s*$/);
      if (match) values[match[1]] = match[2];
    });
    if (!values['标题'] || !values['简介'] || !values['规格']) return { error: '请保留“标题：”“简介：”“规格：”三行，并填写内容。' };
    if (values['标题'].length > 60) return { error: '标题请控制在 60 个字符内，再试一次。' };
    if (values['简介'].length > 160 || values['规格'].length > 200) return { error: '为保持页面易读，简介限 160 字，规格限 200 字。' };
    return { values };
  }
  function renderSource(values) {
    titleInput.value = values['标题'];
    byId('create-product-title').textContent = values['标题'];
    byId('create-product-intro').textContent = values['简介'];
    byId('create-product-spec-copy').textContent = values['规格'];
    outputName = values['标题'];
  }
  generateButton.addEventListener('click', () => {
    cancelGeneration();
    const parsed = parseSource();
    source.setAttribute('aria-invalid', String(Boolean(parsed.error)));
    if (parsed.error) { status.textContent = parsed.error; source.closest('details').open = true; source.focus(); return; }
    generationInProgress = true;
    generateButton.disabled = true;
    generateButton.textContent = '正在组织页面…';
    setProgress(1, false);
    status.textContent = '读取输入的三项产品资料…';
    const finish = () => {
      renderSource(parsed.values);
      setProgress(3, true);
      status.textContent = '已将这份资料应用到模板。试试改标题、换配色，或下载成品。';
      generateButton.disabled = false;
      generateButton.innerHTML = '重新生成 <span>↗</span>';
      generationInProgress = false;
      generationTimers = [];
    };
    if (reducedMotion()) { finish(); return; }
    generationTimers.push(window.setTimeout(() => { setProgress(2, false); status.textContent = '应用当前配色与布局…'; }, 360));
    generationTimers.push(window.setTimeout(() => { setProgress(3, false); status.textContent = '准备规格展开与离线下载…'; }, 760));
    generationTimers.push(window.setTimeout(finish, 1180));
  });
  titleInput.addEventListener('input', () => {
    const value = titleInput.value.trim();
    byId('create-product-title').textContent = value || '在左侧写下你的标题';
    outputName = value || 'STUDIO 01';
  });
  createSection.querySelectorAll('[data-create-theme]').forEach((button) => button.addEventListener('click', () => {
    product.dataset.theme = button.dataset.createTheme;
    createSection.querySelectorAll('[data-create-theme]').forEach((themeButton) => themeButton.setAttribute('aria-pressed', String(themeButton === button)));
  }));
  byId('create-layout').addEventListener('change', (event) => { product.dataset.layout = event.target.value; });
  function setViewport(mobile) {
    byId('create-preview-canvas').classList.toggle('is-mobile', mobile);
    byId('create-mobile').setAttribute('aria-pressed', String(mobile));
    byId('create-desktop').setAttribute('aria-pressed', String(!mobile));
  }
  byId('create-mobile').addEventListener('click', () => setViewport(true));
  byId('create-desktop').addEventListener('click', () => setViewport(false));
  byId('create-explore').addEventListener('click', () => {
    const details = byId('create-product-details');
    details.open = true;
    details.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  });
  const createPrompt = '请根据以下产品资料制作一个可离线打开的单文件 HTML 产品展示页：\n' + source.value + '\n这是教学商品。采用奶油白与森林绿、杂志式排版，支持手机浏览。主图使用我提供的素材；没有素材时明确使用教学插画，不补造认证、销量、用户评价或商品事实。\n实现规格展开交互。网页应可直接打开，不依赖后端服务。用清晰的 HTML、CSS、JavaScript 组织代码，保证标题、配色和布局容易修改。\n验收：在桌面和 390px 手机尺寸逐个点击所有按钮，检查文字可读性、键盘焦点、窄屏溢出和减少动态效果设置；导出的 HTML 仍可独立打开，所有可点击控件都有实际作用。输出完整 HTML。';
  byId('create-copy-prompt').addEventListener('click', (event) => copyText(createPrompt.replace(source.defaultValue, () => source.value), byId('create-copy-status'), event.currentTarget));

  const exportStyles = `
*{box-sizing:border-box}body{margin:0;padding:35px 18px;background:#e8ece3;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}button,summary{cursor:pointer;font:inherit}button:focus-visible,summary:focus-visible{outline:3px solid #2558ed;outline-offset:4px}.create-product-page{--paper:#f4efdf;--ink:#234c37;--soft:#dfe5ce;--line:#bdc6ae;--muted:#6b795c;max-width:980px;margin:auto;background:var(--paper);color:var(--ink);box-shadow:0 16px 70px #16311b16}.create-product-page[data-theme=blue]{--paper:#f4f6ff;--ink:#214bcc;--soft:#e2e8ff;--line:#bcc9f3;--muted:#6376a8}.create-product-brand{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:26px 38px;border-bottom:1px solid var(--line)}.create-product-brand>span:first-child{font-size:25px;font-weight:850;letter-spacing:-1px}.create-brand-mark{margin:0 8px;font-weight:400}.create-product-brand>span:last-child{font-size:9px;letter-spacing:2px}.create-product-hero{display:grid;grid-template-columns:1fr 1.05fr;min-height:560px}.create-product-copy{display:flex;flex-direction:column;align-items:flex-start;padding:52px 0 36px 38px}.create-product-tag{font-size:10px;letter-spacing:1.4px}.create-product-copy h2{font-size:52px;font-weight:850;line-height:1.25;letter-spacing:-2px;max-width:440px;overflow-wrap:anywhere;margin:38px 0 25px}.create-product-copy>p{font-size:15px;line-height:1.9;color:var(--muted);max-width:350px;overflow-wrap:anywhere;margin:0 0 32px}.create-product-copy>button{display:flex;justify-content:space-between;gap:40px;border:0;background:var(--ink);color:var(--paper);padding:17px 20px;font-size:13px}.create-product-small{font-size:9px;letter-spacing:1.5px;color:var(--muted);margin-top:auto;padding-top:40px}.create-product-art{position:relative;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 50%,var(--soft),transparent 69%)}.create-product-art svg{width:100%;height:545px;max-width:440px;position:relative;z-index:1}.create-art-word{position:absolute;top:40px;left:0;font-size:118px;font-weight:900;letter-spacing:-7px;opacity:.08;line-height:1;max-width:100%;overflow:hidden}.create-art-caption{position:absolute;bottom:24px;right:30px;font-size:9px;letter-spacing:2px;color:var(--muted)}.create-product-specs{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:25px 0;margin:0 38px}.create-product-specs>div{display:flex;flex-direction:column;gap:10px}.create-product-specs strong{font-size:30px;letter-spacing:-1px}.create-product-specs>div>span{font-size:11px;color:var(--muted)}details{margin:0 38px;border-bottom:1px solid var(--line)}summary{display:flex;justify-content:space-between;padding:23px 0;list-style:none;font-size:14px;font-weight:650}summary::-webkit-details-marker{display:none}details[open] summary>span{transform:rotate(45deg)}details>div{font-size:13px;line-height:1.9;color:var(--muted);padding:0 0 20px;overflow-wrap:anywhere}details p{margin:0 0 10px}.create-product-footer{display:flex;justify-content:space-between;gap:20px;padding:24px 38px;font-size:9px;letter-spacing:1px;color:var(--muted)}.create-product-page[data-layout=gallery] .create-product-hero{grid-template-columns:1fr}.create-product-page[data-layout=gallery] .create-product-copy{padding:40px 35px 0;text-align:center;align-items:center}.create-product-page[data-layout=gallery] .create-product-copy h2{max-width:760px;margin:20px 0}.create-product-page[data-layout=gallery] .create-product-copy>p{max-width:620px}.create-product-page[data-layout=gallery] .create-product-small{display:none}.create-product-page[data-layout=gallery] .create-product-art svg{height:420px}.create-product-page[data-layout=gallery] .create-art-word{left:50%;transform:translateX(-50%);font-size:170px;top:80px}@media(max-width:650px){body{padding:12px}.create-product-brand{padding:22px}.create-product-brand>span:first-child{font-size:20px}.create-product-brand>span:last-child{font-size:6px;letter-spacing:1px}.create-product-hero{grid-template-columns:1fr;min-height:0}.create-product-copy,.create-product-page[data-layout=gallery] .create-product-copy{padding:30px 22px 0;text-align:center;align-items:center}.create-product-copy h2{font-size:37px!important;letter-spacing:-1px;max-width:330px;margin:24px 0 18px!important}.create-product-copy>p{font-size:13px;margin-bottom:20px}.create-product-small{display:none}.create-product-art svg,.create-product-page[data-layout=gallery] .create-product-art svg{height:355px}.create-art-word,.create-product-page[data-layout=gallery] .create-art-word{left:50%;transform:translateX(-50%);font-size:110px;top:40px}.create-product-specs{margin:0 22px;gap:12px}.create-product-specs strong{font-size:22px}.create-product-specs>div>span{font-size:8px}.create-art-caption{font-size:7px}details{margin:0 22px}.create-product-footer{padding:22px;font-size:6px;letter-spacing:.5px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
`;
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }
  byId('create-download').addEventListener('click', () => {
    const clone = product.cloneNode(true);
    clone.removeAttribute('id');
    const html = '<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + escapeText(outputName) + ' · 教学商品</title><style>' + exportStyles + '</style></head><body>' + clone.outerHTML + '<script>document.getElementById("create-explore").addEventListener("click",function(){var d=document.getElementById("create-product-details");d.open=true;d.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"});});<\/script></body></html>';
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'studio-01-教学商品页.html';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = '成品 HTML 已准备下载；打开后可继续点击“探索这把琴”和规格详情。';
  });
  function handleChapterChange() {
    if (createSection.hidden) cancelGeneration();
    if (pricingSection.hidden) pricingSection.querySelectorAll('video').forEach((video) => video.pause());
  }
  document.addEventListener('chapterchange', handleChapterChange);
  window.addEventListener('chapterchange', handleChapterChange);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelGeneration();
      pricingSection.querySelectorAll('video').forEach((video) => video.pause());
    }
  });
})();
