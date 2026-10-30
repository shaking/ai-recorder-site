(() => {
  const toggle = document.querySelector('#itineraryModeToggle');
  const label = document.querySelector('#itineraryModeLabel');
  const arrivalDay = [...document.querySelectorAll('.day')].find(day => day.textContent.includes('11.02'));
  const thirdDay = [...document.querySelectorAll('.day')].find(day => day.textContent.includes('11.03'));
  const fourthDay = [...document.querySelectorAll('.day')].find(day => day.textContent.includes('11.04'));
  const seventhDay = [...document.querySelectorAll('.day')].find(day => day.textContent.includes('11.07'));
  const returnDay = [...document.querySelectorAll('.day')].find(day => day.textContent.includes('11.08'));
  if (!toggle || !label || !arrivalDay || !thirdDay || !fourthDay || !seventhDay || !returnDay) return;

  if (!arrivalDay.querySelector('.slots > div:nth-child(3) strong') || !seventhDay.querySelector('.slots > div:nth-child(4) strong') || !returnDay.querySelector('.slots > div:nth-child(2) strong')) return;

  const modeFromUrl = new URLSearchParams(window.location.search).get('mode');
  let mode = modeFromUrl === 'personal' ? 'personal' : 'public';

  const flight = {
    shenzhenOutbound: '17:25 起飞·全日空 NH966<br>深圳宝安 → 东京羽田<br>22:20 抵达',
    shanghaiOutbound: '13:05 起飞·日本航空 JL082<br>上海虹桥 → 东京羽田<br>16:50 抵达',
    shenzhenReturn: '19:00 起飞·深圳航空 ZH652<br>东京成田 T1 → 深圳宝安<br>23:05 抵达',
    shanghaiReturn: '13:30 起飞·东方航空 MU8632<br>东京羽田 → 上海虹桥<br>15:45 抵达<br>（上海航空 FM816 执飞）'
  };

  const thirdDayPlaceHeader = [...document.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.03'));
  const fourthDayPlaceHeader = [...document.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.04'));
  const thirdDayPublicTitle = thirdDay.querySelector('h3').innerHTML;
  const thirdDayPublicSlots = thirdDay.querySelector('.slots').innerHTML;
  const collectPlaces = header => {
    if (!header) return '';
    const nodes = [];
    let node = header.nextElementSibling;
    while (node && !node.classList.contains('place-date')) {
      nodes.push(node.outerHTML);
      node = node.nextElementSibling;
    }
    return nodes.join('');
  };
  const thirdDayPublicPlaces = collectPlaces(thirdDayPlaceHeader);
  const fourthDayPublicTitle = fourthDay.querySelector('h3').innerHTML;
  const fourthDayPublicSlots = fourthDay.querySelector('.slots').innerHTML;
  const fourthDayPublicPlaces = collectPlaces(fourthDayPlaceHeader);
  const personalDay3Title = '原宿、表参道<br>根津美术馆与六本木';
  const personalDay3Slots = '<div><b>上午</b><strong>09:00–09:40 打车·预计用时 40 分钟<br>09:40–10:30 明治神宫<br>神宫参道、森林景观<br>10:30–11:30 猫街、表参道<br>潮流店铺、建筑、街头摄影</strong></div><div><b>中午</b><strong>11:30–12:30 午餐<br>表参道附近</strong></div><div><b>下午</b><strong>12:30–14:00 参观·根津美术馆<br>隈研吾建筑、庭园<br>14:00–14:30 前往六本木<br>14:30–15:15 参观·国立新美术馆<br>黑川纪章建筑、室内空间</strong></div><div><b>晚上</b><strong>15:30–17:30 参观·森美术馆<br>森万里子展<br>17:30以后 六本木晚餐<br>自由活动</strong></div>';
  const personalDay3Places = '<div data-place="meiji" class="place-card" role="button" tabindex="0"><b>01</b><span><strong>明治神宫</strong><small>神宫前 · 涩谷区</small></span><a class="map-link" href="https://www.google.com/maps/search/Meiji+Jingu+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开明治神宫">↗</a></div><div data-place="catOmotesando" class="place-card" role="button" tabindex="0"><b>02</b><span><strong>猫街 · 表参道</strong><small>神宫前 · 涩谷区</small></span><a class="map-link" href="https://www.google.com/maps/search/Cat+Street+Omotesando+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开猫街表参道">↗</a></div><div data-place="nezu" class="place-card" role="button" tabindex="0"><b>03</b><span><strong>根津美术馆</strong><small>南青山 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/Nezu+Museum+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开根津美术馆">↗</a></div><div data-place="nact" class="place-card" role="button" tabindex="0"><b>04</b><span><strong>国立新美术馆</strong><small>六本木 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/The+National+Art+Center+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开国立新美术馆">↗</a></div><div data-place="mori" class="place-card" role="button" tabindex="0"><b>05</b><span><strong>森美术馆</strong><small>六本木 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/Mori+Art+Museum+Tokyo" target="_blank" rel="noopener" aria-label="在 Google Maps 打开森美术馆">↗</a></div>';
  const replacePlaceGroup = (header, html) => {
    if (!header) return;
    const oldFirst = header.nextElementSibling;
    const wasHidden = oldFirst?.hidden ?? true;
    let node = oldFirst;
    while (node && !node.classList.contains('place-date')) {
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
    header.insertAdjacentHTML('afterend', html);
    let card = header.nextElementSibling;
    while (card && !card.classList.contains('place-date')) {
      card.hidden = wasHidden;
      card = card.nextElementSibling;
    }
  };

  const setMode = nextMode => {
    mode = nextMode === 'personal' ? 'personal' : 'public';
    const personal = mode === 'personal';
    const arrival = arrivalDay.querySelector('.slots > div:nth-child(3) strong');
    const seventhEvening = seventhDay.querySelector('.slots > div:nth-child(4) strong');
    const returning = returnDay.querySelector('.slots > div:nth-child(2) strong');
    arrival.innerHTML = personal ? flight.shanghaiOutbound : flight.shenzhenOutbound;
    seventhEvening.innerHTML = personal
      ? '入住·东京羽田机场美居酒店<br>1-2-11, Haneda, Ohta-ku<br>144-0043 Tokyo, Japan'
      : '团建晚餐<br>安排中';
    returning.innerHTML = personal ? flight.shanghaiReturn : flight.shenzhenReturn;

    thirdDay.querySelector('h3').innerHTML = thirdDayPublicTitle;
    thirdDay.querySelector('.slots').innerHTML = thirdDayPublicSlots;
    if (thirdDayPlaceHeader) {
      thirdDayPlaceHeader.querySelector('span').textContent = 'Tokyo Design Art、皇居与 teamLab Planets';
      replacePlaceGroup(thirdDayPlaceHeader, thirdDayPublicPlaces);
    }
    fourthDay.querySelector('h3').innerHTML = personal ? personalDay3Title : fourthDayPublicTitle;
    fourthDay.querySelector('.slots').innerHTML = personal ? personalDay3Slots : fourthDayPublicSlots;
    if (fourthDayPlaceHeader) {
      fourthDayPlaceHeader.querySelector('span').textContent = personal ? '原宿、表参道、根津美术馆与六本木' : 'CEKAI、森美术馆与 WOW';
      replacePlaceGroup(fourthDayPlaceHeader, personal ? personalDay3Places : fourthDayPublicPlaces);
    }

    const placeList = document.querySelector('.place-list');
    const seventhHeader = [...document.querySelectorAll('.place-date')].find(item => item.textContent.includes('11.07'));
    const lakeCard = placeList?.querySelector('[data-place="kawaguchiko"]');
    const mercureCard = placeList?.querySelector('[data-place="mercureHaneda"]');
    if (personal && placeList && seventhHeader && !mercureCard) {
      const card = document.createElement('div');
      card.dataset.place = 'mercureHaneda';
      card.className = 'place-card';
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.innerHTML = '<b>12</b><span><strong>东京羽田机场美居酒店</strong><small>1-2-11, Haneda, Ohta-ku · 144-0043 Tokyo</small></span><a class="map-link" href="https://www.google.com/maps/search/Mercure+Tokyo+Haneda+Airport" target="_blank" rel="noopener" aria-label="在 Google Maps 打开东京羽田机场美居酒店">↗</a>';
      if (lakeCard) {
        card.hidden = lakeCard.hidden;
        lakeCard.after(card);
      } else {
        seventhHeader.after(card);
      }
    } else if (!personal && mercureCard) {
      mercureCard.remove();
    }
    if (seventhHeader) {
      const title = seventhHeader.querySelector('span');
      if (title) title.textContent = personal ? '同行团建 · 富士山山中湖 · 夜宿羽田' : '同行团建 · 富士山山中湖';
    }
    label.textContent = personal ? '个人行程' : '公共行程';
    toggle.textContent = personal ? '切换到公共行程' : '切换到个人行程';
    toggle.setAttribute('aria-pressed', String(personal));
    document.body.dataset.itineraryMode = mode;
    window.syncMapMarkers?.();
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    window.history.replaceState(null, '', url);
  };

  toggle.addEventListener('click', () => setMode(mode === 'public' ? 'personal' : 'public'));
  setMode(mode);
})();
