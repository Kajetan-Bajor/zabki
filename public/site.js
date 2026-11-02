'use strict';
(() => {
 const $ = (s,root=document) => root.querySelector(s);
 const $$ = (s,root=document) => [...root.querySelectorAll(s)];
 const nativeTransitions='onpageswap' in window && CSS.supports('view-transition-name','root');
 let navigationPending=false;
 function navigateTo(href){
  if(nativeTransitions||window.matchMedia('(prefers-reduced-motion: reduce)').matches){location.assign(href);return;}
  if(navigationPending)return;navigationPending=true;document.body.classList.add('page-leaving');
  setTimeout(()=>location.assign(href),180);
 }
 if(!nativeTransitions)document.body.classList.add('page-fallback');
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
  const url=new URL(a.href,location.href);
  if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;
  if(!nativeTransitions){e.preventDefault();navigateTo(url.href);}
 });
 window.addEventListener('pageshow',()=>{navigationPending=false;document.body.classList.remove('page-leaving');});
 const overlay=$('.menu-overlay'), trigger=$('[aria-label="Menu"]');
 const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let previousFocus,menuOpen=false,menuTimer;
 function menu(open,restoreFocus=true){
  if(!overlay||open===menuOpen)return;
  clearTimeout(menuTimer);menuOpen=open;
  if(open){previousFocus=document.activeElement;overlay.hidden=false;overlay.inert=false;overlay.removeAttribute('aria-hidden');overlay.getBoundingClientRect();}
  overlay.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);
  $('#site-root').inert=open;
  trigger?.setAttribute('aria-expanded',String(open));
  if(open)$('.menu-close',overlay).focus({preventScroll:true});
  else{overlay.inert=true;overlay.setAttribute('aria-hidden','true');menuTimer=setTimeout(()=>{if(!menuOpen)overlay.hidden=true;},reduceMotion()?0:320);if(restoreFocus)previousFocus?.focus({preventScroll:true});}
 }
 trigger?.addEventListener('click',()=>menu(!menuOpen));
 $('.menu-close')?.addEventListener('click',()=>menu(false));
 $('.menu-shade')?.addEventListener('click',()=>menu(false));
 $$('.menu-drawer a').forEach(a=>a.addEventListener('click',()=>menu(false,false)));
 const groups=$$('.nav-group');
 function dropdown(group,open){
  const b=$('.nav-toggle',group),panel=$('.nav-dropdown',group);
  if(open)groups.filter(g=>g!==group).forEach(g=>dropdown(g,false));
  group.classList.toggle('is-open',open);b.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open));panel.inert=!open;
 }
 groups.forEach(group=>{
  let leaveTimer,openedByHover=false;
  const b=$('.nav-toggle',group);
  b.addEventListener('click',()=>{dropdown(group,openedByHover||b.getAttribute('aria-expanded')!=='true');openedByHover=false;});
  group.addEventListener('pointerenter',e=>{clearTimeout(leaveTimer);if(e.pointerType==='mouse'){openedByHover=b.getAttribute('aria-expanded')!=='true';dropdown(group,true);}});
  group.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')leaveTimer=setTimeout(()=>{if(!group.contains(document.activeElement))dropdown(group,false);},140);});
  group.addEventListener('focusout',()=>{setTimeout(()=>{if(!group.contains(document.activeElement))dropdown(group,false);},0);});
  b.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();dropdown(group,true);$('a',group)?.focus();}});
 });
 document.addEventListener('click',e=>{if(!e.target.closest('.parish-nav'))groups.forEach(g=>dropdown(g,false));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')groups.forEach(g=>{if(g.classList.contains('is-open')){dropdown(g,false);$('.nav-toggle',g).focus();}});});
 // Keep the native details semantics while animating their real content height.
 $$('.menu-drawer details').forEach(details=>{
  const summary=$('summary',details),content=$('.drawer-submenu',details);let animation,wantsOpen=details.open;
  summary.addEventListener('click',e=>{
   e.preventDefault();const height=content.getBoundingClientRect().height;
   wantsOpen=!wantsOpen;animation?.cancel();details.open=true;summary.setAttribute('aria-expanded',String(wantsOpen));
   if(reduceMotion()){details.open=wantsOpen;return;}
   animation=content.animate([{height:`${height}px`,opacity:wantsOpen?0:1},{height:wantsOpen?`${content.scrollHeight}px`:'0px',opacity:wantsOpen?1:0}],{duration:280,easing:'cubic-bezier(.22,.61,.36,1)'});
   animation.onfinish=()=>{details.open=wantsOpen;animation=null;};
  });
 });
 window.addEventListener('resize',()=>{if(innerWidth>1000&&menuOpen)menu(false,false);},{passive:true});
 const tabs=$$('[role="tab"]'),panels=$$('[role="tabpanel"]');
 function selectTab(i){
  tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1;t.classList.toggle('TabsList2027980309--current',n===i);});
  panels.forEach((p,n)=>{p.hidden=n!==i;p.setAttribute('aria-hidden',String(n!==i));p.classList.toggle('Tabscomponent1176390459--isVisible',n===i);if(n===i)p.animate([{opacity:0},{opacity:1}],{duration:150});});
 }
 if(tabs.length){selectTab(0);tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectTab(i));t.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(n);tabs[n].focus();}});});}
 $$('[data-open-word]').forEach(a=>a.addEventListener('click',()=>selectTab(1)));
 $('#comp-mk5z79en16')?.addEventListener('click',()=>navigateTo('/wszystkie-posty'));
 $('#comp-mk5zijy216')?.addEventListener('click',()=>navigateTo('/historia-parafii'));
 $$('.like').forEach(b=>{
  const key='parafia-like-'+b.dataset.post;
  const render=()=>{let liked=false;try{liked=localStorage.getItem(key)==='true';}catch{}b.setAttribute('aria-pressed',String(liked));b.textContent=liked?'♥':'♡';};
  b.addEventListener('click',()=>{try{localStorage.setItem(key,String(b.getAttribute('aria-pressed')!=='true'));}catch{}render();});render();
 });
 const gallery=$('.parish-gallery'),slides=$$('.gallery-slide');let index=0,lightbox=null,startX=null;
 function photo(next){if(!slides.length)return;index=(next+slides.length)%slides.length;$('.gallery-track').style.transform=`translateX(-${index*100}%)`;$('.gallery-counter').textContent=`${index+1} / ${slides.length}`;slides.forEach((s,i)=>{s.tabIndex=i===index?0:-1;s.setAttribute('aria-hidden',String(i!==index));});if(lightbox)$('img',lightbox).src=$('img',slides[index]).src;}
 function closePhoto(){lightbox?.remove();lightbox=null;document.body.classList.remove('menu-open');slides[index]?.focus();}
 function openPhoto(i){photo(i);previousFocus=document.activeElement;lightbox=document.createElement('div');lightbox.className='photo-lightbox';lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label','Powiększone zdjęcie parafii');lightbox.innerHTML='<button class="lightbox-close" aria-label="Zamknij zdjęcie">×</button><button class="gallery-arrow previous" aria-label="Poprzednie zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.5 5-7 7 7 7"/></svg></button><img alt="Zdjęcie parafii"><button class="gallery-arrow next" aria-label="Następne zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.5 5 7 7-7 7"/></svg></button>';document.body.append(lightbox);document.body.classList.add('menu-open');$('img',lightbox).src=$('img',slides[index]).src;$('.lightbox-close',lightbox).onclick=closePhoto;$('.previous',lightbox).onclick=()=>photo(index-1);$('.next',lightbox).onclick=()=>photo(index+1);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closePhoto();});$('.lightbox-close',lightbox).focus();}
 if(gallery){photo(0);$('.previous',gallery).onclick=()=>photo(index-1);$('.next',gallery).onclick=()=>photo(index+1);slides.forEach((s,i)=>s.onclick=()=>openPhoto(i));gallery.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;},{passive:true});gallery.addEventListener('touchend',e=>{if(startX!==null){let delta=e.changedTouches[0].clientX-startX;if(Math.abs(delta)>50)photo(index+(delta<0?1:-1));}startX=null;},{passive:true});}
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(lightbox)closePhoto();else if(menuOpen)menu(false);}
  if(lightbox||gallery?.contains(document.activeElement)){if(e.key==='ArrowLeft'){e.preventDefault();photo(index-1);}if(e.key==='ArrowRight'){e.preventDefault();photo(index+1);}}
  const modal=lightbox||(menuOpen?overlay:null);
  if(modal&&e.key==='Tab'){const items=$$('a[href],button,summary,[tabindex="0"]',modal).filter(e=>e.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 });
 // Header stays aligned as the viewport changes orientation or scrollbar width.
 const measure=()=>document.body.style.setProperty('--scrollbar-width',`${window.innerWidth-document.documentElement.clientWidth}px`);
 measure();window.addEventListener('resize',measure,{passive:true});
})();
(() => {
 const share = (url) => window.open(url,'_blank','noopener,noreferrer,width=700,height=600');
 const current = () => encodeURIComponent(window.location.href);
 const title = () => encodeURIComponent(document.title);
 const toast = text => {const e=document.createElement('div');e.className='site-toast';e.setAttribute('role','status');e.textContent=text;document.body.append(e);setTimeout(()=>e.remove(),3000);};
 document.querySelector('[aria-label="Udostępnij na Facebooku"]')?.addEventListener('click',()=>share('https://www.facebook.com/sharer/sharer.php?u='+current()));
 document.querySelector('[aria-label="Udostępnij na X (Twitter)"]')?.addEventListener('click',()=>share('https://twitter.com/intent/tweet?url='+current()+'&text='+title()));
 document.querySelector('[aria-label="Udostępnij na LinkedIn"]')?.addEventListener('click',()=>share('https://www.linkedin.com/sharing/share-offsite/?url='+current()));
 const copy=async()=>{try{await navigator.clipboard.writeText(window.location.href);toast('Link został skopiowany');}catch{toast(window.location.href);}};
 document.querySelector('[aria-label="Udostępnij za pomocą linku"]')?.addEventListener('click',copy);
 document.querySelector('[aria-label="Więcej działań"]')?.addEventListener('click',copy);
})();

