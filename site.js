const menu=document.querySelector('[data-menu]');const nav=document.querySelector('[data-nav]');if(menu&&nav){menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('open',!expanded)});nav.addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}})}

for(const img of document.querySelectorAll("[data-external-photo]")){const hide=()=>{img.hidden=true;img.style.display="none"};img.addEventListener("error",hide);if(img.complete&&!img.naturalWidth)hide()}

const jobFilters=document.querySelector('[data-job-filters]');
if(jobFilters){
 const cards=[...document.querySelectorAll('[data-job-card]')];
 const search=jobFilters.querySelector('[data-job-search]');
 const sector=jobFilters.querySelector('[data-job-sector]');
 const contract=jobFilters.querySelector('[data-job-contract]');
 const count=document.querySelector('[data-job-count]');
 const empty=document.querySelector('[data-filter-empty]');
 if(!cards.length){jobFilters.hidden=true}
 else {
  const lang=document.documentElement.lang||'fr';
  for(const [select,key] of [[sector,'sector'],[contract,'contract']]){
   const options=[...new Set(cards.map(card=>card.dataset[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,lang));
   for(const value of options)select.add(new Option(value,value));
   if(!options.length)select.parentElement.hidden=true;
  }
  const update=()=>{
   const query=search.value.trim().toLocaleLowerCase(lang);
   let visible=0;
   for(const card of cards){
    const match=card.dataset.search.includes(query)&&(!sector.value||card.dataset.sector===sector.value)&&(!contract.value||card.dataset.contract===contract.value);
    card.hidden=!match;if(match)visible++;
   }
   if(count){count.hidden=false;count.textContent=({fr:`${visible} offre${visible>1?'s':''}`,en:`${visible} open role${visible===1?'':'s'}`,nl:`${visible} vacature${visible===1?'':'s'}`})[lang]||`${visible} roles`}
   if(empty)empty.hidden=visible>0;
  };
  search.addEventListener('input',update);sector.addEventListener('change',update);contract.addEventListener('change',update);update();
 }
}

