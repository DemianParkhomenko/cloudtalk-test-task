import { test, expect } from '@playwright/test';
import { ui } from './ui';

test.describe('Task Board', () => {
  test('should show empty state when no lists', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await expect(page.getByText('No task lists yet')).toBeVisible();
  });

  test('should create a new task list', async ({ page }) => {
    await ui.auth.registerAndLogin(page);

    await ui.board.openCreateListDialog(page);
    await expect(page.getByRole('heading', { name: 'Create new list' })).toBeVisible();

    await ui.board.listNameInput(page).fill('Work Tasks');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(ui.board.sidebarListItem(page, 'Work Tasks')).toBeVisible();
  });

  test('should show list in sidebar after creation', async ({ page }) => {
    await ui.auth.registerAndLogin(page);

    await ui.board.openCreateListDialog(page);
    await ui.board.listNameInput(page).fill('Personal');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    const sidebar = page.locator('.sidebar');
    await expect(sidebar.getByText('Personal')).toBeVisible();
  });

  test('should rename a task list', async ({ page }) => {
    await ui.auth.registerAndLogin(page);

    await ui.board.openCreateListDialog(page);
    await ui.board.listNameInput(page).fill('Old Name');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(ui.board.sidebarListItem(page, 'Old Name')).toBeVisible();

    await page.locator('.column__menu-btn').first().click();
    await page.getByText('Rename list').click();

    await ui.board.listNameInput(page).fill('New Name');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(ui.board.sidebarListItem(page, 'New Name')).toBeVisible();
  });

  test('should delete a task list', async ({ page }) => {
    await ui.auth.registerAndLogin(page);

    await ui.board.openCreateListDialog(page);
    await ui.board.listNameInput(page).fill('Delete Me');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(ui.board.sidebarListItem(page, 'Delete Me')).toBeVisible();

    await page.locator('.column__menu-btn').first().click();
    await page.getByText('Delete list').click();

    await expect(ui.board.sidebarListItem(page, 'Delete Me')).toHaveCount(0, { timeout: 5000 });
  });

  test('should reorder columns by drag and keep order after reload', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await ui.board.createList(page, 'List One');
    await ui.board.createList(page, 'List Two');

    await ui.board.dragColumnHandle(
      page.locator('.board__column-item .column__drag-handle').first(),
      page.locator('.board__column-item .column__drag-handle').nth(1),
    );

    const firstTitleAfterDrag = page.locator('.board__column-item .column__title').first();
    await expect(firstTitleAfterDrag).toHaveText('List Two');

    await page.reload();
    await expect(page.locator('.board__column-item .column__title').first()).toHaveText('List Two');
  });
});