// Copy the account as plain digits; fall back to selecting a readonly field.
(() => {
 const button=document.querySelector('[data-copy-account]');if(!button)return;
 button.addEventListener('click',async()=>{
  const value=button.dataset.copyAccount,status=document.querySelector('.copy-account-status');
  try{await navigator.clipboard.writeText(value);status.textContent='Numer rachunku został skopiowany.';}
  catch{let field=document.querySelector('.account-copy-fallback');if(!field){field=document.createElement('input');field.className='account-copy-fallback';field.readOnly=true;field.setAttribute('aria-label','Numer rachunku bez spacji');button.after(field)}field.value=value;field.focus();field.select();status.textContent='Zaznaczony numer możesz skopiować.';}
 });
})();
// Scroll entrances use opacity and a small translation; the image framing stays
// fixed. Direct anchor navigation and reduced-motion users always see content.
(() => {
 if(!document.querySelector('.hero')||!('IntersectionObserver' in window))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;
 const groups=[...document.querySelectorAll('.news-copy,.history-portrait,.history-copy,.gallery-copy,.parish-gallery,.scripture-copy,.information-copy,.info-grid>.wixui-box,#comp-mj6j692c')];
 const observer=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries){if(!isIntersecting)continue;target.classList.remove('home-enter-pending');observer.unobserve(target)}},{threshold:.08,rootMargin:'0px 0px -24px 0px'});
 groups.forEach((element,index)=>{if(element.getBoundingClientRect().top<innerHeight)return;element.style.setProperty('--home-enter-delay',element.parentElement?.classList.contains('info-grid')?`${index%4*70}ms`:'0ms');element.classList.add('home-enter','home-enter-pending');observer.observe(element)});
 reduced.addEventListener('change',()=>{if(reduced.matches){groups.forEach(e=>e.classList.remove('home-enter-pending'));observer.disconnect()}});
})();
