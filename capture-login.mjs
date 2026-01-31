import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('Waiting for page to be fully loaded...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const screenshotPath = join(__dirname, 'dmf-login-final.png');
    console.log('Taking screenshot...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
