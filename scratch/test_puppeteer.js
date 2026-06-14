import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://magicadwork.vercel.app/');
  
  console.log("Page loaded. Clicking Login/Join...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find(b => b.textContent.includes('Login / Join') || b.textContent.includes('LOGIN / JOIN'));
    if (loginBtn) loginBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.type('input[type="email"]', 'tnklf@icloud.com');
  await page.type('input[type="password"]', 'Lucas&Kaleb@12');
  
  console.log("Clicking Sign In...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find(b => b.textContent === 'Sign In' && b.type === 'submit');
    if (signInBtn) signInBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'scratch/screenshot.png' });
  
  const errorMsg = await page.evaluate(() => {
    const err = document.querySelector('form').previousElementSibling;
    return err ? err.textContent : 'No error message';
  });
  console.log("Error MSG:", errorMsg);
  
  const navbarText = await page.evaluate(() => document.querySelector('.desktop-nav').textContent);
  console.log("Navbar Text:", navbarText);
  
  await browser.close();
})();
