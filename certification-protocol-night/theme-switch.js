/* Shared presentation preference. Explorer themes use their matching renderers. */
(() => {
 const current=new URL(location.href),isPost=current.pathname.includes('/blog/');
 const key='lucy-certification-theme';
 const valid=value=>value==='light'||value==='dark';
 const fallback=current.pathname.includes('certification-protocol-night')?'dark':'light';
 let saved;try{saved=localStorage.getItem(key);}catch{}
 let theme=valid(current.searchParams.get('theme'))?current.searchParams.get('theme'):valid(saved)?saved:fallback;
 const root=document.documentElement;
 function variant(href,next){
  const u=new URL(href,location.href);
  u.pathname=u.pathname.replace(/\/certification-protocol(?:-night)?(?=\/|$)/,'/certification-protocol'+(next==='dark'?'-night':''));
  u.searchParams.set('theme',next);return u;
 }
 function remember(next){try{localStorage.setItem(key,next);}catch{}}
 if(!isPost){
  const target=variant(current,theme);
  if(target.pathname!==current.pathname){location.replace(target.href);return;}
 }
 root.dataset.certTheme=theme;root.style.colorScheme=theme;remember(theme);
 function buttons(){
  document.querySelectorAll('[data-cert-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.certThemeChoice===theme)));
 }
 function applyPost(next,persist=true){
  theme=next;root.dataset.certTheme=theme;root.style.colorScheme=theme;if(persist)remember(theme);
  const u=new URL(location.href);u.searchParams.set('theme',theme);history.replaceState(history.state,'',u);
  document.querySelectorAll('a[href]').forEach(a=>{
   const u=new URL(a.getAttribute('href'),location.href);
   if(u.origin===location.origin&&!u.pathname.includes('/blog/')&&/\/certification-protocol(?:-night)?(?:\/|$)/.test(u.pathname))a.href=variant(u,theme).href;
  });
  document.querySelectorAll('iframe[src]').forEach(frame=>{
   let href=frame.getAttribute('src');try{const open=frame.contentWindow.location.href;if(open&&open!=='about:blank')href=open;}catch{}
   const u=new URL(href,location.href);
   if(u.origin!==location.origin||!/\/certification-protocol(?:-night)?(?:\/|$)/.test(u.pathname))return;
   const target=variant(u,theme).href;
   if(target!==u.href)frame.src=target;
  });buttons();
 }
 function mount(){
  const group=document.createElement('nav');group.className='cert-theme-switch';group.setAttribute('aria-label','Colour theme');
  group.innerHTML='<span>Theme</span><button type="button" data-cert-theme-choice="light" aria-pressed="false">Light</button><button type="button" data-cert-theme-choice="dark" aria-pressed="false">Dark</button>';
  if(isPost){
   const host=document.querySelector('[data-night-post],.e-content');if(!host)return;host.prepend(group);applyPost(theme);
  }else{
   const host=document.querySelector('.topbar,.story-all-steps');if(!host)return;
   const reference=host.querySelector('#reference-open');if(reference)host.insertBefore(group,reference);else host.append(group);
  }
  group.addEventListener('click',event=>{
   const button=event.target.closest('[data-cert-theme-choice]');if(!button)return;
   const next=button.dataset.certThemeChoice;if(next===theme)return;
   remember(next);if(isPost)applyPost(next);else location.assign(variant(location.href,next).href);
  });buttons();
  window.addEventListener('storage',event=>{
   if(event.key!==key||!valid(event.newValue)||event.newValue===theme)return;
   if(isPost)applyPost(event.newValue,false);else location.replace(variant(location.href,event.newValue).href);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
