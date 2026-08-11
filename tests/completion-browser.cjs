const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.RP02_COMPLETION_BASE_URL || 'http://127.0.0.1:4173/app';
const consoleErrors = [];
const pageErrors = [];
const results = [];

function record(name, detail = 'OK') {
  results.push({ name, detail });
  console.log(`[COMPLETION_BROWSER] ${name}: ${detail}`);
}

function attach(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`${label}: ${message.text()}`);
  });
  page.on('pageerror', (error) => pageErrors.push(`${label}: ${error.message}`));
}

async function gotoSurface(page, surface, state = '') {
  const suffix = state ? `&state=${state}` : '';
  await page.goto(`${baseUrl}/operations.html?surface=${surface}${suffix}`, { waitUntil: 'networkidle' });
  await page.locator('#surfaceTitle').waitFor({ state: 'visible' });
}

async function testSurfaceLoading(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  attach(page, 'surfaces');

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#attentionHeading').innerText(), 'أولويات الانتباه');
  record('S01 loads');

  await page.goto(`${baseUrl}/work-queue.html`, { waitUntil: 'networkidle' });
  assert.match(await page.locator('#queueHeading').innerText(), /قائمة الأعمال/);
  record('S02 loads');

  const expected = {
    sites: 'المواقع والأصول',
    performance: 'الأداء ومؤشرات القياس',
    decisions: 'الانحرافات والقرارات',
    reviews: 'المراجعات والاعتمادات',
    reports: 'التقارير والتدقيق',
    administration: 'الإدارة والوصول'
  };
  for (const [surface, title] of Object.entries(expected)) {
    await gotoSurface(page, surface);
    assert.equal(await page.locator('#surfaceTitle').innerText(), title);
    assert.equal(await page.locator('html').getAttribute('lang'), 'ar');
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    record(`${surface} loads`);
  }

  await page.close();
}

async function testGlobalNavigation(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  attach(page, 'navigation');
  await gotoSurface(page, 'sites');

  const hrefs = await page.locator('#completionNav a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  assert.deepEqual(hrefs, [
    './index.html', './work-queue.html', './operations.html?surface=sites', './operations.html?surface=performance',
    './operations.html?surface=decisions', './operations.html?surface=reviews', './operations.html?surface=reports', './operations.html?surface=administration'
  ]);
  record('All global navigation destinations present');

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.locator('.top-nav [data-placeholder*="المواقع"]').first().click();
  await page.waitForURL(/operations\.html\?surface=sites$/);
  assert.equal(await page.locator('#surfaceTitle').innerText(), 'المواقع والأصول');
  record('S01 → S03 navigation');

  await page.goto(`${baseUrl}/work-queue.html`, { waitUntil: 'networkidle' });
  await page.locator('.top-nav [data-placeholder*="التحقق"]').first().click();
  await page.waitForURL(/operations\.html\?surface=reviews$/);
  assert.equal(await page.locator('#surfaceTitle').innerText(), 'المراجعات والاعتمادات');
  record('S02 → S06 navigation');

  await page.close();
}

async function testSites(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  attach(page, 'sites');
  await gotoSurface(page, 'sites');

  assert.match(await page.locator('#assetAuthority').innerText(), /AUTHORIZED/);
  assert.equal(await page.locator('#assetActionButton').isDisabled(), false);
  await page.locator('[data-asset="UTIL-04"]').click();
  assert.match(await page.locator('#assetAuthority').innerText(), /AUTHORITY_DENIED/);
  assert.equal(await page.locator('#assetActionButton').isDisabled(), true);
  assert.match(await page.locator('.detail-title').innerText(), /UTIL-04/);
  record('Sites & Assets exact-site authority positive and negative paths');

  await page.locator('#completionSearch').fill('لا-يوجد-أصل');
  assert.match(await page.locator('#assetList').innerText(), /لا توجد أصول مطابقة/);
  record('Sites & Assets empty search state');
  await page.close();
}

