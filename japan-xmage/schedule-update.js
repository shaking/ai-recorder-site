(() => {
  document.querySelectorAll('.day > a[href="#places"]').forEach(link => link.remove());
  document.querySelectorAll('.day > span').forEach(label => {
    const status = label.querySelector('i');
    if (!status) return;
    const parts = status.textContent.split('·').map(value => value.trim());
    if (parts.length < 2) return;
    const date = label.childNodes[0]?.textContent.trim();
    label.childNodes[0].textContent = `${date} · ${parts[0]} `;
    status.textContent = parts.slice(1).join(' · ');
  });
})();

(() => {
  const list = document.querySelector('.place-list');
  if (!list) return;

  const relocated = [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.05'));
  if (!relocated) return;
  relocated.querySelector('b').textContent = '11.09 · 周一';
  relocated.querySelector('span').textContent = '坪井尚浩工作室、WOW 与 teamLab';

  const header = document.createElement('div');
  header.className = 'place-date';
  header.innerHTML = '<b>11.05 · 周四</b><span>东京艺术大学与草间弥生展</span>';
  const cards = document.createElement('div');
  cards.innerHTML = '<div data-place="geidai" class="place-card" role="button" tabindex="0"><b>07</b><span><strong>东京艺术大学</strong><small>上野 · 台东区</small></span><a class="map-link" href="https://www.google.com/maps/search/Tokyo+University+of+the+Arts+Ueno" target="_blank" rel="noopener" aria-label="在 Google Maps 打开东京艺术大学">↗</a></div><div data-place="kusama" class="place-card" role="button" tabindex="0"><b>08</b><span><strong>草间弥生美术馆</strong><small>弁天町 107 · 新宿区</small></span><a class="map-link" href="https://www.google.com/maps/search/Yayoi+Kusama+Museum+107+Bentencho+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开草间弥生美术馆">↗</a></div>';
  relocated.before(header, ...cards.children);

  list.querySelector('[data-place="tsuboi"] b').textContent = '09';
  list.querySelector('[data-place="shibuya"] b').textContent = '10';
  list.querySelector('[data-place="teamlab"] b').textContent = '11';
  list.querySelector('[data-place="prince"] b').textContent = '12';

  const headers = [...list.querySelectorAll('.place-date')];
  const setOpen = active => headers.forEach(item => {
    const open = item === active;
    item.classList.toggle('is-open', open);
    item.setAttribute('aria-expanded', String(open));
    let node = item.nextElementSibling;
    while (node && !node.classList.contains('place-date')) {
      node.hidden = !open;
      node = node.nextElementSibling;
    }
  });
  headers.forEach(item => item.addEventListener('click', () => setOpen(item)));
  list.querySelectorAll('[data-place="geidai"],[data-place="kusama"]').forEach(card => {
    const choose = () => window.selectPlace?.(card.dataset.place);
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) choose(); });
    card.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) {
        event.preventDefault();
        choose();
      }
    });
  });
})();

