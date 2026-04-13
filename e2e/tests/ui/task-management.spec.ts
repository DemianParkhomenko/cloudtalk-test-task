import { test, expect } from '@playwright/test';
import { ui } from './ui';

test.describe('Task Management', () => {
  test('should add a task to a list', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await ui.board.createList(page, 'My Tasks');

    await ui.task.createTask(page, 'Buy groceries');
  });

  test('should complete a task', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await ui.board.createList(page, 'My Tasks');

    await ui.task.createTask(page, 'Complete me');

    await page.locator('.checkbox').first().click();
    await expect(page.locator('.task-item--completed')).toBeVisible();
  });

  test('should edit a task', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await ui.board.createList(page, 'My Tasks');

    await ui.task.createTask(page, 'Original title');

    await page.locator('.task-item__content').first().click();
    await expect(page.getByText('Edit task')).toBeVisible();

    await ui.task.taskTitleInput(page).clear();
    await ui.task.taskTitleInput(page).fill('Updated title');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(ui.task.taskTitle(page, 'Updated title')).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await ui.board.createList(page, 'My Tasks');

    await ui.task.createTask(page, 'Delete me');

    await page.locator('.task-item').first().hover();
    await page.locator('.task-item__menu-btn').first().click();
    await page.getByText('Delete task').click();

    await expect(ui.task.taskTitle(page, 'Delete me')).not.toBeVisible({ timeout: 5000 });
  });

  test('should move task to another list via context menu', async ({ page }) => {
    await ui.auth.registerAndLogin(page);
    await ui.board.createList(page, 'List A');
    await ui.board.createList(page, 'List B');

    const columns = page.locator('.column');
    const firstColumn = columns.first();
    await ui.task.createTaskInColumn(firstColumn, 'Move me');

    await page.locator('.task-item').first().hover();
    await page.locator('.task-item__menu-btn').first().click();
    await page.getByText(/Move to "List B"/).click();

    const secondColumn = columns.nth(1);
    await expect(secondColumn.locator('.task-item__title').filter({ hasText: 'Move me' })).toBeVisible({ timeout: 5000 });
  });
});
