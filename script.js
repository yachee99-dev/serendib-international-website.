(() => {
  'use strict';
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#main-nav');
  if(menu && nav){
    const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')};
    menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
    matchMedia('(min-width: 1021px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
  }
  const year=document.getElementById('year'); if(year)year.textContent=String(new Date().getFullYear());
  const buttons=[...document.querySelectorAll('.catalogue-filter')],cards=[...document.querySelectorAll('.catalogue-card')],count=document.querySelector('.catalogue-count');
  function applyFilter(filter){let visible=0;buttons.forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});cards.forEach(c=>{const match=filter==='all'||c.dataset.category===filter;c.hidden=!match;if(match)visible++});if(count)count.textContent=`Showing ${visible} product ${visible===1?'possibility':'possibilities'}`;}
  buttons.forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.filter)));
  const hash=location.hash.slice(1);if(['spices','coconut','growing','tea'].includes(hash)&&buttons.length)applyFilter(hash);
  // If an image host is blocked or unavailable, show an intentional neutral fallback.
  document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{img.classList.add('image-unavailable');img.setAttribute('aria-label',img.alt||'Image unavailable')},{once:true});if(img.complete&&img.naturalWidth===0)img.classList.add('image-unavailable')});
})();