(() => {
  const list = document.querySelector('.place-list');
  if (!list) return;

  const setOnlyOpen = active => {
    [...list.querySelectorAll('.place-date')].forEach(header => {
      const open = header === active;
      header.classList.toggle('is-open', open);
      header.setAttribute('aria-expanded', String(open));
      let node = header.nextElementSibling;
      while (node && !node.classList.contains('place-date')) {
        node.hidden = !open;
        node = node.nextElementSibling;
      }
    });
  };

  const headers = [...list.querySelectorAll('.place-date')];
  setOnlyOpen(headers.find(header => header.classList.contains('is-open')) || headers[0]);
  list.addEventListener('click', event => {
    const header = event.target.closest('.place-date');
    if (!header || !list.contains(header)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setOnlyOpen(header);
  }, true);
  list.addEventListener('keydown', event => {
    const header = event.target.closest('.place-date');
    if (!header || !list.contains(header) || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setOnlyOpen(header);
  }, true);
})();

(() => {
  const day = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.07'));
  if (day) {
    day.querySelector('h3').innerHTML = '同行团建<br>富士山山中湖';
    day.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>06:30–09:30 前往·山中湖<br>山梨县·山中湖村<br>09:30–12:00 山中湖游览<br>湖畔景观与团建活动</strong></div><div><b>中午</b><strong>12:00–13:00 湖畔午餐·山中湖<br>地点待定</strong></div><div><b>下午</b><strong>13:00–16:30 山中湖游览<br>富士山湖畔景观与团建活动<br>16:30–18:30 返回东京</strong></div><div><b>晚上</b><strong>团建晚餐<br>安排中</strong></div>';
  }

  const arrivalDay = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.02'));
  if (arrivalDay) {
    const afternoon = arrivalDay.querySelector('.slots > div:nth-child(3) strong');
    if (afternoon) afternoon.innerHTML = '17:25 起飞·全日空 NH966<br>深圳宝安 → 东京羽田<br>22:20 抵达<br><br>13:05 起飞·日本航空 JL082<br>上海虹桥 → 东京羽田<br>16:50 抵达';
  }

  const returnDay = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.10'));
  if (returnDay) {
    const noon = returnDay.querySelector('.slots > div:nth-child(2) strong');
    if (noon) noon.innerHTML = '19:00 起飞·深圳航空 ZH652<br>东京成田 T1 → 深圳宝安<br>23:05 抵达<br><br>13:30 起飞·东方航空 MU8632<br>东京羽田 → 上海虹桥<br>15:45 抵达<br>（上海航空 FM816 执飞）';
  }

  const folder = document.querySelector('.photo-folder[data-date="2026-11-07"]');
  if (folder) {
    folder.querySelector('.folder-head strong').textContent = '同行团建 · 富士山山中湖';
    folder.querySelector('.folder-head small').textContent = '山梨县 · 山中湖村';
  }

  const list = document.querySelector('.place-list');
  const nov9 = list && [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.09'));
  if (list && nov9 && ![...list.querySelectorAll('.place-date')].some(item => item.textContent.includes('11.08'))) {
    nov9.insertAdjacentHTML('beforebegin', '<div class="place-date"><b>11.08 · 周日</b><span>自由活动 · 东京漫游</span></div><div class="place-card"><b>—</b><span><strong>东京漫游</strong><small>地点待定 · 东京</small></span></div>');
  }
  const prince = list?.querySelector('[data-place="prince"]');
  if (list && prince && !list.querySelector('[data-place="kawaguchiko"]')) {
    prince.insertAdjacentHTML('afterend', '<div class="place-date"><b>11.07 · 周六</b><span>同行团建 · 富士山山中湖</span></div><div data-place="kawaguchiko" class="place-card" role="button" tabindex="0"><b>10</b><span><strong>富士山山中湖</strong><small>山中湖村 · 山梨县</small></span><a class="map-link" href="https://www.google.com/maps/search/Lake+Yamanaka+Yamanashi+Japan" target="_blank" rel="noopener" aria-label="在 Google Maps 打开富士山山中湖">↗</a></div>');
    const header = [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.07'));
    if (header?.nextElementSibling) header.nextElementSibling.hidden = true;
    header?.addEventListener('click', () => {
      [...list.querySelectorAll('.place-date')].forEach(item => {
        const open = item === header;
        item.classList.toggle('is-open', open);
        item.setAttribute('aria-expanded', String(open));
        let node = item.nextElementSibling;
        while (node && !node.classList.contains('place-date')) { node.hidden = !open; node = node.nextElementSibling; }
      });
    });
    const card = list.querySelector('[data-place="kawaguchiko"]');
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) window.selectPlace?.('kawaguchiko'); });
    card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) { event.preventDefault(); window.selectPlace?.('kawaguchiko'); } });
  }
})();

