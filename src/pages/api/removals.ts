// pages/api/lookup.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, city, state, age } = req.body;

  // Construct the URL
  const url = `https://www.advancedbackgroundchecks.com/names/${fullName.replace(
    ' ',
    '-'
  )}_${city}-${state}_age_${age}`;

  try {
    // Launch Puppeteer with stealth plugin
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a user agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    // Go to the target URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Extract content
    const pageContent = await page.content();

    // Close the browser
    await browser.close();

    // Respond with the extracted content
    return res.status(200).json({ url, content: pageContent });
  } catch (error) {
    console.error('Error scraping site:', error);
    return res.status(500).json({ message: 'Error scraping site', error: error.message });
  }
}
