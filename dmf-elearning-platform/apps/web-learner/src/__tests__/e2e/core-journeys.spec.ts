/**
 * Playwright E2E Tests — Post-Masterplan Step 5
 * 3 core journeys: Register → Learn → Dashboard
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ─── Journey 1: Registration + Onboarding ───

test.describe('Journey 1: Registration', () => {
    test('should load the homepage', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/DMF/i);
    });

    test('should navigate to auth page', async ({ page }) => {
        await page.goto(BASE_URL);
        // Look for login/register link
        const authLink = page.getByRole('link', { name: /anmelden|login|registrieren/i });
        if (await authLink.isVisible()) {
            await authLink.click();
            await expect(page.url()).toContain('auth');
        }
    });

    test('should show registration form', async ({ page }) => {
        await page.goto(`${BASE_URL}/auth`);
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });
});

// ─── Journey 2: Learning Flow ───

test.describe('Journey 2: Learning Flow', () => {
    test('should navigate to vocabulary page', async ({ page }) => {
        await page.goto(`${BASE_URL}/learn`);
        // Check for skill tiles or vocabulary section
        await expect(page.locator('text=/wortschatz|vocabulary|từ vựng/i').first()).toBeVisible();
    });

    test('should navigate to reading page', async ({ page }) => {
        await page.goto(`${BASE_URL}/learn/reading`);
        await expect(page).toHaveURL(/reading/);
    });

    test('should navigate to grammar page', async ({ page }) => {
        await page.goto(`${BASE_URL}/learn/grammar`);
        await expect(page.locator('text=/grammatik|grammar/i').first()).toBeVisible();
    });

    test('should show grammar rules with level filter', async ({ page }) => {
        await page.goto(`${BASE_URL}/learn/grammar`);
        // Click A1 filter
        const a1Button = page.getByRole('button', { name: 'A1' });
        if (await a1Button.isVisible()) {
            await a1Button.click();
            await expect(page.locator('text=A1').first()).toBeVisible();
        }
    });
});

// ─── Journey 3: Dashboard + Gamification ───

test.describe('Journey 3: Dashboard', () => {
    test('should load CEFR dashboard', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/cefr`);
        await expect(page.locator('text=/CEFR|Niveau|Dashboard/i').first()).toBeVisible();
    });

    test('should show skill progress bars', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/cefr`);
        // Check for skill names
        const skills = ['Wortschatz', 'Lesen', 'Hören', 'Sprechen', 'Schreiben'];
        for (const skill of skills) {
            await expect(page.locator(`text=${skill}`).first()).toBeVisible();
        }
    });

    test('should navigate to leaderboard', async ({ page }) => {
        await page.goto(`${BASE_URL}/leaderboard`);
        await expect(page).toHaveURL(/leaderboard/);
    });

    test('should show 404 for non-existent page', async ({ page }) => {
        await page.goto(`${BASE_URL}/this-page-does-not-exist`);
        await expect(page.locator('text=/404|nicht gefunden/i').first()).toBeVisible();
    });

    test('should have correct meta tags', async ({ page }) => {
        await page.goto(BASE_URL);
        const title = await page.title();
        expect(title).toContain('DMF');
        const description = await page.getAttribute('meta[name="description"]', 'content');
        expect(description).toBeTruthy();
    });
});