(() => {
  const list = document.querySelector('.place-list');
  if (!list) return;
  const groups = [];
  let current = null;
  [...list.children].forEach(node => {
    if (node.classList.contains('place-date')) {
      current = { nodes: [node], date: Number(node.textContent.match(/11\.(\d{2})/)?.[1] || 99) };
      groups.push(current);
    } else if (current) {
      current.nodes.push(node);
    }
  });
  groups.sort((a, b) => a.date - b.date);
  groups.flatMap(group => group.nodes).forEach(node => list.appendChild(node));
})();

(() => {
  const findDay = date => [...document.querySelectorAll('.day')].find(item => item.textContent.includes(date));
  const day5 = findDay('11.05');
  if (day5) {
    day5.querySelector('h3').innerHTML = '坪井尚浩工作室<br>WOW 与 teamLab';
    day5.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>09:00 打车<br>10:00–11:30 工作室·坪井尚浩<br>樱新町 · 世田谷<br>以极简设计语言与前瞻性创意，探索产品形态、功能与美学的全新可能</strong></div><div><b>中午</b><strong>11:35 打车<br>12:10–13:40 午餐·涩谷</strong></div><div><b>下午</b><strong>16:00–17:00 参观·WOW·涩谷<br>以前沿 CG 与影像技术为核心，探索视觉艺术、数字体验与空间表达的创新融合<br>15:05 打车</strong></div><div><b>晚上</b><strong>15:30–17:30 参观·teamLab<br>18:00–20:00 晚餐<br>20:10 回酒店</strong></div>';
  }

  const day8 = findDay('11.08');
  if (day8) {
    const label = day8.querySelector(':scope > span');
    if (label) { label.childNodes[0].textContent = '11.08 · SUN '; label.querySelector('i').textContent = '返程'; }
    day8.querySelector('h3').innerHTML = '回国<br>航班日';
    day8.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>收拾 / 退房</strong></div><div><b>中午</b><strong>19:00 起飞·深圳航空 ZH652<br>东京成田 T1 → 深圳宝安<br>23:05 抵达<br><br>13:30 起飞·东方航空 MU8632<br>东京羽田 → 上海虹桥<br>15:45 抵达<br>（上海航空 FM816 执飞）</strong></div><div><b>下午</b><strong>前往成田机场 / 羽田机场</strong></div><div><b>晚上</b><strong>抵达深圳 / 上海<br>行程结束</strong></div>';
  }
  ['11.09', '11.10'].map(findDay).filter(Boolean).forEach(day => { day.hidden = true; });

  const folders = document.querySelector('#photoGrid');
  if (folders) {
    const folder5 = folders.querySelector('[data-date="2026-11-05"]');
    const folder8 = folders.querySelector('[data-date="2026-11-08"]');
    if (folder5) { folder5.querySelector('strong').textContent = '坪井尚浩工作室、WOW 与 teamLab'; folder5.querySelector('small').textContent = '樱新町 · 涩谷 · 麻布台'; }
    if (folder8) { folder8.querySelector('strong').textContent = '回国'; folder8.querySelector('small').textContent = '航班日'; }
    folders.querySelector('[data-date="2026-11-09"]')?.remove();
    folders.querySelector('[data-date="2026-11-10"]')?.remove();
  }

  const list = document.querySelector('.place-list');
  if (!list) return;
  const removeGroup = matcher => {
    const header = [...list.querySelectorAll('.place-date')].find(item => matcher.test(item.textContent));
    if (!header) return;
    let node = header.nextElementSibling;
    header.remove();
    while (node && !node.classList.contains('place-date')) { const next = node.nextElementSibling; node.remove(); node = next; }
  };
  removeGroup(/11\.05/);
  removeGroup(/11\.08/);
  const moved = [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.09'));
  if (moved) { moved.querySelector('b').textContent = '11.05 · 周四'; moved.querySelector('span').textContent = '坪井尚浩工作室、WOW 与 teamLab'; }
  const numbers = [['tsuboi','07'],['shibuya','08'],['teamlab','09'],['prince','10'],['kawaguchiko','11']];
  numbers.forEach(([id, number]) => { const card = list.querySelector(`[data-place="${id}"]`); if (card) card.querySelector('b').textContent = number; });
  const groupsAfter = [];
  let current = null;
  [...list.children].forEach(node => { if (node.classList.contains('place-date')) { current = {nodes:[node], date:Number(node.textContent.match(/11\.(\d{2})/)?.[1] || 99)}; groupsAfter.push(current); } else if (current) current.nodes.push(node); });
  groupsAfter.sort((a,b) => a.date - b.date).flatMap(group => group.nodes).forEach(node => list.appendChild(node));
})();

(() => {
  const day5 = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.05'));
  if (day5) {
    day5.querySelector('h3').innerHTML = '草间弥生美术馆<br>WOW 与 teamLab';
    day5.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>11:00–12:30 参观·草间弥生美术馆<br>弁天町 107 · 新宿区<br>需提前预约指定时段</strong></div><div><b>中午</b><strong>12:30–13:40 午餐·新宿 / 涩谷<br>前往 WOW</strong></div><div><b>下午</b><strong>16:00–17:00 参观·WOW·涩谷<br>以前沿 CG 与影像技术为核心，探索视觉艺术、数字体验与空间表达的创新融合<br>15:05 打车</strong></div><div><b>晚上</b><strong>15:30–17:30 参观·teamLab<br>18:00–20:00 晚餐<br>20:10 回酒店</strong></div>';
  }
  const folder5 = document.querySelector('#photoGrid .photo-folder[data-date="2026-11-05"]');
  if (folder5) {
    folder5.querySelector('strong').textContent = '草间弥生美术馆、WOW 与 teamLab';
    folder5.querySelector('small').textContent = '弁天町 · 涩谷 · 麻布台';
  }
  const list = document.querySelector('.place-list');
  if (!list) return;
  const header = [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.05'));
  if (header && !list.querySelector('[data-place="kusama"]')) {
    header.insertAdjacentHTML('afterend', '<div data-place="kusama" class="place-card" role="button" tabindex="0"><b>07</b><span><strong>草间弥生美术馆</strong><small>弁天町 107 · 新宿区</small></span><a class="map-link" href="https://www.google.com/maps/search/Yayoi+Kusama+Museum+107+Bentencho+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开草间弥生美术馆">↗</a></div>');
    const card = list.querySelector('[data-place="kusama"]');
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) window.selectPlace?.('kusama'); });
    card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) { event.preventDefault(); window.selectPlace?.('kusama'); } });
  }
  [['kusama','07'],['shibuya','08'],['teamlab','09'],['prince','10'],['kawaguchiko','11']].forEach(([id, number]) => { const card = list.querySelector(`[data-place="${id}"]`); if (card) card.querySelector('b').textContent = number; });
})();

