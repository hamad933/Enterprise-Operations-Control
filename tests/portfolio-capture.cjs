const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.RP02_PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173';
const outputDir = process.env.RP02_PORTFOLIO_OUTPUT || path.join(process.cwd(), 'portfolio-evidence');
const viewports = [
  ['desktop', 1440, 960],
  ['tablet', 900, 1024],
  ['mobile', 390, 844]
];
const surfaces = [
  ['s01','/app/index.html','#attentionHeading'],
  ['s02','/app/work-queue.html','#queueList'],
  ['s03','/app/operations.html?surface=sites','#surfaceTitle'],
  ['s04','/app/operations.html?surface=performance','#surfaceTitle'],
  ['s05','/app/operations.html?surface=decisions','#surfaceTitle'],
  ['s06','/app/operations.html?surface=reviews','#surfaceTitle'],
  ['s07','/app/operations.html?surface=reports','#surfaceTitle'],
  ['s08','/app/operations.html?surface=administration','#surfaceTitle']
];

fs.mkdirSync(outputDir,{recursive:true});

async function open(browser,target,viewport){
  const page=await browser.newPage({viewport:{width:viewport[1],height:viewport[2]},deviceScaleFactor:1});
  const consoleErrors=[]; const pageErrors=[];
  page.on('console',message=>{ if(message.type()==='error') consoleErrors.push(message.text()); });
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(`${baseUrl}${target[1]}`,{waitUntil:'networkidle'});
  await page.locator(target[2]).waitFor({state:'visible'});
  await page.waitForFunction(()=>document.documentElement.dataset.portfolioReady==='true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}'});
  await page.evaluate(async()=>{ if(document.fonts?.ready) await document.fonts.ready; scrollTo(0,0); });
  const size=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  assert.ok(size.scrollWidth<=size.clientWidth+1,`${target[0]}/${viewport[0]} overflow`);
  assert.deepEqual(consoleErrors,[],`${target[0]}/${viewport[0]} console errors`);
  assert.deepEqual(pageErrors,[],`${target[0]}/${viewport[0]} page errors`);
  return page;
}

async function snapElement(page,selector,name){
  const node=page.locator(selector).first();
  assert.ok(await node.count(),`${name}: missing ${selector}`);
  await node.scrollIntoViewIfNeeded();
  await node.screenshot({path:path.join(outputDir,name)});
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const viewport of viewports){
      for(const target of surfaces){
        const page=await open(browser,target,viewport);
        await page.screenshot({path:path.join(outputDir,`${target[0]}-${viewport[0]}.png`),fullPage:false});
        await page.close();
      }
    }

    const desktop=viewports[0];
    let page=await open(browser,surfaces[0],desktop);
    await snapElement(page,'.route-panel','focus-s01-route-ribbon.png');
    await page.locator('.ledger-row').first().click();
    await page.locator('#focusPanel.open').waitFor();
    await snapElement(page,'#focusPanel','focus-s01-authority-aperture.png');
    await page.close();

    page=await open(browser,surfaces[1],desktop);
    await snapElement(page,'#focusTask','focus-s02-task.png');
    await page.close();

    page=await open(browser,surfaces[2],desktop);
    await page.locator('[data-asset="UTIL-04"]').click();
    await snapElement(page,'.surface-side','focus-s03-asset-authority.png');
    await page.close();

    page=await open(browser,surfaces[3],desktop);
    await snapElement(page,'.kpi-contract','focus-s04-kpi-definition.png');
    await snapElement(page,'.process-ribbon','focus-s04-progression.png');
    await page.close();

    page=await open(browser,surfaces[4],desktop);
    await page.locator('[data-deviation="DEV-118"]').click();
    await snapElement(page,'#decisionAuthority','focus-s05-authority-denied.png');
    await page.locator('[data-deviation="DEV-203"]').click();
    await snapElement(page,'#decisionAuthority','focus-s05-authority-allowed.png');
    await page.close();

    page=await open(browser,surfaces[5],desktop);
    await page.locator('[data-review="REV-812"]').click();
    await snapElement(page,'.surface-side','focus-s06-rejected-rework.png');
    await page.locator('[data-review="REV-884"]').click();
    await snapElement(page,'.surface-side','focus-s06-approval-ready.png');
    await page.close();

    page=await open(browser,surfaces[6],desktop);
    await snapElement(page,'#auditTimeline','focus-s07-chronology.png');
    await page.close();

    page=await open(browser,surfaces[7],desktop);
    await page.locator('[data-profile="USR-099"]').click();
    await page.locator('[data-action="check-access"]').click();
    await snapElement(page,'.access-columns','focus-s08-access-vs-authority.png');
    await page.close();

    fs.writeFileSync(path.join(outputDir,'README.txt'),[
      'Enterprise Operations portfolio evidence',
      '24 exact-viewport page screenshots: S01–S08 at desktop 1440x960, tablet 900x1024, and mobile 390x844.',
      'Focused evidence: S01 route/authority, S02 focus task, S03 asset authority, S04 definition/progression, S05 negative/positive authority, S06 rejected/approval, S07 chronology, S08 access-vs-authority.',
      'All captures assert zero console/page errors and no horizontal overflow before writing.'
    ].join('\n'));
    console.log(`Portfolio evidence captured: ${fs.readdirSync(outputDir).length} files`);
  }finally{ await browser.close(); }
})().catch(error=>{ console.error('Portfolio capture failed',error); process.exitCode=1; });
