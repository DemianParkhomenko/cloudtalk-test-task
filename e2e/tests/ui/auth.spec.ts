import { test, expect } from '@playwright/test';
import { ui } from './ui';

test.describe('Authentication', () => {
  test.describe('Register page', () => {
    test('should display register form', async ({ page }) => {
      await page.goto(`${ui.appUrl}/register`);
      await expect(page.getByText('Join Todo list')).toBeVisible();
      await expect(ui.auth.emailInput(page)).toBeVisible();
      await expect(ui.auth.passwordInput(page)).toBeVisible();
    });

    test('should register a new user and redirect to board', async ({ page }) => {
      await ui.auth.register(page, ui.randomEmail());
    });

    test('should show error for duplicate email', async ({ page }) => {
      const email = ui.randomEmail();

      // Register first
      await ui.auth.register(page, email);

      // Try again with same email
      await page.goto(`${ui.appUrl}/register`);
      await ui.auth.emailInput(page).fill(email);
      await ui.auth.passwordInput(page).fill('password123');
      await page.getByRole('button', { name: 'Create account' }).click();

      await expect(page.getByRole('alert')).toBeVisible();
    });
  });

  test.describe('Login page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto(`${ui.appUrl}/login`);
      await expect(page.getByText('Sign in to Todo list')).toBeVisible();
      await expect(ui.auth.emailInput(page)).toBeVisible();
      await expect(ui.auth.passwordInput(page)).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      const email = ui.randomEmail();
      const password = 'mypassword123';

      // Register first
      await ui.auth.register(page, email, password);

      // Logout
      await page.getByRole('button', { name: 'Sign out' }).click();
      await expect(page).toHaveURL(`${ui.appUrl}/login`, { timeout: 10_000 });

      // Login
      await ui.auth.login(page, email, password);
    });

    test('should show error for wrong password', async ({ page }) => {
      const email = ui.randomEmail();

      // Register
      await ui.auth.register(page, email, 'correctpassword');

      // Logout and try wrong password
      await page.getByRole('button', { name: 'Sign out' }).click();
      await ui.auth.login(page, email, 'wrongpassword', false);

      await expect(page.getByRole('alert')).toBeVisible();
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto(`${ui.appUrl}/`);
      await expect(page).toHaveURL(new RegExp('/login'), { timeout: 10_000 });
    });

    test('should navigate to register from login page', async ({ page }) => {
      await page.goto(`${ui.appUrl}/login`);
      await page.getByRole('link', { name: 'Create account' }).click();
      await expect(page).toHaveURL(`${ui.appUrl}/register`);
    });
  });
});
