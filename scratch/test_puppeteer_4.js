import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://magicadwork.vercel.app/');
  
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
  
  await new Promise(r => setTimeout(r, 2000));
  
  const btnHTML = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find(b => b.type === 'submit' || b.textContent === 'Processing...');
    return signInBtn ? signInBtn.outerHTML : 'No submit btn';
  });
  console.log("Button HTML:", btnHTML);
  
  await browser.close();
})();
