const { test, expect } = require('@playwright/test');

test.describe('Google Integration Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + __dirname + '/../index.html');
    await page.waitForLoadState('networkidle');
  });

  test('should have Google Earth integration buttons', async ({ page }) => {
    // Check for Google Earth KML download
    const kmlDownload = page.locator('a[href="assets/property_7309_main.kml"]');
    await expect(kmlDownload).toBeVisible();
    await expect(kmlDownload).toHaveAttribute('download');

    // Check for Google Earth Web button
    const earthWebButton = page.locator('a[onclick="openGoogleEarth()"]');
    await expect(earthWebButton).toBeVisible();
    await expect(earthWebButton).toContainText('Open in Google Earth');
  });

  test('should have Google Maps integration button', async ({ page }) => {
    const googleMapsButton = page.locator('a[onclick="openGoogleMaps()"]');
    await expect(googleMapsButton).toBeVisible();
    await expect(googleMapsButton).toContainText('Open in Google Maps');
  });

  test('should open Google Earth when clicked', async ({ page }) => {
    // Mock window.open to capture the URL
    await page.addInitScript(() => {
      window.openedUrls = [];
      window.open = (url, target) => {
        window.openedUrls.push(url);
        return { document: { write: () => {} } };
      };
    });

    await page.reload();
    await page.waitForTimeout(1000);
    await page.click('a[onclick="openGoogleEarth()"]');
    
    const openedUrls = await page.evaluate(() => window.openedUrls);
    expect(openedUrls.length).toBeGreaterThan(0);
    expect(openedUrls[0]).toContain('earth.google.com');
    expect(openedUrls[0]).toContain('7309%20Main%20St%2C%20Kansas%20City%2C%20MO');
  });

  test('should open Google Maps when clicked', async ({ page }) => {
    // Mock window.open to capture the URL
    await page.addInitScript(() => {
      window.openedUrls = [];
      window.open = (url, target) => {
        window.openedUrls.push(url);
        return { document: { write: () => {} } };
      };
    });

    await page.reload();
    await page.waitForTimeout(1000);
    await page.click('a[onclick="openGoogleMaps()"]');
    
    const openedUrls = await page.evaluate(() => window.openedUrls);
    expect(openedUrls.length).toBeGreaterThan(0);
    expect(openedUrls[0]).toContain('google.com/maps');
    expect(openedUrls[0]).toContain('38.995357,-94.589056');
  });

  test('should initialize Google Maps in map tab', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Click Google Maps tab
    await page.click('button:has-text("Google Maps")');
    await page.waitForTimeout(1000);
    
    // Google map container should be visible
    await expect(page.locator('#google-map')).toBeVisible();
    await expect(page.locator('#leaflet-map')).toBeHidden();
  });

  test('should have all export options available', async ({ page }) => {
    const exportSection = page.locator('.export-section');
    await expect(exportSection).toBeVisible();

    // Check all export buttons exist
    const exportButtons = [
      { text: 'Google Earth KML', type: 'download' },
      { text: 'Open in Google Earth', type: 'function' },
      { text: 'GeoJSON', type: 'download' },
      { text: 'PDF Report', type: 'function' },
      { text: 'All Reports', type: 'function' },
      { text: 'Open in Google Maps', type: 'function' }
    ];

    for (const button of exportButtons) {
      const buttonElement = page.locator(`.export-btn:has-text("${button.text}")`);
      await expect(buttonElement).toBeVisible();
    }
  });

  test('should have trackEvent function available', async ({ page }) => {
    // Check if trackEvent function exists
    const trackEventExists = await page.evaluate(() => {
      return typeof window.trackEvent === 'function';
    });
    expect(trackEventExists).toBe(true);
  });
});