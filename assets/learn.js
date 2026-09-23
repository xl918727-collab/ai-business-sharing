(() => {
  "use strict";
  const toast = document.querySelector("#toast");
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
  }

  async function copyText(target) {
    const text = target.textContent;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        notify("已复制，可以粘贴到你的 Agent。");
        return;
      } catch (_) { /* Local file browsers may deny clipboard access. Use selection below. */ }
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
    field.remove();
    if (copied) {
      notify("已复制，可以粘贴到你的 Agent。");
    } else {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
      notify("内容已选中，请用系统复制快捷键复制。");
    }
  }
  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", () => copyText(document.getElementById(button.dataset.copy)));
  });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      item.classList.toggle("active", selected);
      document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next]);
        tabs[next].focus();
      }
    });
  });
  document.querySelectorAll("[data-switch-product]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      selectTab(document.querySelector("#tab-product"));
      document.querySelector("#tab-product").focus();
      document.querySelector(".tabs").scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  });
  if (location.hash === "#panel-product") selectTab(document.querySelector("#tab-product"));

  const dialog = document.querySelector("#image-dialog");
  const zoomImage = document.querySelector("#zoom-image");
  const caption = document.querySelector("#image-caption");
  let previousFocus = null;
  document.querySelectorAll("[data-zoom]").forEach(button => {
    button.addEventListener("click", () => {
      previousFocus = button;
      zoomImage.src = button.dataset.zoom;
      zoomImage.alt = button.querySelector("img").alt;
      caption.textContent = button.dataset.caption;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    });
  });
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    previousFocus?.focus();
  });

  const storageKey = "ai-business-course.learning-checklist.v1";
  const steps = [...document.querySelectorAll("[data-step]")];
  const progress = document.querySelector("#checklist-progress");
  const saveStatus = document.querySelector("#save-status");
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    steps.forEach(input => { input.checked = saved?.[input.dataset.step] === true; });
  } catch (_) { storageAvailable = false; }
  function updateProgress(save) {
    const count = steps.filter(input => input.checked).length;
    progress.textContent = `已记录 ${count} / ${steps.length} 项 · 勾选由你确认，不代表系统检测结果`;
    if (save) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(steps.map(input => [input.dataset.step, input.checked]))));
        storageAvailable = true;
      } catch (_) { storageAvailable = false; }
    }
    saveStatus.textContent = storageAvailable ? "浏览器允许时会在本机保存，其他设备不会同步。" : "当前浏览器不允许保存进度；本页仍可勾选，刷新后可能丢失。";
  }
  steps.forEach(input => input.addEventListener("change", () => updateProgress(true)));
  document.querySelector("#reset-checklist").addEventListener("click", () => {
    steps.forEach(input => { input.checked = false; });
    updateProgress(true);
    notify("已清空本页勾选记录。");
  });
  updateProgress(false);
})();