(() => {
  const day2 = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.02'));
  if (day2) {
    const evening = day2.querySelector('.slots > div:last-child strong');
    if (evening) evening.innerHTML = '入住·新高轮王子大酒店<br>高轮 3-13-1 · 港区';
  }
  const day8 = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.08'));
  if (day8) {
    const morning = day8.querySelector('.slots > div:first-child strong');
    if (morning) morning.innerHTML = '新高轮王子大酒店退房';
  }
  const list = document.querySelector('.place-list');
  if (!list || list.querySelector('[data-place="hotel"]')) return;
  const firstHeader = list.querySelector('.place-date');
  if (!firstHeader) return;
  firstHeader.insertAdjacentHTML('beforebegin', '<div class="place-date"><b>11.02 · 周一</b><span>抵达东京 · 入住酒店</span></div><div data-place="haneda" class="place-card" role="button" tabindex="0"><b>01</b><span><strong>东京羽田机场</strong><small>羽田 · 大田区</small></span><a class="map-link" href="https://www.google.com/maps/search/Haneda+Airport+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开东京羽田机场">↗</a></div><div data-place="hotel" class="place-card" role="button" tabindex="0"><b>02</b><span><strong>新高轮王子大酒店</strong><small>高轮 3-13-1 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/Grand+Prince+Hotel+Shin+Takanawa+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开新高轮王子大酒店">↗</a></div>');
  list.querySelectorAll('[data-place="haneda"],[data-place="hotel"]').forEach(card => {
    card.dataset.bound = 'true';
    const choose = () => window.selectPlace?.(card.dataset.place);
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) choose(); });
    card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) { event.preventDefault(); choose(); } });
  });
  list.insertAdjacentHTML('beforeend', '<div class="place-date"><b>11.08 · 周日</b><span>返程 · 酒店与机场</span></div><div data-place="hotel" class="place-card" role="button" tabindex="0"><b>12</b><span><strong>新高轮王子大酒店</strong><small>高轮 3-13-1 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/Grand+Prince+Hotel+Shin+Takanawa+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开新高轮王子大酒店">↗</a></div><div data-place="narita" class="place-card" role="button" tabindex="0"><b>13</b><span><strong>东京成田机场</strong><small>成田 · 千叶县</small></span><a class="map-link" href="https://www.google.com/maps/search/Narita+International+Airport+Terminal+1+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开东京成田机场">↗</a></div>');
  list.querySelectorAll('[data-place="narita"],[data-place="hotel"]').forEach(card => {
    if (card.dataset.bound === 'true') return;
    card.dataset.bound = 'true';
    const choose = () => window.selectPlace?.(card.dataset.place);
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) choose(); });
    card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) { event.preventDefault(); choose(); } });
  });
  list.querySelectorAll('[data-place="kusama"]').forEach(card => card.remove());
})();

