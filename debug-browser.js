
const { chromium } = require('playwright');

async function debugSaveBrowser() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/sitemanager');

    // 1. Login
    await page.fill('input[type="email"]', 'tanzeem@dmin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/sitemanager**');
    console.log("Logged in successfully.");

    // 2. Go to settings
    await page.goto('http://localhost:3000/sitemanager?section=settings');
    await page.waitForSelector('text=Deploy Identity Matrix');
    console.log("On settings page.");

    // 3. Monitor console
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('requestfailed', request => console.log('BROWSER REQ FAILED:', request.url(), request.failure().errorText));
    
    // Monitor network responses
    page.on('response', async response => {
        if (response.url().includes('/api/settings') && response.request().method() === 'PUT') {
            console.log('BROWSER API RESP:', response.status(), await response.text().catch(() => 'NO BODY'));
        }
    });

    // 4. Trigger save
    console.log("Clicking save...");
    await page.click('text=Deploy Identity Matrix');

    // Wait for toast or error
    await page.waitForTimeout(5000);
    
    await browser.close();
}

debugSaveBrowser().catch(console.error);
