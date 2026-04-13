import { expect, type Locator, type Page } from '@playwright/test';

const APP_URL = process.env['APP_URL'] ?? 'http://localhost:4200';

function randomEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
}

function emailInput(page: Page) {
  return page.locator('app-input[formcontrolname="email"] input');
}

function passwordInput(page: Page) {
  return page.locator('app-input[formcontrolname="password"] input');
}

function listNameInput(page: Page) {
  return page.locator('app-input[formcontrolname="name"] input');
}

function taskTitleInput(page: Page) {
  return page.locator('app-input[formcontrolname="title"] input');
}

function sidebarListItem(page: Page, name: string) {
  return page.locator('.sidebar__item-name').filter({ hasText: name });
}

function columnTitle(page: Page, name: string) {
  return page.locator('.column__title').filter({ hasText: name });
}

function taskTitle(page: Page, title: string) {
  return page.locator('.task-item__title').filter({ hasText: title });
}

async function register(page: Page, email: string, password = 'password123') {
  await page.goto(`${APP_URL}/register`);
  await emailInput(page).fill(email);
  await passwordInput(page).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(`${APP_URL}/`, { timeout: 10_000 });
}

async function login(page: Page, email: string, password: string, shouldRedirect = true) {
  await page.goto(`${APP_URL}/login`);
  await emailInput(page).fill(email);
  await passwordInput(page).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  if (shouldRedirect) {
    await expect(page).toHaveURL(`${APP_URL}/`, { timeout: 10_000 });
  }
}

async function registerAndLogin(page: Page, password = 'password123') {
  const email = randomEmail();
  await register(page, email, password);
  return email;
}

async function openCreateListDialog(page: Page) {
  const hasEmptyState = await page.getByText('No task lists yet').isVisible();

  if (hasEmptyState) {
    await page.getByRole('button', { name: 'Create a list' }).click();
    return;
  }

  await page.locator('.sidebar__create-btn').click();
}

async function createList(page: Page, name: string) {
  await openCreateListDialog(page);
  await listNameInput(page).fill(name);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(columnTitle(page, name)).toBeVisible();
}

type TaskScope = Page | Locator;

async function openCreateTaskForm(scope: TaskScope) {
  await scope.locator('.column__add-btn').click();
}

async function createTask(page: Page, title: string) {
  await openCreateTaskForm(page);
  await page.locator('.create-task__input').first().fill(title);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(taskTitle(page, title)).toBeVisible();
}

async function createTaskInColumn(column: Locator, title: string) {
  await openCreateTaskForm(column);
  await column.locator('.create-task__input').first().fill(title);
  await column.page().getByRole('button', { name: 'Add', exact: true }).click();
  await expect(taskTitle(column.page(), title)).toBeVisible();
}

async function dragColumnHandle(source: Locator, target: Locator) {
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Unable to resolve drag handles for list reordering');
  }

  const page = source.page();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 15,
  });
  await page.mouse.up();
}

export const ui = {
  appUrl: APP_URL,
  randomEmail,
  auth: {
    emailInput,
    passwordInput,
    register,
    login,
    registerAndLogin,
  },
  board: {
    listNameInput,
    sidebarListItem,
    columnTitle,
    openCreateListDialog,
    createList,
    dragColumnHandle,
  },
  task: {
    taskTitleInput,
    taskTitle,
    openCreateTaskForm,
    createTask,
    createTaskInColumn,
  },
};
