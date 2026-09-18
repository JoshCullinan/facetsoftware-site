#!/usr/bin/env node
// Renders the link-preview cards (scripts/og/*.html → img/og-*.png) with headless Chrome.
// Puppeteer is not a dependency of this site; borrow the Lab repo's copy:
//
//   node scripts/og/render.mjs ~/Dev/Lab
//
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const lab = process.argv[2];
if (!lab) { console.error('usage: node scripts/og/render.mjs /path/to/Lab'); process.exit(1); }
const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '../..');
const puppeteer = createRequire(join(resolve(lab), 'package.json'))('puppeteer');

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  // Force the light palette: the logo SVG follows prefers-color-scheme, the card does not.
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  for (const name of ['company', 'deltalab']) {
    await page.goto(pathToFileURL(join(here, `${name}.html`)).href, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(site, 'img', `og-${name}.png`), type: 'png' });
    console.log(`img/og-${name}.png`);
  }
} finally {
  await browser.close();
}
