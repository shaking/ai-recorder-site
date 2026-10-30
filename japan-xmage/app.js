const photoGrid=document.querySelector('#photoGrid');
const photoApi='/japan-xmage/api';
const photoFolders=[['2026-11-02','MON · 11.02','抵达东京','航班日'],['2026-11-03','TUE · 11.03','森美术馆与 Tokyo Design Art','森美术馆 · 筑地市场 · 浜离宫恩赐庭园'],['2026-11-04','WED · 11.04','CEKAI、积彩与华为交流','代代木 · 日暮里 · 九段下'],['2026-11-05','THU · 11.05','东京艺术大学与草间弥生美术馆','上野 · 弁天町 · 新宿区'],['2026-11-06','FRI · 11.06','XMage 美学峰会','东京王子饭店花园塔'],['2026-11-07','SAT · 11.07','同行团建 · 看枫叶','地点待定'],['2026-11-08','SUN · 11.08','自由活动','东京漫游']];
if(photoGrid){document.querySelector('#photos header .upload')?.remove();photoGrid.className='photo-folders';photoGrid.innerHTML=photoFolders.map(([key,date,title,place])=>`<article class="photo-folder" data-date="${key}"><button class="folder-head" type="button"><span>${date}</span><strong>${title}</strong><small>${place}</small><i>＋</i></button><div class="folder-body"><div class="folder-actions"><label class="folder-upload">＋ 上传照片<input type="file" accept="image/*" multiple></label><button type="button" data-download="selected" disabled>下载所选 (0)</button><button type="button" data-download="all" disabled>全部下载</button></div><p class="folder-status" aria-live="polite"></p><div class="folder-grid"><p class="folder-empty">还没有照片</p></div></div></article>`).join('');const folders=[...photoGrid.querySelectorAll('.photo-folder')];const updateActions=folder=>{const tiles=[...folder.querySelectorAll('.tile')];const selected=tiles.filter(tile=>tile.querySelector('input[type="checkbox"]')?.checked);const selectedButton=folder.querySelector('[data-download="selected"]');const allButton=folder.querySelector('[data-download="all"]');selectedButton.textContent=`下载所选 (${selected.length})`;selectedButton.disabled=selected.length===0;allButton.disabled=tiles.length===0};const addPhotoTile=(folder,file)=>{const grid=folder.querySelector('.folder-grid');grid.querySelector('.folder-empty')?.remove();const tile=document.createElement('div');tile.className='tile';tile.dataset.url=file.url;tile.dataset.filename=file.name;tile.style.backgroundImage=`linear-gradient(180deg,transparent 45%,rgba(0,0,0,.65)),url(${file.url})`;tile.innerHTML=`<label class="photo-select"><input type="checkbox"><span>选择</span></label><span>${file.name}<br><small>服务器原图</small></span>`;grid.prepend(tile);updateActions(folder)};const loadFolder=async folder=>{try{const response=await fetch(`${photoApi}/photos?date=${folder.dataset.date}`);if(!response.ok)throw new Error('load failed');const data=await response.json();folder.querySelector('.folder-grid').innerHTML='';if(!data.files.length)folder.querySelector('.folder-grid').innerHTML='<p class="folder-empty">还没有照片</p>';data.files.reverse().forEach(file=>addPhotoTile(folder,file));folder.dataset.loaded='true';updateActions(folder)}catch(error){folder.querySelector('.folder-status').textContent='照片读取失败，请稍后重试'}};const downloadTiles=tiles=>tiles.forEach((tile,index)=>{const link=document.createElement('a');link.href=tile.dataset.url;link.download=tile.dataset.filename||`photo-${index+1}.jpg`;document.body.appendChild(link);link.click();link.remove()});folders.forEach(folder=>folder.querySelector('.folder-head').addEventListener('click',()=>{const open=folder.classList.contains('is-open');folders.forEach(item=>item.classList.remove('is-open'));if(!open){folder.classList.add('is-open');if(!folder.dataset.loaded)loadFolder(folder)}}));photoGrid.addEventListener('change',async event=>{const input=event.target;if(input.matches('input[type="checkbox"]')){updateActions(input.closest('.photo-folder'));return}if(!input.matches('input[type="file"]'))return;const folder=input.closest('.photo-folder');if(!input.files.length)return;const formData=new FormData();formData.append('date',folder.dataset.date);[...input.files].forEach(file=>formData.append('photos',file,file.name));const status=folder.querySelector('.folder-status');status.textContent='正在上传…';try{const response=await fetch(`${photoApi}/upload`,{method:'POST',body:formData});if(!response.ok)throw new Error('upload failed');folder.dataset.loaded='';await loadFolder(folder);status.textContent='上传完成'}catch(error){status.textContent='上传失败，请重试'}input.value=''});photoGrid.addEventListener('click',event=>{const button=event.target.closest('button[data-download]');if(!button)return;const folder=button.closest('.photo-folder');const tiles=[...folder.querySelectorAll('.tile')];downloadTiles(button.dataset.download==='selected'?tiles.filter(tile=>tile.querySelector('input[type="checkbox"]')?.checked):tiles)})}
const places={
  mori:{name:'森美术馆',lat:35.6605,lng:139.7292},
  cekai:{name:'CEKAI · 代代木',lat:35.6830,lng:139.7021},
  tsuboi:{name:'坪井尚浩工作室 · 樱新町',lat:35.6308,lng:139.6463},
  shibuya:{name:'涩谷 / WOW',lat:35.6595,lng:139.7005},
  sekisai:{name:'积彩 · 日暮里',lat:35.7281,lng:139.7708},
  teamlab:{name:'teamLab Borderless · 麻布台 Hills',lat:35.662,lng:139.74342},
  prince:{name:'东京王子饭店花园塔',lat:35.6578,lng:139.7483},
  kawaguchiko:{name:'富士山 · 山中湖',lat:35.4189,lng:138.8849},
  kudan:{name:'九段下代表处',lat:35.6956,lng:139.7524}
  ,hotel:{name:'新高轮王子大酒店',lat:35.6287,lng:139.7346}
  ,mercureHaneda:{name:'东京羽田机场美居酒店',lat:35.55196,lng:139.74326}
  ,haneda:{name:'东京羽田机场',lat:35.5494,lng:139.7798}
  ,narita:{name:'东京成田机场',lat:35.7653,lng:140.3856}
  ,teamlabPlanets:{name:'teamLab Planets TOKYO · 丰洲',lat:35.6463,lng:139.7890}
  ,eastGardens:{name:'皇居东御苑',lat:35.6852,lng:139.7587}
  ,sannomaru:{name:'皇居三之丸尚藏馆',lat:35.6857,lng:139.7587}
  ,designart:{name:'DESIGNART TOKYO · 银座主会场',lat:35.6718,lng:139.7671}
  ,meiji:{name:'明治神宫',lat:35.6764,lng:139.6993}
  ,catOmotesando:{name:'猫街 · 表参道',lat:35.6678,lng:139.7074}
  ,nezu:{name:'根津美术馆',lat:35.6598,lng:139.7185}
  ,nact:{name:'国立新美术馆',lat:35.6653,lng:139.7264}
};
const placeList=document.querySelector('.place-list');
const teamLabDate=[...document.querySelectorAll('.place-date')].find(el=>el.textContent.includes('11.06'));
if(placeList&&teamLabDate&&!placeList.querySelector('[data-place="teamlab"]')){teamLabDate.insertAdjacentHTML('beforebegin','<div data-place="teamlab" class="place-card" role="button" tabindex="0"><b>09</b><span><strong>teamLab Borderless</strong><small>麻布台 Hills Garden Plaza B B1 · 港区</small></span><a class="map-link" href="https://www.google.com/maps/search/teamLab+Borderless+Azabudai+Hills+Garden+Plaza+B+B1" target="_blank" rel="noopener" aria-label="在 Google Maps 打开 teamLab Borderless 麻布台">↗</a></div>');const princeCard=placeList.querySelector('[data-place="prince"]');if(princeCard)princeCard.querySelector('b').textContent='10'}
const placeDates=[...document.querySelectorAll('.place-date')];
const setPlaceGroup=(active)=>placeDates.forEach(header=>{const open=header===active;header.classList.toggle('is-open',open);header.setAttribute('aria-expanded',String(open));let node=header.nextElementSibling;while(node&&!node.classList.contains('place-date')){node.hidden=!open;node=node.nextElementSibling}});
placeDates.forEach(header=>{header.setAttribute('role','button');header.setAttribute('tabindex','0');header.addEventListener('click',()=>setPlaceGroup(header));header.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setPlaceGroup(header)}})});
document.querySelectorAll('.place-card').forEach(card=>{if(card.nextElementSibling&&card.nextElementSibling.classList.contains('place-date'))card.style.borderBottom='0'});
if(placeDates[0])setPlaceGroup(placeDates[0]);
const mapEl=document.querySelector('#tokyoMap');
if(window.BMap&&mapEl){
  const map=new BMap.Map(mapEl);
  const initialPoint=new BMap.Point(139.77,35.66);
  map.centerAndZoom(initialPoint,12);
  map.enableScrollWheelZoom();
  map.enableDragging();
  const markerIcon=selected=>{
    const size=selected?30:20;
    const radius=selected?12:8;
    const fill=selected?'#ff5b22':'#df8b68';
    const stroke=selected?'3':'2';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="${fill}" stroke="#fff" stroke-width="${stroke}"/></svg>`;
    return new BMap.Icon(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,new BMap.Size(size,size),{anchor:new BMap.Size(size/2,size/2)});
  };
  const infoWindow=new BMap.InfoWindow('',{width:260,height:32,title:'',enableMessage:false});
  const markers={};
  Object.entries(places).forEach(([id,place],index)=>{
    const point=new BMap.Point(place.lng,place.lat);
    const marker=new BMap.Marker(point);
    marker.setIcon(markerIcon(false));
    marker.addEventListener('click',()=>selectPlace(id,true));
    map.addOverlay(marker); markers[id]=marker;
  });
  let selectedId=null;
  const resetSelection=()=>{
    Object.values(markers).forEach(marker=>marker.setIcon(markerIcon(false)));
    document.querySelectorAll('[data-place]').forEach(el=>el.classList.remove('selected'));
    infoWindow.close();
    selectedId=null;
    map.centerAndZoom(initialPoint,12);
  };
  const selectPlace=(id,fromMarker=false)=>{
    Object.entries(markers).forEach(([key,marker])=>marker.setIcon(markerIcon(key===id)));
    document.querySelectorAll('[data-place]').forEach(el=>el.classList.toggle('selected',el.dataset.place===id));
    selectedId=id;
    const place=places[id];
    const point=new BMap.Point(place.lng,place.lat);
    map.centerAndZoom(point,14);
    infoWindow.setTitle(place.name);
    infoWindow.setContent('');
    map.openInfoWindow(infoWindow,point);
  };
  const syncMapMarkers=()=>{
    const activeIds=new Set([...document.querySelectorAll('.place-list [data-place]')].map(el=>el.dataset.place));
    Object.entries(markers).forEach(([id,marker])=>{
      if(activeIds.has(id))map.addOverlay(marker);
      else map.removeOverlay(marker);
    });
    if(selectedId&&!activeIds.has(selectedId))resetSelection();
  };
  window.selectPlace=selectPlace;
  window.syncMapMarkers=syncMapMarkers;
  const bindPlace=el=>{
    el.dataset.bound='true';
    const choose=()=>selectPlace(el.dataset.place);
    el.addEventListener('click',event=>{if(event.target.closest('.map-link'))return;choose()});
    el.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.map-link')){event.preventDefault();choose()}});
  };
  document.querySelectorAll('[data-place]').forEach(bindPlace);
  // Some place cards are inserted later by schedule-update.js. Delegate the
  // interaction so newly added days use the same map-selection path.
  placeList?.addEventListener('click',event=>{
    const card=event.target.closest('[data-place]');
    if(!card||!placeList.contains(card)||event.target.closest('.map-link'))return;
    selectPlace(card.dataset.place);
  });
  placeList?.addEventListener('keydown',event=>{
    const card=event.target.closest('[data-place]');
    if(!card||!placeList.contains(card)||event.target.closest('.map-link'))return;
    if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPlace(card.dataset.place)}
  });
} else if(mapEl){
  mapEl.innerHTML='<p class="map-error">地图加载失败，请刷新页面重试。</p>';
}
const dayCards=[...document.querySelectorAll('.day')];
const mobileDays=window.matchMedia('(max-width:720px)');
const setDayOpen=active=>dayCards.forEach(day=>day.classList.toggle('is-open',day===active));
dayCards.forEach((day,index)=>day.addEventListener('click',event=>{if(mobileDays.matches&&!event.target.closest('a')){event.stopPropagation();setDayOpen(day.classList.contains('is-open')?null:day)}const ids=[null,null,'cekai','sekisai','prince',null,null,'tsuboi',null];if(ids[index]&&window.selectPlace)window.selectPlace(ids[index])}));