async function testKpis(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  attach(page, 'performance');
  await gotoSurface(page, 'performance');

  const contract = await page.locator('[data-kpi-contract]').innerText();
  for (const required of ['Source', 'Scope', 'Period', 'Owner', 'Target', 'Threshold', 'Current observation', 'Evidence / lineage']) {
    assert.match(contract, new RegExp(required.replace('/', '\\/')));
  }
  assert.match(contract, /KPI-HVAC-04|EV-KPI-441|SRC-HVAC-09/);
  assert.equal(await page.locator('#kpiDecisionState').innerText(), 'DECISION_NOT_CREATED');
  await page.locator('[data-action="validate-kpi"]').click();
  assert.equal(await page.locator('#kpiDecisionState').innerText(), 'DECISION_NOT_CREATED');
  assert.match(await page.locator('#completionToast').innerText(), /لم يُنشأ قرار أو إجراء تلقائي/);
  record('KPI contract and non-automatic decision semantics');
  await page.close();
}

async function testDecisions(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  attach(page, 'decisions');
  await gotoSurface(page, 'decisions');

  assert.match(await page.locator('#decisionAuthority').innerText(), /AUTHORIZED/);
  const button = page.locator('[data-action="decide"]');
  assert.equal(await button.isDisabled(), false);
  await button.click();
  assert.match(await page.locator('.surface-side').innerText(), /DECIDED/);
  assert.match(await page.locator('.surface-side').innerText(), /مراقبة النتيجة/);
  record('Deviation → decision positive path');

  await page.locator('[data-deviation="DEV-118"]').click();
  assert.match(await page.locator('#decisionAuthority').innerText(), /AUTHORITY_DENIED/);
  assert.equal(await page.locator('[data-action="decide"]').isDisabled(), true);
  await page.locator('[data-deviation="DEV-054"]').click();
  assert.match(await page.locator('#decisionAuthority').innerText(), /EVIDENCE_MISSING/);
  assert.match(await page.locator('.surface-side').innerText(), /CORRECTIVE_ACTION_OVERDUE/);
  await page.locator('[data-deviation="DEV-244"]').click();
  assert.match(await page.locator('#decisionAuthority').innerText(), /CONFLICT/);
  record('Decision authority denied, evidence-missing, conflict, and overdue states');
  await page.close();
}

async function testReviews(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  attach(page, 'reviews');
  await gotoSurface(page, 'reviews');

  assert.match(await page.locator('#reviewAuthority').innerText(), /AUTHORIZED/);
  await page.locator('[data-action="approve-review"]').click();
  assert.match(await page.locator('.surface-side').innerText(), /APPROVED/);
  record('Approval positive path');

  await page.locator('[data-review="REV-901"]').click();
  assert.match(await page.locator('#reviewAuthority').innerText(), /AUTHORITY_DENIED/);
  assert.match(await page.locator('#reviewAuthority').innerText(), /Reviewer/);
  assert.equal(await page.locator('[data-action="approve-review"]').isDisabled(), true);
  await page.locator('[data-review="REV-812"]').click();
  assert.match(await page.locator('.surface-side').innerText(), /VERIFICATION_REJECTED/);
  assert.match(await page.locator('.surface-side').innerText(), /RW-02/);
  assert.equal(await page.locator('[data-action="approve-review"]').isDisabled(), true);
  record('Review separation, rejected verification, and rework lineage');
  await page.close();
}

