(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const source = window.COURSE_SHOWCASE;
  const items = Array.isArray(source?.items) ? source.items.filter((item) => item && typeof item.id === 'string' && item.id.length) : [];
  if (!items.length) { $('showcase-empty').hidden = false; return; }

  let currentItem = null;
  let frameIndex = 0;
  let zoom = 1;
  let toastTimer;
  const navLinks = new Map();
  const imageDialog = $('image-dialog');
  const asText = (value) => Array.isArray(value) ? value.join('；') : String(value ?? '');
  const notify = (message) => {
    clearTimeout(toastTimer);
    $('showcase-toast').textContent = message;
    $('showcase-toast').classList.add('show');
    toastTimer = setTimeout(() => $('showcase-toast').classList.remove('show'), 3000);
  };
  const safeUrl = (value, external = false) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      if (external) return url.protocol === 'https:' ? url.href : null;
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };
  const frames = () => Array.isArray(currentItem?.frames) ? currentItem.frames.filter((frame) => frame && typeof frame.src === 'string' && safeUrl(frame.src)) : [];
  const setLink = (id, url, label, external = false) => {
    const element = $(id);
    const href = safeUrl(url, external);
    element.hidden = !href;
    if (href) { element.href = href; element.textContent = label; }
    else element.removeAttribute('href');
  };

  items.forEach((item, index) => {
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(item.id)}`;
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span');
    title.textContent = asText(item.title);
    link.append(number, title);
    link.addEventListener('click', (event) => {
      event.preventDefault();
      selectItem(item.id, true);
      $('app-directory').open = false;
      $('directory-summary').focus({ preventScroll: true });
    });
    $('app-nav').append(link);
    navLinks.set(item.id, link);
  });
  $('app-count').textContent = ` · ${items.length} 个真实应用`;
  $('updated-at').textContent = source.updated ? `记录日期 · ${asText(source.updated)}` : '';

  function selectItem(id, updateHash = false) {
    currentItem = items.find((item) => item.id === id) || items[0];
    frameIndex = 0;
    if (imageDialog.open) imageDialog.close();
    for (const [key, link] of navLinks) {
      if (key === currentItem.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (updateHash) {
      try { history.replaceState(null, '', `#${encodeURIComponent(currentItem.id)}`); }
      catch { location.hash = encodeURIComponent(currentItem.id); }
    }
    const fields = { 'app-tag': currentItem.tag, 'app-title': currentItem.title, 'app-summary': currentItem.summary, 'app-input': currentItem.input, 'app-output': currentItem.output, 'app-verified': currentItem.verified, 'app-limit': currentItem.limit };
    for (const [id, value] of Object.entries(fields)) $(id).textContent = asText(value);
    $('limit-row').hidden = !asText(currentItem.limit).trim();
    $('app-position').textContent = `${String(items.indexOf(currentItem) + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    $('directory-current').textContent = asText(currentItem.title);
    document.title = `${asText(currentItem.title)} · 真实应用展厅`;
    const steps = Array.isArray(currentItem.steps) ? currentItem.steps : [];
    $('app-steps').replaceChildren(...steps.map((step) => {
      const li = document.createElement('li');
      const content = document.createElement('div');
      const title = document.createElement('h3');
      const body = document.createElement('p');
      title.textContent = asText(step?.title);
      body.textContent = asText(step?.body);
      content.append(title, body);
      li.append(content);
      return li;
    }));
    $('step-count').textContent = `${steps.length} STEPS`;
    setLink('live-link', currentItem.liveUrl, `${asText(currentItem.liveLabel || '打开在线工具')} ↗`, true);
    setLink('practice-link', currentItem.practiceUrl, `${asText(currentItem.practiceLabel || '打开教学演示')} →`);
    setLink('top-practice-link', currentItem.practiceUrl, `${asText(currentItem.practiceLabel || '亲手试一遍')} ↗`);
    $('copy-prompt').hidden = !asText(currentItem.prompt).trim();
    const hasEntrance = !$('live-link').hidden || !$('practice-link').hidden || !$('copy-prompt').hidden;
    document.querySelector('.try-row').hidden = !hasEntrance;
    $('try-description').textContent = currentItem.practiceUrl ? '从教学入口开始，用示例数据走完一次操作。' : '按上面的步骤准备材料，再用自己的 Agent 实现这个任务。';
    $('app-exhibit').hidden = false;
    renderFrame();
  }

  function renderFrame() {
    const allFrames = frames();
    frameIndex = Math.max(0, Math.min(frameIndex, allFrames.length - 1));
    const frame = allFrames[frameIndex];
    $('frame-image').hidden = !frame;
    $('image-failure').hidden = Boolean(frame);
    $('frame-label').textContent = asText(frame?.label || '演示画面');
    $('frame-caption').textContent = asText(frame?.caption || '');
    $('frame-count').textContent = allFrames.length ? `${frameIndex + 1} / ${allFrames.length}` : '0 / 0';
    $('previous-frame').disabled = !frame || frameIndex === 0;
    $('next-frame').disabled = !frame || frameIndex === allFrames.length - 1;
    $('open-image').disabled = !frame;
    $('frame-stage').disabled = !frame;
    if (frame) {
      const image = $('frame-image');
      image.classList.remove('frame-enter');
      image.alt = `${asText(currentItem.title)}：${asText(frame.label || '演示画面')}`;
      image.src = safeUrl(frame.src);
      requestAnimationFrame(() => image.classList.add('frame-enter'));
      if (imageDialog.open) updateZoomFrame();
    }
  }
  function moveFrame(direction) {
    const candidate = frameIndex + direction;
    if (candidate < 0 || candidate >= frames().length) return;
    frameIndex = candidate;
    renderFrame();
  }
  $('previous-frame').addEventListener('click', () => moveFrame(-1));
  $('next-frame').addEventListener('click', () => moveFrame(1));
  $('frame-image').addEventListener('error', () => {
    $('image-failure').hidden = false;
    $('open-image').disabled = true;
    $('frame-stage').disabled = true;
  });
  $('frame-image').addEventListener('load', () => {
    $('image-failure').hidden = true;
    $('open-image').disabled = false;
    $('frame-stage').disabled = false;
  });

  function updateZoomFrame() {
    const frame = frames()[frameIndex];
    if (!frame) return;
    $('zoom-title').textContent = asText(frame.label || currentItem.title);
    $('zoom-caption').textContent = asText(frame.caption);
    $('zoom-image').alt = $('frame-image').alt;
    $('zoom-image').src = safeUrl(frame.src);
    applyZoom();
  }
  function applyZoom() {
    const area = $('zoom-scroll');
    const width = Math.max(1, area.clientWidth);
    $('zoom-image').style.width = `${Math.round(width * zoom)}px`;
    document.querySelectorAll('[data-zoom]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.zoom) === zoom)));
  }
  function openImage() {
    if ($('open-image').disabled) return;
    zoom = 1;
    imageDialog.showModal();
    updateZoomFrame();
    $('zoom-scroll').scrollTo(0, 0);
    $('close-image').focus();
  }
  $('open-image').addEventListener('click', openImage);
  $('frame-stage').addEventListener('click', openImage);
  $('close-image').addEventListener('click', () => imageDialog.close());
  $('zoom-image').addEventListener('load', applyZoom);
  document.querySelectorAll('[data-zoom]').forEach((button) => button.addEventListener('click', () => {
    zoom = Number(button.dataset.zoom);
    applyZoom();
  }));
  window.addEventListener('resize', () => { if (imageDialog.open) applyZoom(); });

  $('showcase-fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else notify('此浏览器不支持网页全屏，可使用浏览器的全屏功能。');
    } catch { notify('未能进入全屏，可使用浏览器的全屏功能。'); }
  });
  document.addEventListener('fullscreenchange', () => {
    $('showcase-fullscreen').replaceChildren(document.createTextNode(document.fullscreenElement ? '退出全屏 ' : '全屏展示 '));
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = '⛶';
    $('showcase-fullscreen').append(symbol);
  });
  $('copy-prompt').addEventListener('click', async () => {
    const value = asText(currentItem.prompt);
    if (!value.trim()) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      notify('搭建指令已复制，粘贴到你使用的 Agent 即可。');
    } catch {
      const field = document.createElement('textarea');
      field.value = value;
      field.readOnly = true;
      field.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      field.remove();
      if (copied) { notify('搭建指令已复制，粘贴到你使用的 Agent 即可。'); $('copy-prompt').focus(); }
      else {
        $('copy-text').value = value;
        $('copy-dialog').showModal();
        $('copy-text').focus();
        $('copy-text').select();
      }
    }
  });
  $('close-copy').addEventListener('click', () => $('copy-dialog').close());
  $('copy-dialog').addEventListener('close', () => { if (!$('copy-prompt').hidden) $('copy-prompt').focus(); });
  function idFromHash() { try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; } }
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    $('showcase-main').scrollIntoView({ block: 'start' });
    $('showcase-main').focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => {
    const id = idFromHash();
    if (items.some((item) => item.id === id)) selectItem(id);
  });
  selectItem(idFromHash());
})();
