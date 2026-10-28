const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 const routes=['/','/entreprises/','/offres/','/insights/','/a-propos/','/flex/','/en/','/en/companies/','/en/careers/','/en/insights/','/en/about/','/en/flex/','/nl/','/nl/bedrijven/','/nl/vacatures/','/nl/insights/','/nl/over-ons/','/nl/flex/'];
 const loadImages=async()=>{await page.locator('img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))));};
 let checks=0;
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   await page.goto('http://127.0.0.1:8000'+route);await page.waitForTimeout(60);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow)errors.push(`Overflow ${width} ${route}`);
   if(width<1241){await page.locator('[data-menu]').click();await page.locator('.language-menu summary').click();if(!await page.locator('.language-options').isVisible())errors.push(`Language hidden ${width} ${route}`);await page.keyboard.press('Escape');await page.keyboard.press('Escape');if(await page.locator('[data-menu]').getAttribute('aria-expanded')!=='false')errors.push('Escape mobile menu');}
   checks++;
  }
 }
 // Offers are live from the CRM (job-feed.js); with none published, only the "no offers" message shows.
 for(const route of ['/offres/','/en/careers/','/nl/vacatures/']){
  await page.goto('http://127.0.0.1:8000'+route);
  await page.waitForFunction(()=>!document.querySelector('#job-list[aria-busy]'),null,{timeout:10000});
  const total=await page.locator('[data-job-card]').count();
  if(!total){
   if(!await page.locator('.offers-empty').isVisible())errors.push(`No-offers message ${route}`);
   if(await page.locator('[data-job-filters]').isVisible())errors.push(`Filters without offers ${route}`);
   continue;
  }
  await page.locator('[data-job-search]').fill('zzzz-no-result');
  if(await page.locator('[data-job-card]:visible').count()!==0)errors.push(`Filter ${route}`);
  if(!await page.locator('[data-filter-empty]').isVisible())errors.push(`Empty ${route}`);
  await page.locator('[data-job-search]').fill('');
  if(await page.locator('[data-job-card]:visible').count()!==total)errors.push(`Reset ${route}`);
 }
 await page.goto('http://127.0.0.1:8000/entreprises/');await page.locator('.language-menu summary').click();await page.locator('.language-options a[lang=en]').click();if(!page.url().endsWith('/en/companies/'))errors.push('Equivalent language route');
 await page.goto('http://127.0.0.1:8000/');await page.setViewportSize({width:1440,height:1000});await loadImages();await page.screenshot({path:'qa/home-desktop.png',fullPage:true});await page.setViewportSize({width:375,height:850});await loadImages();await page.screenshot({path:'qa/home-mobile.png',fullPage:true});
 await page.goto('file://'+process.cwd()+'/preview.html');await page.waitForTimeout(200);if(!await page.frameLocator('#preview').locator('h1').count())errors.push('Standalone preview');
 await browser.close();fs.writeFileSync('qa/browser-results.json',JSON.stringify({checks,widths:[320,375,768,1024,1440],errors},null,2));console.log(JSON.stringify({checks,errors}));if(errors.length)process.exitCode=1;
})();