async function testAuditAndAdmin(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  attach(page, 'audit-admin');
  await gotoSurface(page, 'reports');
  assert.ok(await page.locator('.audit-event').count() >= 5);
  await page.locator('[data-audit-filter="AUTHORITY_DENIED"]').click();
  assert.equal(await page.locator('.audit-event').count(), 1);
  assert.match(await page.locator('#auditTimeline').innerText(), /AUD-1105/);
  record('Audit timeline and scoped filter');

  await gotoSurface(page, 'administration');
  await page.locator('[data-profile="USR-099"]').click();
  assert.match(await page.locator('.detail-sub').innerText(), /ADMIN/);
  assert.match(await page.locator('#accessCheckResult').innerText(), /AUTHORITY_DENIED/);
  await page.locator('[data-action="check-access"]').click();
  assert.match(await page.locator('#accessCheckResult').innerText(), /ADMIN/);
  assert.match(await page.locator('#accessCheckResult').innerText(), /لا يملك سلطة تشغيلية تلقائية/);
  record('Administration has no Admin operational-authority bypass');
  await page.close();
}

async function testRequiredStates(browser) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
  attach(page, 'states');
  for (const state of ['loading', 'empty', 'partial', 'error', 'readonly']) {
    await gotoSurface(page, 'decisions', state);
    assert.equal(await page.locator('#surfaceState').isVisible(), true);
    if (state === 'readonly') {
      assert.equal(await page.locator('[data-action="decide"]').isDisabled(), true);
    }
  }
  record('LOADING / EMPTY / PARTIAL_DATA / ERROR / READ_ONLY states');
  await page.close();
}

async function testResponsive(browser, width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  attach(page, `responsive-${label}`);
  for (const surface of ['sites', 'performance', 'decisions', 'reviews', 'reports', 'administration']) {
    await gotoSurface(page, surface);
    const size = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      mobileNav: getComputedStyle(document.querySelector('.completion-mobile-nav')).display
    }));
    assert.ok(size.scrollWidth <= size.clientWidth + 1, `${label}/${surface}: horizontal overflow ${size.scrollWidth} > ${size.clientWidth}`);
    if (label === 'mobile') assert.equal(size.mobileNav, 'grid');
  }
  record(`${label} responsive`, `${width}x${height}, all S03-S08 no horizontal overflow`);
  await page.close();
}

async function testKeyboardAndRtl(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  attach(page, 'keyboard');
  await gotoSurface(page, 'performance');

  let reachedSearch = false;
  for (let index = 0; index < 18; index += 1) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.id === 'completionSearch')) {
      reachedSearch = true;
      break;
    }
  }
  assert.equal(reachedSearch, true);
  const focus = await page.locator('#completionSearch').evaluate((node) => {
    const style = getComputedStyle(node);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  assert.notEqual(focus.outlineStyle, 'none');
  assert.notEqual(focus.outlineWidth, '0px');
  assert.ok((await page.locator('bdi[dir="ltr"]').count()) > 5);
  const searchName = await page.locator('#completionSearch').evaluate((node) => node.labels?.[0]?.innerText.trim() || node.getAttribute('aria-label') || '');
  assert.ok(searchName.length > 0);
  record('Keyboard-only navigation and visible focus');
  record('Accessible names and Arabic RTL / LTR identifiers');
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testSurfaceLoading(browser);
    await testGlobalNavigation(browser);
    await testSites(browser);
    await testKpis(browser);
    await testDecisions(browser);
    await testReviews(browser);
    await testAuditAndAdmin(browser);
    await testRequiredStates(browser);
    await testResponsive(browser, 1440, 960, 'desktop');
    await testResponsive(browser, 900, 1024, 'tablet');
    await testResponsive(browser, 390, 844, 'mobile');
    await testKeyboardAndRtl(browser);

    assert.deepEqual(consoleErrors, [], `Application console errors:\n${consoleErrors.join('\n')}`);
    assert.deepEqual(pageErrors, [], `Application page errors:\n${pageErrors.join('\n')}`);
    record('Application console errors', 'NONE');
    record('Application page errors', 'NONE');
    console.log(`[COMPLETION_BROWSER] SUMMARY ${JSON.stringify(results)}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error('[COMPLETION_BROWSER] FAILURE', error);
  process.exitCode = 1;
});
