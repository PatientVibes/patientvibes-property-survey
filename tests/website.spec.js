const { test, expect } = require('@playwright/test');

test.describe('PatientVibes Property Survey Platform', () => {
  test.beforeEach(async ({ page }) => {
    // Test against the local file since we're testing functionality
    await page.goto('file://' + __dirname + '/../index.html');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load page with proper title and header', async ({ page }) => {
    await expect(page).toHaveTitle(/Advanced Property Survey/);
    await expect(page.locator('.logo')).toContainText('PatientVibes.io');
    await expect(page.locator('.hero h1')).toContainText('Advanced Property Survey');
  });

  test('should have working navigation links', async ({ page }) => {
    // Test smooth scrolling navigation
    const navLinks = [
      { href: '#overview', section: '.hero' },
      { href: '#maps', section: '.map-section' },
      { href: '#layers', section: '.layer-controls' },
      { href: '#reports', section: '.reports-section' },
      { href: '#export', section: '.export-section' }
    ];

    for (const link of navLinks) {
      await page.click(`nav a[href="${link.href}"]`);
      await page.waitForTimeout(500); // Wait for smooth scroll
      // Check that the section is visible
      await expect(page.locator(link.section)).toBeInViewport();
    }
  });

  test('should initialize map properly', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(2000);
    
    // Check if Leaflet map container exists and has proper height
    const mapContainer = page.locator('#leaflet-map');
    await expect(mapContainer).toBeVisible();
    
    // Check if map tiles are loading (look for leaflet classes)
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();
  });

  test('should have working layer controls', async ({ page }) => {
    await page.waitForTimeout(2000); // Wait for map initialization
    
    // Test layer checkboxes
    const layerCheckboxes = [
      '#property-boundary',
      '#flood-zones',
      '#zoning',
      '#council-districts',
      '#contours',
      '#impervious',
      '#streets'
    ];

    for (const checkbox of layerCheckboxes) {
      const element = page.locator(checkbox);
      await expect(element).toBeVisible();
      
      // Test checking/unchecking
      await element.check();
      await expect(element).toBeChecked();
      
      await element.uncheck();
      await expect(element).not.toBeChecked();
    }
  });

  test('should have working map tab switching', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Test map tabs
    const tabs = [
      { tab: 'Satellite', mapId: '#leaflet-map' },
      { tab: 'Google Maps', mapId: '#google-map' },
      { tab: 'Terrain', mapId: '#leaflet-map' }
    ];

    for (const tabInfo of tabs) {
      await page.click(`button:has-text("${tabInfo.tab}")`);
      await page.waitForTimeout(500);
      
      // Check if the correct map is visible
      if (tabInfo.tab === 'Google Maps') {
        await expect(page.locator('#google-map')).toBeVisible();
        await expect(page.locator('#leaflet-map')).toBeHidden();
      } else {
        await expect(page.locator('#leaflet-map')).toBeVisible();
        await expect(page.locator('#google-map')).toBeHidden();
      }
    }
  });

  test('should have working report links', async ({ page }) => {
    const reportLinks = [
      'assets/complete_comprehensive_report.html',
      'assets/precision_boundary_report.html',
      'assets/comprehensive_property_report.html',
      'assets/precision_boundary_map.html'
    ];

    for (const link of reportLinks) {
      const reportLink = page.locator(`a[href="${link}"]`);
      await expect(reportLink).toBeVisible();
      await expect(reportLink).toHaveAttribute('target', '_blank');
    }
  });

  test('should have working export buttons', async ({ page }) => {
    // Test KML export link
    const kmlLink = page.locator('a[href="assets/property_7309_main.kml"]');
    await expect(kmlLink).toBeVisible();
    await expect(kmlLink).toHaveAttribute('download');

    // Test GeoJSON export link
    const jsonLink = page.locator('a[href="assets/property_web_map.geojson"]');
    await expect(jsonLink).toBeVisible();
    await expect(jsonLink).toHaveAttribute('download');

    // Test PDF export button (should be clickable)
    const pdfButton = page.locator('a[onclick="exportToPDF()"]');
    await expect(pdfButton).toBeVisible();

    // Test All Reports button (should be clickable)
    const reportsButton = page.locator('a[onclick="openReports()"]');
    await expect(reportsButton).toBeVisible();
  });

  test('should zoom controls work properly', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check if zoom controls exist
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    
    // Test zoom in (multiple clicks to test max zoom limit)
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }
    
    // Test zoom out
    for (let i = 0; i < 3; i++) {
      await zoomOut.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display property details correctly', async ({ page }) => {
    // Check property details section
    const propertyDetails = page.locator('.property-details');
    await expect(propertyDetails).toBeVisible();

    // Check specific property information
    const details = [
      '7309 Main St',
      'Moore, Christopher & Gina',
      '112860',
      '6,106.02 sq ft',
      'R-5 Residential',
      '6th District',
      '$43,981',
      '±3 feet'
    ];

    for (const detail of details) {
      await expect(propertyDetails).toContainText(detail);
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.main-content')).toHaveCSS('display', 'grid');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Navigation should be hidden on mobile
    const navLinks = page.locator('.nav-links');
    const styles = await navLinks.evaluate(el => window.getComputedStyle(el));
    expect(styles.display).toBe('none');
  });

  test('should load external libraries correctly', async ({ page }) => {
    // Check if Leaflet is loaded
    const leafletLoaded = await page.evaluate(() => {
      return typeof window.L !== 'undefined';
    });
    expect(leafletLoaded).toBe(true);

    // Check if Chart.js is loaded
    const chartLoaded = await page.evaluate(() => {
      return typeof window.Chart !== 'undefined';
    });
    expect(chartLoaded).toBe(true);
  });

  test('should have working analytics tracking', async ({ page }) => {
    // Test if trackEvent function exists
    const trackEventExists = await page.evaluate(() => {
      return typeof window.trackEvent === 'function';
    });
    expect(trackEventExists).toBe(true);
  });

  test('should handle layer legend updates', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check if legend exists
    const legend = page.locator('#legend');
    await expect(legend).toBeVisible();
    
    // Check if legend content updates when layers are toggled
    const legendContent = page.locator('#legend-content');
    
    // Toggle a layer and check legend updates
    await page.check('#flood-zones');
    await page.waitForTimeout(500);
    
    // Legend should show active layer
    await expect(legendContent).toContainText('Flood Zones');
  });
});

test.describe('Map Functionality Issues', () => {
  test('should handle maximum zoom level correctly', async ({ page }) => {
    await page.goto('file://' + __dirname + '/../index.html');
    await page.waitForTimeout(2000);
    
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    
    // Click zoom in multiple times until max zoom is reached
    let clickCount = 0;
    while (clickCount < 15) {
      const isEnabled = await zoomIn.evaluate(el => !el.classList.contains('leaflet-disabled'));
      if (!isEnabled) {
        break; // Max zoom reached
      }
      await zoomIn.click();
      await page.waitForTimeout(200);
      clickCount++;
    }
    
    // At max zoom, zoom-in button should be disabled
    await expect(zoomIn).toHaveClass(/leaflet-disabled/);
    
    // Map tiles should still be visible at max zoom
    const mapTiles = page.locator('.leaflet-tile');
    const tileCount = await mapTiles.count();
    expect(tileCount).toBeGreaterThan(0);
    
    // Map container should still be visible
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('should handle missing GeoJSON files gracefully', async ({ page }) => {
    await page.goto('file://' + __dirname + '/../index.html');
    await page.waitForTimeout(3000);
    
    // Check console for any 404 errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Map should still be functional even if some layers fail to load
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});