(() => {
  const day3 = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.03'));
  if (day3) {
    day3.querySelector('h3').innerHTML = 'Tokyo Design Art<br>皇居与 teamLab Planets';
    day3.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>09:30–09:55 打车·预计用时 10–30 分钟<br>10:00–11:30 展览·Tokyo Design Art<br>1. MOIRÉ：视觉错觉、莫尔纹、动态感、视觉互动<br>2. 纸质蜡笔：色彩、感官体验</strong></div><div><b>中午</b><strong>12:00–12:15 打车·约 10–20 分钟<br>12:30–13:40 午餐·うな富士</strong></div><div><b>下午</b><strong>13:45–14:15 游览·皇居东御苑<br>14:30–17:00 参观·teamLab Planets<br>光影无界、虚实共生、3D 沉浸式空间错觉艺术<br><br>15:30–17:00 参观·皇居三之丸尚藏馆<br>《皇室至宝，美之源》展览</strong></div><div><b>晚上</b><strong>18:00–20:00 晚餐<br>20:10 回酒店</strong></div>';
  }
  const folder3 = document.querySelector('#photoGrid .photo-folder[data-date="2026-11-03"]');
  if (folder3) {
    folder3.querySelector('strong').textContent = 'Tokyo Design Art、皇居与 teamLab Planets';
    folder3.querySelector('small').textContent = 'Tokyo Design Art · 皇居 · 丰洲';
  }
  const list = document.querySelector('.place-list');
  if (!list) return;
  const header = [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.03'));
  if (!header || list.querySelector('[data-place="teamlabPlanets"]')) return;
  let node = header.nextElementSibling;
  while (node && !node.classList.contains('place-date')) { const next = node.nextElementSibling; node.remove(); node = next; }
  header.querySelector('span').textContent = 'Tokyo Design Art、皇居与 teamLab Planets';
  header.insertAdjacentHTML('afterend', '<div data-place="designart" class="place-card" role="button" tabindex="0"><b>01</b><span><strong>DESIGNART TOKYO·银座主会场</strong><small>AUTOBAHN / KK Line · 银座西2-2先</small></span><a class="map-link" href="https://www.google.com/maps/search/AUTOBAHN+KK+Line+Ginza+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开 DESIGNART TOKYO 银座主会场">↗</a></div><div data-place="eastGardens" class="place-card" role="button" tabindex="0"><b>02</b><span><strong>皇居东御苑</strong><small>千代田区</small></span><a class="map-link" href="https://www.google.com/maps/search/Imperial+Palace+East+Gardens+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开皇居东御苑">↗</a></div><div data-place="teamlabPlanets" class="place-card" role="button" tabindex="0"><b>03</b><span><strong>teamLab Planets TOKYO</strong><small>丰洲 · 江东区</small></span><a class="map-link" href="https://www.google.com/maps/search/teamLab+Planets+TOKYO" target="_blank" rel="noopener" aria-label="在 Google Maps 打开 teamLab Planets TOKYO">↗</a></div><div data-place="sannomaru" class="place-card" role="button" tabindex="0"><b>04</b><span><strong>皇居三之丸尚藏馆</strong><small>千代田区</small></span><a class="map-link" href="https://www.google.com/maps/search/Sannomaru+Shozokan+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开皇居三之丸尚藏馆">↗</a></div>');
  list.querySelectorAll('[data-place="designart"],[data-place="eastGardens"],[data-place="teamlabPlanets"],[data-place="sannomaru"]').forEach(card => {
    card.dataset.bound = 'true';
    const choose = () => window.selectPlace?.(card.dataset.place);
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) choose(); });
    card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) { event.preventDefault(); choose(); } });
  });
})();

