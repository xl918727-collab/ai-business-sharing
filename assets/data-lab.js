(() => {
  'use strict';
  const root = document.querySelector('.dashboard-builder');
  if (!root) return;
  const zone = document.getElementById('dashboard-dropzone');
  const empty = document.getElementById('dashboard-empty');
  const chart = document.getElementById('widget-chart');
  const size = document.getElementById('widget-size');
  const color = document.getElementById('widget-color');
  const remove = document.getElementById('widget-remove');
  const title = document.getElementById('widget-title');
  let selected = null, dragging = null;

  const chartNames = {kpi:'KPI 数字',line:'曲线图',bar:'条形图',pie:'饼图',treemap:'树状图',table:'明细表'};
  const visual = type => type === 'kpi' ? '<strong class="widget-value"></strong>' : type === 'pie' ? '<div class="demo-pie"></div>' : type === 'treemap' ? '<div class="demo-tree"><i></i><i></i><i></i><i></i></div>' : type === 'table' ? '<div class="demo-table"><i></i><i></i><i></i></div>' : type === 'line' ? '<div class="demo-line"><svg viewBox="0 0 320 125" preserveAspectRatio="none" aria-label="趋势曲线"><defs><linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--widget-color)" stop-opacity=".24"/><stop offset="1" stop-color="var(--widget-color)" stop-opacity="0"/></linearGradient></defs><path class="line-area" d="M4 101 C34 92,48 38,81 53 S132 107,168 72 S220 32,250 56 S288 43,316 21 L316 124 L4 124 Z"/><path class="line-stroke" d="M4 101 C34 92,48 38,81 53 S132 107,168 72 S220 32,250 56 S288 43,316 21"/><g><circle cx="4" cy="101" r="4"/><circle cx="81" cy="53" r="4"/><circle cx="168" cy="72" r="4"/><circle cx="250" cy="56" r="4"/><circle cx="316" cy="21" r="4"/></g></svg><div class="line-axis"><span>周一</span><span>周三</span><span>周五</span><span>周日</span></div></div>' : '<div class="demo-bar"><i></i><i></i><i></i><i></i><i></i></div>';
  function select(card) {
    selected?.classList.remove('selected'); selected = card; card?.classList.add('selected');
    title.textContent = card ? card.dataset.title : '选择一个组件';
    chart.disabled = size.disabled = color.disabled = remove.disabled = !card;
    if (card) { chart.value = card.dataset.chart; size.value = card.dataset.size; color.value = card.dataset.color; }
  }
  function render(card) {
    card.style.setProperty('--widget-color', card.dataset.color);
    card.classList.remove('size-small','size-medium','size-large'); card.classList.add(`size-${card.dataset.size}`);
    card.querySelector('.widget-visual').innerHTML = visual(card.dataset.chart);
    const value = card.querySelector('.widget-value'); if (value) value.textContent = card.dataset.value;
    card.querySelector('.widget-kind').textContent = `${chartNames[card.dataset.chart]} · ${size.options[[...size.options].findIndex(o=>o.value===card.dataset.size)]?.text || '中组件'}`;
  }
  function add(button) {
    const card = document.createElement('article'); card.className = 'dashboard-widget'; card.draggable = true;
    Object.assign(card.dataset,{title:button.dataset.title,value:button.dataset.value,chart:'kpi',size:'medium',color:'#2558ed'});
    card.innerHTML = `<header><span><b>${button.dataset.title}</b><small class="widget-kind">KPI 数字</small></span><button type="button" class="widget-handle" aria-label="拖动组件排序">⠿</button></header><div class="widget-visual"></div>`;
    card.addEventListener('click',()=>select(card));
    card.addEventListener('dragstart',e=>{dragging=card;card.classList.add('is-dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-dashboard-widget','reorder')});
    card.addEventListener('dragend',()=>{card.classList.remove('is-dragging');dragging=null});
    zone.appendChild(card); empty.hidden = true; render(card); select(card);
  }
  root.querySelectorAll('[data-widget]').forEach(button=>{button.addEventListener('click',()=>add(button));button.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',button.dataset.widget));});
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over');if(dragging){const target=e.target.closest('.dashboard-widget');if(target&&target!==dragging){const r=target.getBoundingClientRect();zone.insertBefore(dragging,e.clientY<r.top+r.height/2?target:target.nextSibling)}}});
  zone.addEventListener('dragleave',e=>{if(!zone.contains(e.relatedTarget))zone.classList.remove('drag-over')});
  zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag-over');if(dragging)return;const button=root.querySelector(`[data-widget="${e.dataTransfer.getData('text/plain')}"]`);if(button)add(button)});
  chart.addEventListener('change',()=>{if(selected){selected.dataset.chart=chart.value;render(selected)}});
  size.addEventListener('change',()=>{if(selected){selected.dataset.size=size.value;render(selected)}});
  color.addEventListener('input',()=>{if(selected){selected.dataset.color=color.value;render(selected)}});
  remove.addEventListener('click',()=>{if(selected){selected.remove();select(null);empty.hidden=!!zone.querySelector('.dashboard-widget')}});
  document.getElementById('dashboard-clear').addEventListener('click',()=>{zone.querySelectorAll('.dashboard-widget').forEach(x=>x.remove());select(null);empty.hidden=false});
  ['sales','site','ads'].forEach(id=>add(root.querySelector(`[data-widget="${id}"]`)));
  const cards=zone.querySelectorAll('.dashboard-widget');cards[0].dataset.size='small';render(cards[0]);cards[1].dataset.chart='pie';cards[1].dataset.size='small';render(cards[1]);cards[2].dataset.chart='line';cards[2].dataset.size='large';cards[2].dataset.color='#ff7a32';render(cards[2]);select(cards[2]);
})();
