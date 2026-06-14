import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.goto('http://localhost:5174/');
  
  await page.evaluate(() => {
    const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Login / Join') || b.textContent.includes('LOGIN / JOIN'));
    if (loginBtn) loginBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.type('input[type="email"]', 'tnklf@icloud.com');
  await page.type('input[type="password"]', 'Lucas&Kaleb@12');
  
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.click();
    }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const text = await page.evaluate(() => document.body.textContent);
  console.log("Admin Portal found?", text.includes("Admin Portal"));
  
  await browser.close();
})();
