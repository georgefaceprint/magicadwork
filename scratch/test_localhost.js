import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOCAL LOG:', msg.text()));
  
  await page.goto('http://localhost:5174/');
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find(b => b.textContent.includes('Login / Join') || b.textContent.includes('LOGIN / JOIN'));
    if (loginBtn) loginBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.type('input[type="email"]', 'tnklf@icloud.com');
  await page.type('input[type="password"]', 'Lucas&Kaleb@12');
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find(b => b.textContent === 'Sign In' && b.type === 'submit');
    if (signInBtn) signInBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const navbarText = await page.evaluate(() => document.querySelector('.desktop-nav').textContent);
  console.log("Navbar Text on Localhost:", navbarText);
  
  await browser.close();
})();