(() => {
  const day4 = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.04'));
  if (day4) {
    day4.querySelector('h3').innerHTML = 'CEKAI、森美术馆<br>与 WOW';
    day4.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>09:00–09:45 打车·预计用时 35–55 分钟<br>10:00–11:30 参访·CEKAI·代代木<br>1. 年轻潮流、潮牌合作<br>2. 自有 IP 和民族 IP 的创作<br>3. 动感图标</strong></div><div><b>中午</b><strong>11:30–13:00 午餐·涩谷<br>13:00–13:20 打车·约 20 分钟</strong></div><div><b>下午</b><strong>13:30–15:00 参观·森美术馆<br>15:00–15:30 打车·约 30 分钟<br>16:00–17:00 参观·WOW·涩谷<br>以前沿 CG 与影像技术为核心，探索视觉艺术、数字体验与空间表达的创新融合<br>17:15–17:55 打车·约 40 分钟</strong></div><div><b>晚上</b><strong>19:00–21:00 晚餐<br>21:10 回酒店</strong></div>';
  }
  const day5 = [...document.querySelectorAll('.day')].find(item => item.textContent.includes('11.05'));
  if (day5) {
    day5.querySelector('h3').innerHTML = '积彩、坪井尚浩工作室<br>与华为交流';
    day5.querySelector('.slots').innerHTML = '<div><b>上午</b><strong>09:00–09:45 打车·预计用时 30–55 分钟<br>10:00–11:30 参观·积彩·日暮里<br>由新锐设计师大日方伸创立，以 3D 打印技术重塑色彩、材料与造型的设计语言</strong></div><div><b>中午</b><strong>11:35–12:05 打车前往涩谷·约 30 分钟<br>12:10–13:10 午餐<br>13:15–13:25 步行·约 10 分钟</strong></div><div><b>下午</b><strong>13:30–15:00 参访·坪井尚浩工作室·涩谷<br>以极简设计语言与前瞻性创意，探索产品形态、功能与美学的全新可能<br>15:05–15:20 打车·约 25 分钟<br>16:00–18:00 交流·华为日本代表处·九段下</strong></div><div><b>晚上</b><strong>18:00–20:00 晚餐·华为日本代表处<br>20:10 回酒店</strong></div>';
  }
  const folder4 = document.querySelector('#photoGrid .photo-folder[data-date="2026-11-04"]');
  if (folder4) {
    folder4.querySelector('strong').textContent = 'CEKAI、森美术馆与 WOW';
    folder4.querySelector('small').textContent = '代代木 · 六本木 · 涩谷';
  }
  const folder5 = document.querySelector('#photoGrid .photo-folder[data-date="2026-11-05"]');
  if (folder5) {
    folder5.querySelector('strong').textContent = '积彩、坪井尚浩工作室与华为';
    folder5.querySelector('small').textContent = '日暮里 · 涩谷 · 九段下';
  }
  const list = document.querySelector('.place-list');
  if (!list) return;
  const cardsFor = (date, html) => {
    const header = [...list.querySelectorAll('.place-date')].find(item => item.textContent.includes(date));
    if (!header) return;
    let node = header.nextElementSibling;
    while (node && !node.classList.contains('place-date')) { const next = node.nextElementSibling; node.remove(); node = next; }
    header.insertAdjacentHTML('afterend', html);
  };
  cardsFor('11.04', '<div data-place="cekai" class="place-card" role="button" tabindex="0"><b>04</b><span><strong>CEKAI</strong><small>代代木 · 涩谷区</small></span><a class="map-link" href="https://www.google.com/maps/search/CEKAI+Yoyogi+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开 CEKAI 代代木">↗</a></div><div data-place="mori" class="place-card" role="button" tabindex="0"><b>05</b><span><strong>森美术馆</strong><small>六本木 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/Mori+Art+Museum+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开森美术馆">↗</a></div><div data-place="shibuya" class="place-card" role="button" tabindex="0"><b>06</b><span><strong>WOW</strong><small>涩谷 · 涩谷区</small></span><a class="map-link" href="https://www.google.com/maps/search/WOW+Shibuya+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开 WOW 涩谷">↗</a></div>');
  cardsFor('11.05', '<div data-place="sekisai" class="place-card" role="button" tabindex="0"><b>07</b><span><strong>积彩</strong><small>日暮里 · 荒川区</small></span><a class="map-link" href="https://www.google.com/maps/search/%E7%A9%8D%E5%BD%A9+Nippori+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开积彩日暮里">↗</a></div><div data-place="tsuboi" class="place-card" role="button" tabindex="0"><b>08</b><span><strong>坪井尚浩工作室</strong><small>涩谷 · 涩谷区</small></span><a class="map-link" href="https://www.google.com/maps/search/Tsuboi+Naohiro+Studio+Shibuya+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开坪井尚浩工作室">↗</a></div><div data-place="kudan" class="place-card" role="button" tabindex="0"><b>09</b><span><strong>华为日本代表处</strong><small>九段下 · 千代田区</small></span><a class="map-link" href="https://www.google.com/maps/search/Huawei+Japan+Kudanshita+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开华为日本代表处">↗</a></div>');
  list.querySelectorAll('[data-place="cekai"],[data-place="mori"],[data-place="shibuya"],[data-place="sekisai"],[data-place="tsuboi"],[data-place="kudan"]').forEach(card => {
    if (card.dataset.bound === 'true') return;
    card.dataset.bound = 'true';
    const choose = () => window.selectPlace?.(card.dataset.place);
    card.addEventListener('click', event => { if (!event.target.closest('.map-link')) choose(); });
    card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.map-link')) { event.preventDefault(); choose(); } });
  });
})();

(() => {
  const titles = {
    '11.02': '抵达东京 · 航班日',
    '11.03': 'Tokyo Design Art、皇居与 teamLab Planets',
    '11.04': 'CEKAI、森美术馆与 WOW',
    '11.05': '积彩、坪井尚浩工作室与华为交流',
    '11.06': 'XMage 美学峰会',
    '11.07': '同行团建 · 富士山山中湖',
    '11.08': '回国 · 航班日'
  };
  document.querySelectorAll('.place-date').forEach(header => {
    const date = header.textContent.match(/11\.\d{2}/)?.[0];
    if (date && titles[date]) header.querySelector('span').textContent = titles[date];
  });
})();

(() => {
  const list = document.querySelector('.place-list');
  if (!list) return;
  const headers = [...list.querySelectorAll('.place-date')];
  const first = headers[0];
  headers.forEach(header => {
    const open = header === first;
    header.classList.toggle('is-open', open);
    header.setAttribute('aria-expanded', String(open));
    let node = header.nextElementSibling;
    while (node && !node.classList.contains('place-date')) {
      node.hidden = !open;
      node = node.nextElementSibling;
    }
  });
})();
